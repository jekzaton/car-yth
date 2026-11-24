import { db } from '@/db';
import { cars, car_brand } from '@/db/schema';

import { NextResponse } from 'next/server';
import { eq, or } from 'drizzle-orm';

import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

import { AuthError, requireAdminOrMember } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// GET /api/cars
// ============================================================

export async function GET() {
  try {
    const carsList = await db
      .select({
        id: cars.id,
        carCode: cars.car_code,

        // รุ่นรถ / รุ่นย่อย
        carBrandSub: cars.car_brand,

        // ID ยี่ห้อรถ
        carBrandId: cars.car_brand_id,

        // ชื่อยี่ห้อรถจากตาราง car_brand
        carBrand: car_brand.car_brand_name,

        licensePlate: cars.license_plate,
        carImage: cars.car_image,
        status: cars.status,
      })
      .from(cars)
      .leftJoin(car_brand, eq(car_brand.car_brand_id, cars.car_brand_id));

    return NextResponse.json(
      {
        success: true,
        total: carsList.length,
        data: carsList,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error: unknown) {
    console.error('GET /api/cars error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูลรถยนต์ได้',
        data: [],
      },
      { status: 500 },
    );
  }
}

// ============================================================
// POST /api/cars
// ============================================================

export async function POST(req: Request) {
  const uploadedFilePaths: string[] = [];
  let insertSucceeded = false;

  try {
    await requireAdminOrMember(req);

    const formData = await req.formData();

    // ========================================================
    // FORM DATA
    // ========================================================

    const carCode = String(formData.get('carCode') ?? '').trim();

    const carBrandSub = String(formData.get('carBrandSub') ?? '').trim();

    const licensePlate = String(formData.get('licensePlate') ?? '').trim();

    const carBrandIdRaw = String(formData.get('carBrandId') ?? '').trim();

    const carBrandId = Number(carBrandIdRaw);

    const statusRaw = String(formData.get('status') ?? 'active');

    const status: 'active' | 'inactive' =
      statusRaw === 'inactive' ? 'inactive' : 'active';

    const mainImageIndexRaw = Number(formData.get('mainImageIndex') ?? 0);

    const mainImageIndex =
      Number.isInteger(mainImageIndexRaw) && mainImageIndexRaw >= 0
        ? mainImageIndexRaw
        : 0;

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!carCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุรหัสรถ',
        },
        { status: 400 },
      );
    }

    if (!carBrandSub) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุรุ่นรถ / รุ่นย่อย',
        },
        { status: 400 },
      );
    }

    if (!licensePlate) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุทะเบียนรถ',
        },
        { status: 400 },
      );
    }

    if (!carBrandIdRaw || !Number.isInteger(carBrandId) || carBrandId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาเลือกยี่ห้อรถยนต์',
        },
        { status: 400 },
      );
    }

    if (
      carCode.length > 255 ||
      carBrandSub.length > 255 ||
      licensePlate.length > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'ข้อมูลรถยนต์มีความยาวเกินที่กำหนด',
        },
        { status: 400 },
      );
    }

    // ========================================================
    // CHECK BRAND
    // ========================================================

    const [brand] = await db
      .select({
        id: car_brand.car_brand_id,
        name: car_brand.car_brand_name,
      })
      .from(car_brand)
      .where(eq(car_brand.car_brand_id, carBrandId))
      .limit(1);

    if (!brand) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบยี่ห้อรถยนต์ที่เลือก',
        },
        { status: 404 },
      );
    }

    // ========================================================
    // CHECK DUPLICATE
    // ========================================================

    const [existingCar] = await db
      .select({
        id: cars.id,
        carCode: cars.car_code,
        licensePlate: cars.license_plate,
      })
      .from(cars)
      .where(
        or(eq(cars.car_code, carCode), eq(cars.license_plate, licensePlate)),
      )
      .limit(1);

    if (existingCar) {
      let message = 'รหัสรถหรือทะเบียนรถนี้มีอยู่ในระบบแล้ว';

      if (existingCar.carCode === carCode) {
        message = 'รหัสรถนี้มีอยู่ในระบบแล้ว';
      } else if (existingCar.licensePlate === licensePlate) {
        message = 'ทะเบียนรถนี้มีอยู่ในระบบแล้ว';
      }

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 409 },
      );
    }

    // ========================================================
    // IMAGE VALIDATION
    // ========================================================

    const imageEntries = formData.getAll('carImages');

    const files = imageEntries.filter(
      (item): item is File => item instanceof File && item.size > 0,
    );

    const allowedTypes = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
    ]);

    const maxImageSize = 10 * 1024 * 1024;
    const maxImages = 10;

    if (files.length > maxImages) {
      return NextResponse.json(
        {
          success: false,
          message: 'อัปโหลดรูปภาพได้สูงสุด 10 รูป',
        },
        { status: 400 },
      );
    }

    for (const file of files) {
      if (!allowedTypes.has(file.type)) {
        return NextResponse.json(
          {
            success: false,
            message: 'รองรับเฉพาะรูปภาพ JPG, PNG, WebP และ AVIF',
          },
          { status: 400 },
        );
      }

      if (file.size > maxImageSize) {
        return NextResponse.json(
          {
            success: false,
            message: 'รูปภาพแต่ละไฟล์ต้องไม่เกิน 10 MB',
          },
          { status: 400 },
        );
      }
    }

    // ========================================================
    // UPLOAD DIRECTORY
    // ========================================================

    const uploadDirectory = path.join(
      process.cwd(),
      'public',
      'images',
      'cars',
    );

    const uploadedPaths: string[] = [];

    if (files.length > 0) {
      await fs.mkdir(uploadDirectory, {
        recursive: true,
      });
    }

    // ========================================================
    // UPLOAD IMAGES
    // ========================================================

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const fileName = `${randomUUID()}.webp`;

      const filePath = path.join(uploadDirectory, fileName);

      await sharp(buffer, {
        limitInputPixels: 40_000_000,
      })
        .rotate()
        .resize({
          width: 800,
          withoutEnlargement: true,
        })
        .webp({
          quality: 82,
        })
        .toFile(filePath);

      uploadedFilePaths.push(filePath);

      // แก้จาก `/images/cars/${fileName}` เป็นแบบผ่าน API Route
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/ythcar';
      uploadedPaths.push(`${basePath}/api/cars/image/${fileName}`);
    }

    // ========================================================
    // IMAGE JSON
    // ========================================================

    const mainImage = uploadedPaths[mainImageIndex] ?? uploadedPaths[0] ?? null;

    const carImages =
      uploadedPaths.length > 0
        ? {
            main: mainImage,
            images: uploadedPaths,
          }
        : null;

    const carImageJson = carImages ? JSON.stringify(carImages) : null;

    // ========================================================
    // INSERT
    // ========================================================

    const insertResult = await db.insert(cars).values({
      car_code: carCode,

      // รุ่นรถ / รุ่นย่อย
      car_brand: carBrandSub,

      // ID ยี่ห้อรถ
      car_brand_id: carBrandId,

      license_plate: licensePlate,
      car_image: carImageJson,
      status,
    });

    insertSucceeded = true;

    const insertId = insertResult[0]?.insertId ?? null;

    return NextResponse.json(
      {
        success: true,
        message: 'เพิ่มข้อมูลรถยนต์เรียบร้อยแล้ว',
        data: {
          id: insertId,
          carCode,
          carBrandSub,
          carBrandId,
          carBrand: brand.name,
          licensePlate,
          carImage: carImageJson,
          status,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    // ลบเฉพาะรูปที่อัปโหลดในคำขอนี้
    // หากยังไม่ได้ INSERT สำเร็จ
    if (!insertSucceeded && uploadedFilePaths.length > 0) {
      await Promise.allSettled(
        uploadedFilePaths.map((filePath) => fs.unlink(filePath)),
      );
    }

    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.status },
      );
    }

    console.error('POST /api/cars error:', error);

    if (error instanceof Error && error.cause) {
      console.error('POST /api/cars cause:', error.cause);
    }

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถสร้างข้อมูลรถได้',
      },
      { status: 500 },
    );
  }
}
