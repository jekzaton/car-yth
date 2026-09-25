export type BookingStatus = 'pending' | 'approved' | 'cancelled';

export type BookingLevelStatus = 'ทั่วไป' | 'ผู้บริหาร' | 'ราชการ' | 'ฉุกเฉิน';

export interface CarBooking {
  bookingId: number;

  carCode: string;
  cid: string;

  startDate: string;
  startTime: string;

  endDate: string;
  endTime: string;

  levelStatus: string;

  subject: string;
  description: string;

  countPeople: number;
  listPeople: string | null;

  telDep: string;
  phone: string | null;

  status: BookingStatus;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCarBookingDto {
  carCode: string;
  cid: string;

  startDate: string;
  startTime: string;

  endDate: string;
  endTime: string;

  levelStatus: string;

  subject: string;
  description: string;

  countPeople: number;

  listPeople?: string;

  telDep: string;
  phone?: string;
}

export interface UpdateCarBookingDto extends Partial<CreateCarBookingDto> {
  bookingId: number;
  status?: BookingStatus;
}
