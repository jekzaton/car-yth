export type CarOilItem = {
  id: number;

  carCode: string;

  carName?: string | null;
  carBrand?: string | null;
  licensePlate?: string | null;

  driverCode?: string | null;
  driverName?: string | null;

  dateOil?: string | null;

  kmDetail?: number | null;

  oilTypeId?: number | null;
  oilName?: string | null;

  literOil?: number | null;
  priceOil?: number | null;

  pricePerLiter?: number | null;
  oilType?: number | null;
};
