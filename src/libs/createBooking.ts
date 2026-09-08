const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "ไม่สามารถเพิ่มรายการนัดหมายได้");
  }

  return data;
}
