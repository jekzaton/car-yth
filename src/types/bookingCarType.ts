
import { z } from 'zod';

// ============================================================
// BOOKING STATUS
// ============================================================

export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'cancelled';

export type BookingLevel =
  | 'normal'
  | 'urgent'
  | 'emergency';

// ============================================================
// BOOKING FORM SCHEMA
// ============================================================

export const bookingSchema = z.object({
  startDate: z.string().min(1, 'กรุณาเลือกวันเริ่มจอง'),

  startTime: z.string().min(1, 'กรุณาเลือกเวลาเริ่มจอง'),

  endDate: z.string().min(1, 'กรุณาเลือกวันสิ้นสุด'),

  endTime: z.string().min(1, 'กรุณาเลือกเวลาสิ้นสุด'),

  typeCar: z.string().min(1, 'กรุณาเลือกประเภทรถ'),

  levelStatus: z.enum([
    'normal',
    'urgent',
    'emergency',
  ]),

  subject: z.string().min(1, 'กรุณาระบุวัตถุประสงค์'),

  destination: z.string().min(1, 'กรุณาระบุปลายทาง'),

  countPeople: z
    .number()
    .int()
    .min(1, 'จำนวนผู้เดินทางอย่างน้อย 1 คน'),

  listPeople: z.string().optional(),

  carCode: z.string().min(1, 'กรุณาเลือกรถ'),

  // ไม่ใช้ .default('')
  description: z.string(),

  // ไม่ใช้ .default('')
  telDep: z.string(),

  phone: z.string().optional(),
});

// ============================================================
// BOOKING FORM TYPE
// ============================================================

export type BookingForm = z.infer<typeof bookingSchema>;

// ============================================================
// CAR BOOKING ITEM
// ============================================================

export type CarBookingItem = {
  // ----------------------------------------------------------
  // BOOKING
  // ----------------------------------------------------------

  bookingId: number;

  // ----------------------------------------------------------
  // BOOKER
  // ----------------------------------------------------------

  userCode: string;

  bookingName: string;

  // ชื่อแผนกจาก JOIN ตารางแผนก
  departmentName?: string | null;

  // รหัสแผนก
  depId?: number | null;

  // ----------------------------------------------------------
  // CAR
  // ----------------------------------------------------------

  carCode: string;

  // ชื่อรถจาก cars.car_name
  carName?: string | null;

  // รหัสยี่ห้อรถ
  carBrandId?: number | null;

  // ชื่อยี่ห้อจาก car_brand.car_brand_name
  carBrand?: string | null;

  // รองรับ component เดิม
  carBrandSub?: string | null;

  licensePlate?: string | null;

  carImage?: unknown;

  // ----------------------------------------------------------
  // CAR TYPE
  // ----------------------------------------------------------

  typeCarId: number;

  typeName: string;

  // ----------------------------------------------------------
  // DATE / TIME
  // ----------------------------------------------------------

  startDate: string;
  startTime: string;

  endDate: string;
  endTime: string;

  // ----------------------------------------------------------
  // PRIORITY
  // ----------------------------------------------------------

  levelStatus: BookingLevel | string;

  // ----------------------------------------------------------
  // TRAVEL DETAILS
  // ----------------------------------------------------------

  subject: string;

  destination: string;

  countPeople: number;

  listPeople?: string | null;

  // ----------------------------------------------------------
  // CONTACT
  // ----------------------------------------------------------

  telDep: string;

  phone?: string | null;

  // ----------------------------------------------------------
  // STATUS
  // ----------------------------------------------------------

  status: BookingStatus;

  // ----------------------------------------------------------
  // DRIVER
  // ----------------------------------------------------------

  // users.user_code ของพนักงานขับรถ
  cUCode?: string | null;

  // ชื่อพนักงานขับรถจาก JOIN users
  driverName?: string | null;

  // เบอร์โทรพนักงานขับรถ
  driverPhone?: string | null;

  // ----------------------------------------------------------
  // TIMESTAMPS
  // ----------------------------------------------------------

  createdAt?: string | Date;

  updatedAt?: string | Date;
};

// ============================================================
// API RESPONSE
// ============================================================

export type CarBookingApiResponse = {
  success: boolean;

  message?: string;

  data: CarBookingItem[];
};

// ============================================================
// BOOKING DETAIL RESPONSE
// ============================================================

export type CarBookingDetailResponse = {
  success: boolean;

  message?: string;

  data: CarBookingItem;
};
