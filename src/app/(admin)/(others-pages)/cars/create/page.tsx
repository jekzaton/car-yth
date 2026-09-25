
import CreateCar from "@/components/car/CreateCar";
import TableCar from "@/components/car/TableCar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cars YTH",
  description:
    "เพิ่มยานพาหนะ YTH",
  // other metadata
};
export default function page() {
  return (
    <div>
      <CreateCar />
    </div>
  );
}
