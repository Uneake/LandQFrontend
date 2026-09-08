import BACKEND_URL from "@/libs/backendUrl";

export interface Employee {
  name: string;
  tel?: string;
}

export interface Booking {
  _id: string;
  appointmentDate : string;
  titleDeedNumber : string;
  subDistrict     : string;
  heir            : string;
  appointedBy     : string;
  fee             : number;
  registrationDate?: string;
  employee        : Employee | null;
  createdAt?      : string;
  updatedAt?      : string;
}

export interface BookingsResponse {
  success    : boolean;
  count      : number;
  total      : number;
  page       : number;
  totalPages : number;
  data       : Booking[];
}

export default async function getBookings(params: {
  search?: string;
  appointmentDate?: string;
  employee?: string;
  page?: number;
  limit?: number;
  all?: boolean;
  token?: string;
}): Promise<BookingsResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.appointmentDate) query.set("appointmentDate", params.appointmentDate);
  if (params.employee) query.set("employee", params.employee);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.all) query.set("all", "true");

  const headers: HeadersInit = params.token
    ? { Authorization: `Bearer ${params.token}` }
    : {};

  const res = await fetch(
    `${BACKEND_URL}/api/v1/bookings?${query.toString()}`,
    { method: "GET", cache: "no-store", headers }
  );

  if (!res.ok) {
    throw new Error("ไม่สามารถค้นหาข้อมูลการจองได้");
  }

  return res.json();
}
