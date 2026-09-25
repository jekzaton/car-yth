import fs from 'fs/promises';
import path from 'path';

import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

import { db } from '@/db';
import { profile_img } from '@/db/schema/profile_img';

import { AuthError, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ============================================================
// CONFIG
// ============================================================

const PROFILE_DIRECTORY = path.join(
  process.cwd(),
  'public',
  'images',
  'profiles',
);

// ไฟล์ต้นฉบับสูงสุด 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// รูป Profile หลัง Resize
const PROFILE_SIZE = 512;

// WebP quality
const WEBP_QUALITY = 82;

// ============================================================
// AUTH ERROR
// ============================================================

function handleAuthError(error: unknown) {
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

  return null;
}

// ============================================================
// ALLOWED IMAGE TYPES
// ============================================================

function isAllowedImageType(file: File): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
}

// ============================================================
// DELETE PHYSICAL FILE
// ============================================================

async function deleteProfileFile(imagePath: string | null | undefined) {
  if (!imagePath) return;

  // ลบได้เฉพาะ /images/profiles/
  if (!imagePath.startsWith('/images/profiles/')) {
    return;
  }

  const relativePath = imagePath.replace(/^\/+/, '');

  const absolutePath = path.join(process.cwd(), 'public', relativePath);

  const normalizedPath = path.resolve(absolutePath);

  const normalizedDirectory = path.resolve(PROFILE_DIRECTORY);

  // ป้องกัน path traversal
  if (!normalizedPath.startsWith(`${normalizedDirectory}${path.sep}`)) {
    return;
  }

  try {
    await fs.unlink(normalizedPath);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    // หาไฟล์ไม่เจอ ไม่ถือว่า error
    if (nodeError.code !== 'ENOENT') {
      console.error('Delete profile image error:', error);
    }
  }
}

// ============================================================
// GET
// GET /api/auth/profile/image
// ============================================================

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);

    const result = await db
      .select({
        id: profile_img.id,
        cid: profile_img.cid,
        images: profile_img.images,
      })
      .from(profile_img)
      .where(eq(profile_img.cid, authUser.cid))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: null,
        },
        {
          headers: {
            'Cache-Control': 'no-store',
          },
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result[0],
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    const authResponse = handleAuthError(error);

    if (authResponse) {
      return authResponse;
    }

    console.error('GET /api/auth/profile/image error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดรูปโปรไฟล์ได้',
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// POST
// เพิ่มรูปใหม่ / เปลี่ยนรูปเดิม
//
// POST /api/auth/profile/image
//
// image:
// JPEG / PNG / WEBP
//
// ผลลัพธ์:
// 512 x 512 WebP
// ============================================================

export async function POST(req: NextRequest) {
  let savedFilePath: string | null = null;

  try {
    const authUser = await requireAuth(req);

    // ========================================================
    // FORM DATA
    // ========================================================

    const formData = await req.formData();

    const image = formData.get('image');

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาเลือกรูปโปรไฟล์',
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VALIDATE SIZE
    // ========================================================

    if (image.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไฟล์รูปภาพไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: 'รูปโปรไฟล์ต้องมีขนาดไม่เกิน 5 MB',
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VALIDATE MIME
    // ========================================================

    if (!isAllowedImageType(image)) {
      return NextResponse.json(
        {
          success: false,
          message: 'รองรับเฉพาะไฟล์ JPG, PNG และ WEBP',
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // FIND OLD PROFILE
    // ========================================================

    const oldProfile = await db
      .select({
        id: profile_img.id,
        images: profile_img.images,
      })
      .from(profile_img)
      .where(eq(profile_img.cid, authUser.cid))
      .limit(1);

    // ========================================================
    // CREATE DIRECTORY
    // ========================================================

    await fs.mkdir(PROFILE_DIRECTORY, {
      recursive: true,
    });

    // ========================================================
    // READ ORIGINAL IMAGE
    // ========================================================

    const arrayBuffer = await image.arrayBuffer();

    const originalBuffer = Buffer.from(arrayBuffer);

    // ========================================================
    // VALIDATE REAL IMAGE + RESIZE
    // ========================================================

    let resizedBuffer: Buffer;

    try {
      resizedBuffer = await sharp(originalBuffer, {
        failOn: 'error',
      })
        // หมุนภาพตาม EXIF อัตโนมัติ
        .rotate()

        // Resize เป็น Profile 512x512
        .resize(PROFILE_SIZE, PROFILE_SIZE, {
          fit: 'cover',
          position: 'centre',

          // ไม่ขยายรูปเล็กเกินต้นฉบับ
          withoutEnlargement: true,
        })

        // ลบ metadata เช่น EXIF/GPS
        // และแปลงทุกไฟล์เป็น WebP
        .webp({
          quality: WEBP_QUALITY,
          effort: 4,
        })

        .toBuffer();
    } catch (error) {
      console.error('Sharp image processing error:', error);

      return NextResponse.json(
        {
          success: false,
          message: 'ไฟล์ที่เลือกไม่ใช่รูปภาพที่ถูกต้อง หรือไฟล์เสียหาย',
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // FILE NAME
    // ========================================================

    /*
     * หลัง resize ทุกไฟล์เป็น WebP
     *
     * ตัวอย่าง:
     * 1234567890123-1758089000000.webp
     */

    const fileName = `${authUser.cid}-${Date.now()}.webp`;

    const absoluteFilePath = path.join(PROFILE_DIRECTORY, fileName);

    const publicImagePath = `/images/profiles/${fileName}`;

    // ========================================================
    // SAVE RESIZED IMAGE
    // ========================================================

    await fs.writeFile(absoluteFilePath, resizedBuffer);

    savedFilePath = publicImagePath;

    // ========================================================
    // INSERT / UPDATE DATABASE
    // ========================================================

    if (oldProfile.length > 0) {
      // มีข้อมูลอยู่แล้ว
      // UPDATE record เดิม

      await db
        .update(profile_img)
        .set({
          images: publicImagePath,
        })
        .where(eq(profile_img.id, oldProfile[0].id));
    } else {
      // ยังไม่มีรูป
      // INSERT record ใหม่

      await db.insert(profile_img).values({
        cid: authUser.cid,
        images: publicImagePath,
      });
    }

    // ========================================================
    // DELETE OLD IMAGE
    // ========================================================

    /*
     * ต้องทำหลัง UPDATE DB สำเร็จแล้ว
     *
     * ถ้า DB error
     * รูปเก่าจะยังอยู่
     */

    if (oldProfile.length > 0 && oldProfile[0].images !== publicImagePath) {
      await deleteProfileFile(oldProfile[0].images);
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,

      message:
        oldProfile.length > 0
          ? 'เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว'
          : 'เพิ่มรูปโปรไฟล์เรียบร้อยแล้ว',

      data: {
        id: oldProfile.length > 0 ? oldProfile[0].id : null,

        cid: authUser.cid,

        images: publicImagePath,

        width: PROFILE_SIZE,
        height: PROFILE_SIZE,

        format: 'webp',
      },
    });
  } catch (error) {
    /*
     * กรณี:
     *
     * 1. Resize สำเร็จ
     * 2. เขียนไฟล์สำเร็จ
     * 3. DB เกิด Error
     *
     * ต้องลบไฟล์ใหม่ออก
     */

    if (savedFilePath) {
      await deleteProfileFile(savedFilePath);
    }

    const authResponse = handleAuthError(error);

    if (authResponse) {
      return authResponse;
    }

    console.error('POST /api/auth/profile/image error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถบันทึกรูปโปรไฟล์ได้',
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// DELETE
// DELETE /api/auth/profile/image
// ============================================================

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);

    // ========================================================
    // FIND PROFILE
    // ========================================================

    const result = await db
      .select({
        id: profile_img.id,
        images: profile_img.images,
      })
      .from(profile_img)
      .where(eq(profile_img.cid, authUser.cid))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบรูปโปรไฟล์',
        },
        {
          status: 404,
        },
      );
    }

    const profile = result[0];

    // ========================================================
    // DELETE DATABASE
    // ========================================================

    await db.delete(profile_img).where(eq(profile_img.id, profile.id));

    // ========================================================
    // DELETE FILE
    // ========================================================

    await deleteProfileFile(profile.images);

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,
      message: 'ลบรูปโปรไฟล์เรียบร้อยแล้ว',
    });
  } catch (error) {
    const authResponse = handleAuthError(error);

    if (authResponse) {
      return authResponse;
    }

    console.error('DELETE /api/auth/profile/image error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถลบรูปโปรไฟล์ได้',
      },
      {
        status: 500,
      },
    );
  }
}
