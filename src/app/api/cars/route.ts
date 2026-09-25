import { db } from '@/db';
import { cars, car_brand } from '@/db/schema';

import { NextResponse } from 'next/server';
import { eq, or } from 'drizzle-orm';

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { AuthError, requireAdminOrMember } from '@/lib/auth';

// ============================================================
// GET
// GET /api/cars
// ============================================================

export async function GET() {
  try {
    const carsList = await db
      .select({
        id: cars.id,

        carCode: cars.car_code,
        carName: cars.car_name,

        // Brand
        carBrandId: cars.car_brand_id,
        carBrand: car_brand.car_brand_name,

        licensePlate: cars.license_plate,
        carImage: cars.car_image,
        status: cars.status,
      })
      .from(cars)
      .leftJoin(car_brand, eq(car_brand.car_brand_id, cars.car_brand_id));

    return NextResponse.json({
      success: true,
      total: carsList.length,
      data: carsList,
    });
  } catch (error) {
    console.error('GET /api/cars error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูลรถยนต์ได้',
        data: [],
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// POST
// POST /api/cars
// ============================================================

export async function POST(req: Request) {
  try {
    await requireAdminOrMember(req);

    const formData = await req.formData();

    // ========================================================
    // FORM DATA
    // ========================================================

    const carCode = String(formData.get('carCode') ?? '').trim();

    const carName = String(formData.get('carName') ?? '').trim();

    const licensePlate = String(formData.get('licensePlate') ?? '').trim();

    // รับเป็น ID ของยี่ห้อรถ
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
    // VALIDATE
    // ========================================================

    if (!carCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุรหัสรถ',
        },
        {
          status: 400,
        },
      );
    }

    if (!carName) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุชื่อรถ',
        },
        {
          status: 400,
        },
      );
    }

    if (!licensePlate) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาระบุทะเบียนรถ',
        },
        {
          status: 400,
        },
      );
    }

    if (!Number.isInteger(carBrandId) || carBrandId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณาเลือกยี่ห้อรถยนต์',
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // CHECK BRAND
    // ========================================================

    const brandResult = await db
      .select({
        id: car_brand.car_brand_id,
        name: car_brand.car_brand_name,
      })
      .from(car_brand)
      .where(eq(car_brand.car_brand_id, carBrandId))
      .limit(1);

    if (brandResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบยี่ห้อรถยนต์ที่เลือก',
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // CHECK DUPLICATE
    // ========================================================

    const existingCar = await db
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

    if (existingCar.length > 0) {
      const duplicated = existingCar[0];

      let message = 'รหัสรถหรือทะเบียนรถนี้มีอยู่ในระบบแล้ว';

      if (duplicated.carCode === carCode) {
        message = 'รหัสรถนี้มีอยู่ในระบบแล้ว';
      } else if (duplicated.licensePlate === licensePlate) {
        message = 'ทะเบียนรถนี้มีอยู่ในระบบแล้ว';
      }

      return NextResponse.json(
        {
          success: false,
          message,
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // IMAGES
    // ========================================================

    const imageEntries = formData.getAll('carImages');

    const files = imageEntries.filter(
      (item): item is File => item instanceof File && item.size > 0,
    );

    const uploadedPaths: string[] = [];

    const uploadDirectory = path.join(
      process.cwd(),
      'public',
      'images',
      'cars',
    );

    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory, {
        recursive: true,
      });
    }

    // ========================================================
    // UPLOAD IMAGE
    // ========================================================

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      // ใช้ extension เดิม
      const originalExtension = path.extname(file.name);

      const extension = originalExtension || '.jpg';

      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 12)}${extension}`;

      const filePath = path.join(uploadDirectory, fileName);

      await sharp(buffer)
        .resize({
          width: 800,
          withoutEnlargement: true,
        })
        .toFile(filePath);

      uploadedPaths.push(`/images/cars/${fileName}`);
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

    // ========================================================
    // INSERT
    // ========================================================

    const insertResult = await db.insert(cars).values({
      car_code: carCode,

      car_name: carName,

      // สำคัญ
      car_brand_id: carBrandId,

      license_plate: licensePlate,

      car_image: carImages ? JSON.stringify(carImages) : null,

      status,
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json(
      {
        success: true,

        message: 'เพิ่มข้อมูลรถยนต์เรียบร้อยแล้ว',

        data: {
          id: insertResult[0]?.insertId ?? null,

          carCode,

          carName,

          carBrandId,

          carBrand: brandResult[0].name,

          licensePlate,

          carImage: carImages ? JSON.stringify(carImages) : null,

          status,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
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
    console.error('POST /api/cars error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถสร้างข้อมูลรถได้',
      },
      {
        status: 500,
      },
    );
  }
}
