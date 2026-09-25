import { z } from 'zod';

export const bookingSchema = z.object({
  startDate: z.string().min(1, 'กรุณาเลือกวันเริ่มจอง'),
  startTime: z.string().min(1, 'กรุณาเลือกเวลาเริ่มจอง'),

  endDate: z.string().min(1, 'กรุณาเลือกวันสิ้นสุด'),
  endTime: z.string().min(1, 'กรุณาเลือกเวลาสิ้นสุด'),

  typeCar: z.string().min(1, 'กรุณาเลือกประเภทรถ'),

  levelStatus: z.enum(['normal', 'urgent', 'emergency']),

  subject: z.string().min(1, 'กรุณาระบุวัตถุประสงค์'),

  destination: z.string().min(1, 'กรุณาระบุสถานที่ปลายทาง'),

  countPeople: z.coerce.number().int().min(1, 'จำนวนผู้เดินทางอย่างน้อย 1 คน'),

  listPeople: z.string().optional(),

  carCode: z.string().min(1, 'กรุณาเลือกรถ'),

  description: z.string().default(''),

  telDep: z
    .string()
    .min(1, 'กรุณากรอกเบอร์โทรศัพท์ภายใน')
    .max(20, 'เบอร์โทรศัพท์ภายในยาวเกินไป'),

  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'กรุณากรอกเบอร์โทรศัพท์ 10 หลัก')
    .optional()
    .or(z.literal('')),
});

// ค่าที่ React Hook Form รับเข้ามา
export type BookingFormInput = z.input<typeof bookingSchema>;

// ค่าหลัง Zod validate / transform แล้ว
export type BookingForm = z.output<typeof bookingSchema>;
