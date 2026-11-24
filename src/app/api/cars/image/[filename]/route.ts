import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    const { filename } = await params;

    // ป้องกัน Path Traversal (เช่น ../)
    const safeFilename = path.basename(decodeURIComponent(filename));

    const filePath = path.join(
      process.cwd(),
      'public',
      'images',
      'cars',
      safeFilename,
    );

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(safeFilename).toLowerCase();

    const contentType =
      ext === '.webp'
        ? 'image/webp'
        : ext === '.png'
          ? 'image/png'
          : ext === '.gif'
            ? 'image/gif'
            : 'image/jpeg';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    // หากไม่พบไฟล์รูปภาพรถใน Disk (เช่น รูปเก่าที่หายไป) ให้ส่งรูป no-image.png กลับไปแทน เพื่อไม่ให้ติด 404
    try {
      const fallbackPath = path.join(
        process.cwd(),
        'public',
        'images',
        'no-image.png',
      );
      const fallbackBuffer = await fs.readFile(fallbackPath);

      return new NextResponse(fallbackBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache',
        },
      });
    } catch {
      return new NextResponse('Image not found', { status: 404 });
    }
  }
}
