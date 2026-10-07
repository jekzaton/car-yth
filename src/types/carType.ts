// src/types/carType.ts

// ============================================================
// CAR STATUS
// ============================================================

export type CarStatus = 'active' | 'inactive';

export type BookingStatus = 'pending' | 'approved' | 'cancelled';

// ============================================================
// CAR IMAGE
// ============================================================

export type CarImage = {
  main: string;
  images: string[];
};

// ============================================================
// CAR
// ============================================================

export type CarItem = {
  id: number;
  carCode: string;
  carBrandSub?: string | null;
  carBrand?: string | null;
  licensePlate?: string | null;
  carImage?: string | null;
  status: 'active' | 'inactive';
};

// ============================================================
// API RESPONSE
// ============================================================

export type CarApiResponse = {
  success: boolean;
  message?: string;
  data: CarItem[];
};

// ============================================================
// CAR FORM
// ============================================================

export type CarForm = {
  carCode: string;
  carName: string;

  /**
   * Form ต้องส่ง ID ของยี่ห้อ
   * ไม่ส่งชื่อยี่ห้อแล้ว
   */
  carBrandId: number | null;

  licensePlate: string;
  status: CarStatus;
};

// ============================================================
// CAR PAYLOAD
// ============================================================

export type CarPayload = CarForm & {
  carImages?: File[];
  mainImageIndex?: number;
};

// ============================================================
// CAR BRAND
// ============================================================

export type CarBrand = {
  carBrandId: number;
  carBrandName: string;
};

// ============================================================
// CAR TYPE
// ============================================================

export type TypeCar = {
  typeCarId: number;
  typeName: string;
};
