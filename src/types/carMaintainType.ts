export type CarMaintainItem = {
  id: number;

  // รถ
  carCode: string;
  carBrandSub: string | null;

  carBrandId: number | null;
  carBrand: string | null;

  licensePlate: string | null;
  carImage?: string | null;

  // ผู้ดำเนินการ / ผู้บันทึก
  userCode: string;
  userName: string | null;

  // การบำรุงรักษา
  dateMaintain: string;
  detailMaintain: string;
  priceMaintain: number;
};
