import { NextResponse } from 'next/server';
import { inArray, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';

import { db } from '@/db';
import { users } from '@/db/schema';
import { AuthError, requireAdminOrMember } from '@/lib/auth';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_ROWS = 10_000;

const BCRYPT_ROUNDS = 10;
const BCRYPT_CONCURRENCY = 4;

const INSERT_BATCH_SIZE = 100;
const CID_QUERY_BATCH_SIZE = 500;

// =========================================================
// TYPES
// =========================================================

type ExcelRow = {
  cid?: unknown;
  prefix?: unknown;
  first_name?: unknown;
  last_name?: unknown;
  phone?: unknown;
  dep_id?: unknown;
  ps_id?: unknown;
};

type ValidRow = {
  rowNumber: number;

  cid: string;

  prefix: string | null;
  firstName: string | null;
  lastName: string | null;

  phone: string | null;

  depId: number | null;
  psId: number | null;
};

type ImportError = {
  row: number;
  cid?: string;
  message: string;
};

type InsertUser = {
  cid: string;

  prefix: string | null;
  first_name: string | null;
  last_name: string | null;

  phone: string | null;

  dep_id: number | null;
  ps_id: number | null;

  password: string;

  status: 'active';
  statusLevel: 'user';

  system_id: number;

  mustChangePassword: boolean;
};

// =========================================================
// HELPERS
// =========================================================

function toText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function normalizeCid(value: unknown): string {
  return toText(value).replace(/\D/g, '');
}

function normalizePhone(value: unknown): string | null {
  const phone = toText(value).replace(/\D/g, '');

  if (!phone) {
    return null;
  }

  return phone;
}

function normalizeNullableInt(value: unknown): number | null {
  const text = toText(value);

  if (!text) {
    return null;
  }

  const number = Number(text);

  if (!Number.isInteger(number) || number <= 0) {
    return null;
  }

  return number;
}

function isAllowedExcelFile(file: File): boolean {
  const fileName = file.name.toLowerCase();

  return fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);

  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (true) {
      const currentIndex = nextIndex;

      if (currentIndex >= items.length) {
        return;
      }

      nextIndex += 1;

      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.min(concurrency, items.length);

  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

// =========================================================
// POST
// =========================================================

export async function POST(request: Request) {
  try {
    console.time('USER_IMPORT_TOTAL');

    await requireAdminOrMember(request);

    // =======================================================
    // FORM DATA
    // =======================================================

    const formData = await request.formData();

    const fileValue = formData.get('file');

    if (!(fileValue instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาเลือกไฟล์ Excel',
        },
        {
          status: 400,
        },
      );
    }

    const file = fileValue;

    // =======================================================
    // VALIDATE FILE
    // =======================================================

    if (!isAllowedExcelFile(file)) {
      return NextResponse.json(
        {
          success: false,
          message: 'รองรับเฉพาะไฟล์ .xlsx และ .xls',
        },
        {
          status: 400,
        },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไฟล์ Excel ไม่มีข้อมูล',
        },
        {
          status: 400,
        },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไฟล์มีขนาดใหญ่เกิน 10 MB',
        },
        {
          status: 400,
        },
      );
    }

    // =======================================================
    // READ EXCEL
    // =======================================================

    const arrayBuffer = await file.arrayBuffer();

    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
    });

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบ Worksheet ในไฟล์ Excel',
        },
        {
          status: 400,
        },
      );
    }

    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่สามารถอ่าน Worksheet ได้',
        },
        {
          status: 400,
        },
      );
    }

    const rawRows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      defval: '',
      raw: false,
    });

    const firstRow = rawRows[0] ?? [];

    const headers = firstRow.map((value) => String(value).trim().toLowerCase());

    const requiredHeaders = [
      'cid',
      'prefix',
      'first_name',
      'last_name',
      'phone',
      'dep_id',
      'ps_id',
    ];

    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header),
    );

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `รูปแบบไฟล์ Excel ไม่ถูกต้อง ไม่พบคอลัมน์: ${missingHeaders.join(
            ', ',
          )}`,
        },
        {
          status: 400,
        },
      );
    }

    const allRows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
      defval: '',
      raw: false,
    });

    const excelRows = allRows.slice(1);

    // =======================================================
    // ROW COUNT
    // =======================================================

    if (excelRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลผู้ใช้งานตั้งแต่แถวที่ 3 เป็นต้นไป',
        },
        {
          status: 400,
        },
      );
    }

    if (excelRows.length > MAX_ROWS) {
      return NextResponse.json(
        {
          success: false,
          message: `นำเข้าได้สูงสุด ${MAX_ROWS.toLocaleString(
            'th-TH',
          )} รายการต่อครั้ง`,
        },
        {
          status: 400,
        },
      );
    }

    // =======================================================
    // NORMALIZE + VALIDATE
    // =======================================================

    const errors: ImportError[] = [];

    const validRows: ValidRow[] = [];

    const cidInFile = new Set<string>();

    excelRows.forEach((row, index) => {
      const rowNumber = index + 3;

      const cid = normalizeCid(row.cid);

      if (!cid) {
        errors.push({
          row: rowNumber,
          message: 'ไม่พบเลขบัตรประชาชน',
        });

        return;
      }

      if (!/^\d{13}$/.test(cid)) {
        errors.push({
          row: rowNumber,
          cid,
          message: 'เลขบัตรประชาชนต้องมี 13 หลัก',
        });

        return;
      }

      // ---------------------------------------------------
      // DUPLICATE CID IN EXCEL
      // ---------------------------------------------------

      if (cidInFile.has(cid)) {
        errors.push({
          row: rowNumber,
          cid,
          message: 'เลขบัตรประชาชนซ้ำภายในไฟล์ Excel',
        });

        return;
      }

      cidInFile.add(cid);

      // ---------------------------------------------------
      // TEXT
      // ---------------------------------------------------

      const prefix = toText(row.prefix) || null;

      const firstName = toText(row.first_name) || null;

      const lastName = toText(row.last_name) || null;

      // ---------------------------------------------------
      // PHONE
      // ---------------------------------------------------

      const phone = normalizePhone(row.phone);

      /*
       * ถ้ามีเบอร์โทร ต้องไม่เกิน 10 หลัก
       * ตาม schema varchar(10)
       */
      if (phone && phone.length > 10) {
        errors.push({
          row: rowNumber,
          cid,
          message: 'เบอร์โทรศัพท์ต้องไม่เกิน 10 หลัก',
        });

        return;
      }

      // ---------------------------------------------------
      // DEP / POSITION
      // ---------------------------------------------------

      const depText = toText(row.dep_id);

      const psText = toText(row.ps_id);

      const depId = normalizeNullableInt(row.dep_id);

      const psId = normalizeNullableInt(row.ps_id);

      /*
       * มีค่าใน Excel แต่ไม่ใช่ integer ที่ถูกต้อง
       */
      if (depText && depId === null) {
        errors.push({
          row: rowNumber,
          cid,
          message: 'dep_id ต้องเป็นเลขจำนวนเต็มมากกว่า 0',
        });

        return;
      }

      if (psText && psId === null) {
        errors.push({
          row: rowNumber,
          cid,
          message: 'ps_id ต้องเป็นเลขจำนวนเต็มมากกว่า 0',
        });

        return;
      }

      // ---------------------------------------------------
      // VALID
      // ---------------------------------------------------

      validRows.push({
        rowNumber,
        cid,
        prefix,
        firstName,
        lastName,
        phone,
        depId,
        psId,
      });
    });

    // =======================================================
    // NO VALID ROWS
    // =======================================================

    if (validRows.length === 0) {
      return NextResponse.json(
        {
          success: false,

          message: 'ไม่พบข้อมูลที่สามารถนำเข้าได้',

          total: excelRows.length,

          imported: 0,

          skipped: errors.length,

          errors,
        },
        {
          status: 400,
        },
      );
    }

    // =======================================================
    // CHECK EXISTING CID
    // =======================================================

    const existingCidSet = new Set<string>();

    const cidChunks = chunkArray(
      validRows.map((row) => row.cid),
      CID_QUERY_BATCH_SIZE,
    );

    for (const cidChunk of cidChunks) {
      const existingUsers = await db
        .select({
          cid: users.cid,
        })
        .from(users)
        .where(inArray(users.cid, cidChunk));

      for (const existingUser of existingUsers) {
        if (existingUser.cid) {
          existingCidSet.add(existingUser.cid);
        }
      }
    }

    // =======================================================
    // REMOVE EXISTING USERS
    // =======================================================

    const newRows: ValidRow[] = [];

    for (const row of validRows) {
      if (existingCidSet.has(row.cid)) {
        errors.push({
          row: row.rowNumber,
          cid: row.cid,
          message: 'เลขบัตรประชาชนมีอยู่ในระบบแล้ว',
        });

        continue;
      }

      newRows.push(row);
    }

    // =======================================================
    // NOTHING TO IMPORT
    // =======================================================

    if (newRows.length === 0) {
      return NextResponse.json({
        success: true,

        message: 'ไม่มีข้อมูลใหม่สำหรับนำเข้า',

        total: excelRows.length,

        imported: 0,

        skipped: errors.length,

        errors,
      });
    }

    // =======================================================
    // HASH PASSWORD
    // =======================================================

    console.log(`จำนวนข้อมูล Excel: ${excelRows.length}`);
    console.log(`ข้อมูลผ่าน validation: ${validRows.length}`);
    console.log(`ผู้ใช้ใหม่ที่ต้องนำเข้า: ${newRows.length}`);

    console.time('USER_IMPORT_BCRYPT');

    const preparedUsers = await mapWithConcurrency<ValidRow, InsertUser>(
      newRows,
      BCRYPT_CONCURRENCY,
      async (row, index) => {
        const hashedPassword = await bcrypt.hash(row.cid, BCRYPT_ROUNDS);

        const completed = index + 1;

        if (completed % 100 === 0 || completed === newRows.length) {
          console.log(`Hash password: ${completed}/${newRows.length}`);
        }

        return {
          cid: row.cid,
          prefix: row.prefix,
          first_name: row.firstName,
          last_name: row.lastName,
          phone: row.phone,
          dep_id: row.depId,
          ps_id: row.psId,
          password: hashedPassword,
          status: 'active',
          statusLevel: 'user',
          system_id: 1,
          mustChangePassword: true,
        };
      },
    );

    console.timeEnd('USER_IMPORT_BCRYPT');

    console.log(`Hash password สำเร็จ ${preparedUsers.length} รายการ`);

    // =======================================================
    // INSERT
    // =======================================================

    console.time('USER_IMPORT_DATABASE');

    const insertedIds: number[] = [];

    const insertChunks = chunkArray(preparedUsers, INSERT_BATCH_SIZE);

    await db.transaction(async (tx) => {
      for (const insertChunk of insertChunks) {
        const result = await tx.insert(users).values(insertChunk);

        const firstInsertId = Number(result[0].insertId);
        const affectedRows = Number(result[0].affectedRows);

        if (
          !Number.isInteger(firstInsertId) ||
          firstInsertId <= 0 ||
          !Number.isInteger(affectedRows) ||
          affectedRows <= 0
        ) {
          throw new Error('ไม่สามารถระบุ ID ของผู้ใช้งานที่นำเข้าได้');
        }

        for (let offset = 0; offset < affectedRows; offset += 1) {
          insertedIds.push(firstInsertId + offset);
        }
      }

      // user_code ทำเป็น batch
      for (const idChunk of chunkArray(insertedIds, 500)) {
        await tx
          .update(users)
          .set({
            user_code: sql`LPAD(${users.id}, 5, '0')`,
          })
          .where(inArray(users.id, idChunk));
      }
    });

    console.timeEnd('USER_IMPORT_DATABASE');
    console.timeEnd('USER_IMPORT_TOTAL');

    // =======================================================
    // SUCCESS
    // =======================================================

    return NextResponse.json({
      success: true,

      message: `นำเข้าผู้ใช้งานสำเร็จ ${insertedIds.length.toLocaleString(
        'th-TH',
      )} รายการ`,

      total: excelRows.length,

      imported: insertedIds.length,

      skipped: errors.length,

      errors,
    });
  } catch (error: unknown) {
    // =======================================================
    // AUTH
    // =======================================================

    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: error.status,
        },
      );
    }

    // =======================================================
    // UNKNOWN
    // =======================================================

    console.error('POST /api/users/import error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูลผู้ใช้งาน',
      },
      {
        status: 500,
      },
    );
  }
}
