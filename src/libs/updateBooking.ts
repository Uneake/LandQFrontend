import BACKEND_URL from "@/libs/backendUrl";

export interface UpdateBookingData {
  appointmentDate?: string;
  titleDeedNumber?: string;
  subDistrict?: string;
  heir?: string;
  appointedBy?: string;
  fee?: number;
  registrationDate?: string;
  employee?: string;
}

export default async function updateBooking(
  token: string,
  id: string,
  bookingData: UpdateBookingData
) {
  const res = await fetch(`${BACKEND_URL}/api/v1/bookings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bookingData),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "ไม่สามารถแก้ไขรายการนัดหมายได้");
  }

  return data;
}
