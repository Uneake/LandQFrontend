import BACKEND_URL from "@/libs/backendUrl";
import { captureNewAccessToken } from "@/libs/accessTokenEvents";

export interface CreateBookingData {
  appointmentDate: string;
  titleDeedNumber: string;
  subDistrict: string;
  heir: string;
  appointedBy: string;
  fee: number;
  registrationDate?: string;
  employee: string;
}

export default async function createBooking(
  token: string,
  bookingData: CreateBookingData
) {
  const res = await fetch(`${BACKEND_URL}/api/v1/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bookingData),
  });

  captureNewAccessToken(res);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "ไม่สามารถเพิ่มรายการนัดหมายได้");
  }

  return data;
}
