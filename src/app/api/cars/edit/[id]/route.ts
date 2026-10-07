import fs from 'fs';
import path from 'path';

import { and, eq, ne, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { car_brand } from '@/db/schema/car_brand';
import { cars } from '@/db/schema/cars';

import { AuthError, requireAdminOrMember, requireAuth } from '@/lib/auth';

type EditProps = {
  params: Promise<{
    id: string;
  }>;
};

type CarImageData = {
  main: string | null;
  images: string[];
};

function parseCarImages(value: unknown): CarImageData {
  if (!value) {
    return {
      main: null,
      images: [],
    };
  }

  if (Array.isArray(value)) {
    const images = value.filter(
      (image): image is string =>
        typeof image === 'string' && image.trim() !== '',
    );

    return {
      main: images[0] ?? null,
      images,
    };
  }

  if (typeof value !== 'string' || value.trim() === '') {
    return {
      main: null,
      images: [],
    };
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (Array.isArray(parsed)) {
      const images = parsed.filter(
        (image): image is string =>
          typeof image === 'string' && image.trim() !== '',
      );

      return {
        main: images[0] ?? null,
        images,
      };
    }

    if (parsed && typeof parsed === 'object') {
      const imageObject = parsed as {
        main?: unknown;
        images?: unknown;
      };

      const images = Array.isArray(imageObject.images)
        ? imageObject.images.filter(
            (image): image is string =>
              typeof image === 'string' && image.trim() !== '',
          )
        : [];

      const main =
        typeof imageObject.main === 'string' && imageObject.main.trim() !== ''
          ? imageObject.main
          : (images[0] ?? null);

      const orderedImages =
        main && images.includes(main)
          ? [main, ...images.filter((image) => image !== main)]
          : images;

      return {
        main: main ?? orderedImages[0] ?? null,
        images: orderedImages,
      };
    }
  } catch {
    // รองรับข้อมูลเก่าที่อาจเก็บเป็น URL เดี่ยว
    if (value.startsWith('/')) {
      return {
        main: value,
        images: [value],
      };
    }
  }

  return {
    main: null,
    images: [],
  };
}

// ============================================================
// GET SINGLE CAR
// user / member / admin
// ============================================================

export async function GET(req: NextRequest, { params }: EditProps) {
  try {
    // ต้อง Login
    await requireAuth(req);

    const { id } = await params;
    const carId = Number(id);

    if (!Number.isInteger(carId) || carId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสรถไม่ถูกต้อง',
        },
        {
          status: 400,
        },
      );
    }

    const result = await db
      .select({
        id: cars.id,
        carCode: cars.car_code,
        carBrandSub: cars.car_brand_sub,

        carBrandId: cars.car_brand_id,
        carBrand: car_brand.car_brand_name,

        licensePlate: cars.license_plate,
        carImage: cars.car_image,
        status: cars.status,
      })
      .from(cars)
      .leftJoin(car_brand, eq(car_brand.car_brand_id, cars.car_brand_id))
      .where(eq(cars.id, carId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลรถ',
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });
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

    console.error('GET /api/cars/edit/[id] error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูลรถได้',
      },
      {
        status: 500,
      },
    );
  }
}
// ================= UPDATE CAR =================
export async function PUT(req: Request, { params }: EditProps) {
  try {
    await requireAdminOrMember(req);
    const { id } = await params;
    const carId = Number(id);

    if (!Number.isInteger(carId) || carId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสรถไม่ถูกต้อง',
        },
        { status: 400 },
      );
    }

    const body = await req.json();

    const carCode = String(body.carCode ?? '').trim();
    const carBrandSub = String(body.carBrandSub ?? '').trim();
    const carBrandId = Number(body.carBrandId);
    const licensePlate = String(body.licensePlate ?? '').trim();
    const status = body.status === 'inactive' ? 'inactive' : 'active';
    const carImage = body.carImage;

    if (
      !carCode ||
      !carBrandSub ||
      !Number.isInteger(carBrandId) ||
      carBrandId <= 0 ||
      !licensePlate
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณากรอกข้อมูลรถให้ครบถ้วน',
        },
        {
          status: 400,
        },
      );
    }

    const oldCar = await db
      .select()
      .from(cars)
      .where(eq(cars.id, carId))
      .limit(1);

    if (!oldCar.length) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลรถ',
        },
        { status: 404 },
      );
    }

    const oldImageData = parseCarImages(oldCar[0].car_image);
    const newImageData = parseCarImages(carImage);

    // console.log('oldImageData:', oldImageData);
    // console.log('newImageData:', newImageData);

    const duplicate = await db
      .select()
      .from(cars)
      .where(
        and(
          ne(cars.id, carId),
          or(eq(cars.car_code, carCode), eq(cars.license_plate, licensePlate)),
        ),
      )
      .limit(1);

    if (duplicate.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสรถหรือทะเบียนซ้ำในระบบ',
        },
        { status: 400 },
      );
    }

    const brandResult = await db
      .select({
        id: car_brand.car_brand_id,
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

    await db
      .update(cars)
      .set({
        car_code: carCode,
        car_brand_sub: carBrandSub,
        car_brand_id: carBrandId,
        license_plate: licensePlate,
        car_image: JSON.stringify(newImageData),
        status,
      })
      .where(eq(cars.id, carId));

    const removedImages = oldImageData.images.filter(
      (image) => !newImageData.images.includes(image),
    );

    for (const image of removedImages) {
      // ลบเฉพาะรูปที่อยู่ในโฟลเดอร์ cars ป้องกัน path traversal
      if (!image.startsWith('/images/cars/')) {
        continue;
      }

      const relativePath = image.replace(/^\/+/, '');
      const filePath = path.join(process.cwd(), 'public', relativePath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'อัปเดตข้อมูลรถเรียบร้อยแล้ว',
      data: {
        id: carId,
        carCode,
        carBrandSub,
        carBrandId,
        licensePlate,
        carImage: newImageData,
        status,
      },
    });
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
    console.error('PUT car error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'อัปเดตไม่สำเร็จ',
      },
      { status: 500 },
    );
  }
}
