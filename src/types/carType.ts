// src/types/carType.ts

export type CarStatus = 'active' | 'inactive';

export type CarImage = {
  main: string;
  images: string[];
};

export type CarItem = {
  id: number;
  carCode: string;
  carName: string;
  carBrand: string;
  licensePlate: string;
  carImage: string | null;
  status?: 'active' | 'inactive' | string;
  // สถานะการจองจาก car_booking
  bookingStatus?: 'pending' | 'approved' | 'cancelled' | null;

  typeCarId: number;
  typeCarName?: string | null;
};

export type CarApiResponse = {
  success: boolean;
  data: CarItem[];
};

export type CarForm = {
  carCode: string;
  carName: string;
  carBrand: string;
  licensePlate: string;
  status: CarStatus;
};

export type CarPayload = CarForm & {
  carImages?: File[];
  mainImageIndex?: number;
};

export type TypeCar = {
  typeCarId: number;
  typeName: string;
};
