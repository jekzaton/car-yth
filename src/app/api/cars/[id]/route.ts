import { db } from '@/db';
import { cars } from '@/db/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import { AuthError, requireAdminOrMember } from '@/lib/auth';
type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

type CarImageData = {
  main?: string;
  images?: string[];
};

const deleteImageFile = async (imagePath?: string) => {
  if (!imagePath) return;

  try {
    // ป้องกัน path ภายนอกโฟลเดอร์รถ
    if (!imagePath.startsWith('/images/cars/')) {
      console.warn('Invalid car image path:', imagePath);
      return;
    }

    const relativePath = imagePath.replace(/^\/+/, '');
    const absolutePath = path.join(process.cwd(), 'public', relativePath);

    await fs.unlink(absolutePath);
  } catch (error: unknown) {
    const nodeError = error as NodeJS.ErrnoException;

    // ถ้าไฟล์ไม่มีอยู่แล้ว ไม่ถือว่าเป็น error ร้ายแรง
    if (nodeError.code !== 'ENOENT') {
      console.error('Delete image error:', imagePath, error);
    }
  }
};

export async function DELETE(req: Request, { params }: RouteProps) {
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

    const existingCars = await db
      .select({
        id: cars.id,
        carImage: cars.car_image,
      })
      .from(cars)
      .where(eq(cars.id, carId))
      .limit(1);

    const existingCar = existingCars[0];

    if (!existingCar) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบข้อมูลรถ',
        },
        { status: 404 },
      );
    }

    let imagePaths: string[] = [];

    if (existingCar.carImage) {
      try {
        const parsedImages = JSON.parse(existingCar.carImage) as CarImageData;

        imagePaths = [
          ...(parsedImages.images ?? []),
          ...(parsedImages.main ? [parsedImages.main] : []),
        ];

        // ป้องกันรูปหลักซ้ำกับ images
        imagePaths = [...new Set(imagePaths)];
      } catch (error) {
        console.error('Invalid car_image JSON:', error);

        // รองรับกรณีข้อมูลเก่าเก็บเป็น path เดี่ยว
        if (
          typeof existingCar.carImage === 'string' &&
          existingCar.carImage.startsWith('/images/cars/')
        ) {
          imagePaths = [existingCar.carImage];
        }
      }
    }

    // ลบข้อมูลฐานข้อมูลก่อน
    await db.delete(cars).where(eq(cars.id, carId));

    // ลบรูปทั้งหมด
    await Promise.all(imagePaths.map(deleteImageFile));

    return NextResponse.json({
      success: true,
      message: 'ลบข้อมูลรถและรูปภาพเรียบร้อยแล้ว',
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
    console.error('Delete car error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถลบข้อมูลรถได้',
      },
      { status: 500 },
    );
  }
}
