import { z } from 'zod';

export const bookingSchema = z.object({
  startDate: z.string().min(1, 'กรุณาเลือกวันเริ่มจอง'),
  startTime: z.string().min(1, 'กรุณาเลือกเวลาเริ่มจอง'),

  endDate: z.string().min(1, 'กรุณาเลือกวันสิ้นสุด'),
  endTime: z.string().min(1, 'กรุณาเลือกเวลาสิ้นสุด'),

  typeCar: z.string().min(1, 'กรุณาเลือกประเภทรถ'),

  levelStatus: z.enum(['normal', 'urgent', 'emergency']),

  subject: z.string().min(1, 'กรุณาระบุวัตถุประสงค์'),

  destination: z.string().min(1, 'กรุณาระบุปลายทาง'),

  countPeople: z.number().int().min(1, 'จำนวนผู้เดินทางอย่างน้อย 1 คน'),

  listPeople: z.string().optional(),

  carCode: z.string().min(1, 'กรุณาเลือกรถ'),

  // อย่าใช้ .default('')
  description: z.string(),

  // อย่าใช้ .default('')
  telDep: z.string(),

  phone: z.string().optional(),
});

export type BookingForm = z.infer<typeof bookingSchema>;

export type CarBookingItem = {
  bookingId: number;

  userCode: string;
  bookingName: string;

  carCode: string;
  carBrandSub?: string | null;
  carBrand?: string | null;
  licensePlate?: string | null;
  carImage?: unknown;

  typeCarId: number;
  typeName: string;

  startDate: string;
  startTime: string;

  endDate: string;
  endTime: string;

  levelStatus: string;

  subject: string;
  destination: string;

  countPeople: number;
  listPeople?: string | null;

  telDep: string;
  phone?: string | null;

  status: 'pending' | 'approved' | 'cancelled';

  cUCode?: string | null;

  createdAt?: string | Date;
};

export type BookingStatus = 'pending' | 'approved' | 'cancelled';
