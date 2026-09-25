export type CarUsageItem = {
  bookingId: number;

  usageId: number | null;

  carCode: string;

  carName?: string | null;
  carBrand?: string | null;
  licensePlate?: string | null;

  userCode?: string | null;
  userName?: string | null;

  driverCode?: string | null;
  driverName?: string | null;

  departmentName?: string | null;
  destination?: string | null;

  startDate: string;
  startTime: string;

  endDate: string;
  endTime: string;

  dateGo?: string | null;
  dateBack?: string | null;

  kmGo?: number | null;
  kmBack?: number | null;

  subject?: string | null;

  status: 'approved';

  hasUsage: boolean;
};
