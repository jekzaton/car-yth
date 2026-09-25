import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { AuthError, requireAdminOrMember } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    await requireAdminOrMember(req);

    const formData = await req.formData();

    const files = formData
      .getAll('carImages')
      .filter(
        (item): item is File =>
          item instanceof File &&
          item.size > 0 &&
          item.type.startsWith('image/'),
      );

    if (files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่พบไฟล์รูปภาพ',
          uploaded: [],
        },
        { status: 400 },
      );
    }

    const uploadDirectory = path.join(
      process.cwd(),
      'public',
      'images',
      'cars',
    );

    await fs.mkdir(uploadDirectory, {
      recursive: true,
    });

    const uploaded: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      /*
       * บันทึกเป็น WebP ทุกไฟล์
       * ลดปัญหานามสกุลไฟล์ไม่ตรงกับข้อมูลจริง
       * และช่วยลดขนาดรูปภาพ
       */
      const fileName = `${Date.now()}-${crypto.randomUUID()}.webp`;

      const filePath = path.join(uploadDirectory, fileName);

      await sharp(buffer)
        .rotate()
        .resize({
          width: 1200,
          height: 900,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: 82,
        })
        .toFile(filePath);

      uploaded.push(`/images/cars/${fileName}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'อัปโหลดรูปภาพสำเร็จ',
        uploaded,
      },
      { status: 201 },
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
    console.error('Upload car images error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'อัปโหลดรูปภาพไม่สำเร็จ',
        uploaded: [],
      },
      { status: 500 },
    );
  }
}
