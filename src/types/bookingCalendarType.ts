export type BookingCalendarItem = {
  bookingId: number;

  userCode: string;
  bookingName: string;

  carCode: string;
  carBrandSub?: string | null;
  carBrand?: string | null;
  licensePlate?: string | null;

  typeCar: number;
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

  status: 'approved';
  depId?: number | null;
  departmentName?: string | null;
  departmentPhone?: string | null;
};
