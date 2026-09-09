"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import getBookings, { Booking } from "@/libs/getBookings";
import { useAuth } from "@/context/AuthContext";

const PAGE_LIMIT = 10;

/* ─────────────────────── helpers ─────────────────────── */
function formatDate(raw?: string) {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatFee(fee: number) {
  return fee.toLocaleString("th-TH", { style: "currency", currency: "THB" });
}

/* ─────────────────────── main page ─────────────────────── */
export default function Home() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);

  const fetchData = useCallback(async (q: string, p: number) => {
    if (!q.trim()) {
      setBookings([]);
      setTotal(0);
      setTotalPages(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await getBookings({ search: q, page: p, limit: PAGE_LIMIT });
      setBookings(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e: unknown) {
      setError("ไม่สามารถค้นหาข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, []);

  /* explicit submit - triggers when clicking "ค้นหา", pressing Enter on PC, or "ไป" on phone */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = input.trim();
    setQuery(cleanInput);
    setPage(1);
    setSearched(true);
    if (!cleanInput) {
      setBookings([]);
      setTotal(0);
      setTotalPages(0);
      return;
    }
    fetchData(cleanInput, 1);
  };

  const handlePageChange = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    fetchData(query, p);
  };

  const pageRange = () => {
    const delta = 2;
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  /* ─── column definitions ─── */
  const columns = [
    { key: "appointmentDate", label: "วันที่นัด" },
    { key: "titleDeedNumber", label: "โฉนดที่ดิน" },
    { key: "subDistrict", label: "ตำบล" },
    { key: "heir", label: "เจ้ามรดก" },
    { key: "appointedBy", label: "ผู้นัด" },
    { key: "fee", label: "ค่าธรรมเนียม" },
    { key: "registrationDate", label: "วันจดทะเบียน" },
    { key: "employee", label: "เจ้าหน้าที่" },
  ];

  return (
    <div className="min-h-screen bg-[#F5EFE6] font-sans">


      {/* ── Hero Search Section ── */}
      <section className="bg-gradient-to-b from-[#2D5A3F] to-[#1C3A27] py-16 px-6 text-center">
        <h2 className="text-white text-3xl md:text-4xl font-bold mb-3 tracking-tight">
          ค้นหาข้อมูลการโอนมรดกที่ดิน
        </h2>
        <p className="text-[#C2DBC7] text-base md:text-lg mb-8 max-w-xl mx-auto font-medium">
          กรุณากรอกเลขทะเบียนที่ดินเพื่อตรวจสอบข้อมูลการโอนมรดกที่ดิน
        </p>

        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto flex items-stretch shadow-2xl rounded-xl overflow-hidden border-2 border-[#C59B27]/50"
        >
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A8C7E] pointer-events-none">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              id="search-input"
              type="search"
              enterKeyHint="search"
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              placeholder="กรอกเลขที่โฉนดที่ดินที่ต้องการค้นหา..."
              className="w-full pl-12 pr-4 py-4 bg-white text-[#2C2520] text-base md:text-lg outline-none placeholder-[#9A8C84] focus:bg-[#FDFAF7] transition-colors"
            />
          </div>
          <button
            type="submit"
            id="search-submit"
            disabled={loading}
            className="px-8 py-4 bg-[#C59B27] hover:bg-[#A8832A] text-white font-bold text-base md:text-lg tracking-wide transition-colors shrink-0 cursor-pointer"
          >
            ค้นหา
          </button>
        </form>
      </section>

      {/* ── Main Content Area ── */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-10 flex-1 w-full">
        {/* Search status / feedback bar */}
        {searched && !loading && !error && (
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-6 bg-[#C59B27] rounded" />
              <span className="text-base text-[#2C2520] font-bold">
                {total > 0
                  ? `พบ ${total.toLocaleString("th-TH")} รายการ${query ? ` สำหรับ "${query}"` : ""}`
                  : `ไม่พบข้อมูล${query ? ` สำหรับ "${query}"` : ""}`}
              </span>
            </div>
            {total > 0 && (
              <span className="text-sm font-semibold text-[#7A695B] bg-[#EAE0D4] px-3 py-1 rounded-lg">
                หน้า {page} / {totalPages}
              </span>
            )}
          </div>
        )}

        {/* Loading Modal */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2520]/40 backdrop-blur-sm transition-opacity">
            <div className="bg-[#FAF8F5] border border-[#C59B27]/40 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-xs mx-4 text-center">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-[#EAE0D4]"></div>
                <div className="absolute inset-0 rounded-full border-4 border-[#C59B27] border-t-transparent animate-spin"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1C3A27]">กำลังค้นหาข้อมูล...</h3>
                <p className="text-sm text-[#7A695B] mt-1">กรุณารอสักครู่ ระบบกำลังค้นหาโฉนดที่ดิน</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#EAE0D4] rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-[#FDF0ED] border border-[#E8C4BB] rounded-xl text-[#7A3020]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-base font-semibold">{error}</span>
          </div>
        )}

        {/* Empty state (after search) */}
        {!loading && !error && searched && bookings.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#E8DDD2] mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8C7B6E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-[#2C2520] font-bold text-xl">ไม่พบข้อมูลที่ตรงกัน</p>
            <p className="text-base text-[#7A695B] mt-2">ลองเปลี่ยนคำค้นหาหรือตรวจสอบเลขโฉนดที่ดินอีกครั้ง</p>
          </div>
        )}

        {/* Initial prompt */}
        {!searched && !loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#E8DDD2] border-2 border-[#D5C8BC] mb-5">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8C7B6E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <p className="text-[#2C2520] font-bold text-xl">พร้อมให้บริการสืบค้นข้อมูล</p>
            <p className="text-base text-[#7A695B] mt-2 max-w-md mx-auto">
              กรอกเลขโฉนดที่ดินในช่องค้นหาด้านบน เพื่อแสดงวันนัดหมายและรายละเอียด
            </p>
          </div>
        )}

        {/* ── Table & Mobile Cards ── */}
        {!loading && !error && bookings.length > 0 && (
          <>
            {/* Desktop Table (Visible on md and above) */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#D8CFC4] shadow-md">
              <table className="w-full border-collapse text-base min-w-[900px]">
                <thead>
                  <tr className="bg-[#1C3A27] text-white">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-4 text-left font-bold tracking-wide whitespace-nowrap border-r border-[#2D5A3F] last:border-r-0 text-sm md:text-base"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, idx) => {
                    const employeeDeleted = !b.employee;
                    return (
                    <tr
                      key={b._id}
                      className={`border-t transition-colors ${employeeDeleted
                        ? "border-red-200 bg-red-50 hover:bg-red-100"
                        : `border-[#E0D8D0] hover:bg-[#F0E8DE] ${idx % 2 === 0 ? "bg-white" : "bg-[#FAF6F1]"}`
                        }`}
                    >
                      {/* วันที่นัด */}
                      <td className="px-4 py-4 text-[#1C3A27] font-semibold whitespace-nowrap">
                        {formatDate(b.appointmentDate)}
                      </td>
                      {/* โฉนดที่ดิน */}
                      <td className="px-4 py-4 text-[#2C2520] font-bold text-lg">
                        {b.titleDeedNumber}
                      </td>
                      {/* ตำบล */}
                      <td className="px-4 py-4 text-[#4A3E37]">
                        {b.subDistrict}
                      </td>
                      {/* เจ้ามรดก */}
                      <td className="px-4 py-4 text-[#2C2520] font-medium">
                        {b.heir}
                      </td>
                      {/* ผู้นัด */}
                      <td className="px-4 py-4 text-[#4A3E37]">
                        {b.appointedBy}
                      </td>
                      {/* ค่าธรรมเนียม */}
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <span className="inline-block px-3 py-1 bg-[#FDF6E2] border border-[#DFD7CC] text-[#6B4E00] text-sm font-bold rounded-lg">
                          {formatFee(b.fee)}
                        </span>
                      </td>
                      {/* เจ้าหน้าที่ */}
                      <td className="px-4 py-4">
                        {employeeDeleted ? (
                          <span className="text-red-700 font-bold text-sm">เจ้าหน้าที่ถูกลบ</span>
                        ) : (
                          <div>
                            <span className="text-[#2C2520] font-semibold">{b.employee?.name}</span>
                            {b.employee?.tel && (
                              <span className="block text-[#7A695B] text-sm mt-0.5 font-normal">โทร {b.employee.tel}</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List (Visible on mobile screens below md) */}
            <div className="block md:hidden space-y-4">
              {bookings.map((b) => {
                const employeeDeleted = !b.employee;
                return (
                <div
                  key={b._id}
                  className={`border rounded-2xl p-5 shadow-sm space-y-3.5 ${employeeDeleted
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-[#D8CFC4]"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-[#EAE0D4] pb-3">
                    <div>
                      <span className="text-xs font-bold text-[#A8832A] uppercase tracking-wider block">
                        เลขที่โฉนดที่ดิน
                      </span>
                      <span className="text-xl font-bold text-[#1C3A27]">
                        {b.titleDeedNumber}
                      </span>
                    </div>
                    <span className={`text-sm font-bold px-3 py-1.5 rounded-xl shrink-0 ${employeeDeleted ? "bg-red-700 text-white" : "bg-[#1C3A27] text-white"}`}>
                      {formatDate(b.appointmentDate)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[#7A695B] block text-xs font-semibold">ตำบล</span>
                      <span className="text-[#2C2520] font-medium text-base">{b.subDistrict || "-"}</span>
                    </div>
                    <div>
                      <span className="text-[#7A695B] block text-xs font-semibold">ค่าธรรมเนียม</span>
                      <span className="text-[#6B4E00] font-bold text-base">{formatFee(b.fee)}</span>
                    </div>
                    <div>
                      <span className="text-[#7A695B] block text-xs font-semibold">เจ้ามรดก</span>
                      <span className="text-[#2C2520] font-medium text-base">{b.heir || "-"}</span>
                    </div>
                    <div>
                      <span className="text-[#7A695B] block text-xs font-semibold">ผู้นัดหมาย</span>
                      <span className="text-[#2C2520] font-medium text-base">{b.appointedBy || "-"}</span>
                    </div>
                    <div>
                      <span className="text-[#7A695B] block text-xs font-semibold">วันจดทะเบียน</span>
                      <span className="text-[#2C2520] font-medium text-base">
                        {b.registrationDate ? formatDate(b.registrationDate) : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#7A695B] block text-xs font-semibold">เจ้าหน้าที่</span>
                      <span className={employeeDeleted ? "text-red-700 font-bold text-base" : "text-[#2C2520] font-medium text-base"}>
                        {employeeDeleted ? "เจ้าหน้าที่ถูกลบ" : b.employee?.name}
                        {!employeeDeleted && b.employee?.tel ? ` (โทร ${b.employee.tel})` : ""}
                      </span>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                <button
                  id="page-first"
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                  className="px-4 py-2.5 rounded-xl border border-[#D5C8BC] bg-white text-[#2C2520] text-sm font-semibold hover:bg-[#F0E8DE] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  « หน้าแรก
                </button>
                <button
                  id="page-prev"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2.5 rounded-xl border border-[#D5C8BC] bg-white text-[#2C2520] text-sm font-semibold hover:bg-[#F0E8DE] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  ‹ ก่อนหน้า
                </button>

                {pageRange().map((p) => (
                  <button
                    key={p}
                    id={`page-${p}`}
                    onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded border text-xs font-bold transition-colors ${p === page
                      ? "bg-[#1C3A27] border-[#1C3A27] text-white shadow-sm"
                      : "bg-white border-[#D5C8BC] text-[#4A3E37] hover:bg-[#F0E8DE]"
                      }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  id="page-next"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded border border-[#D5C8BC] bg-white text-[#4A3E37] text-xs font-medium hover:bg-[#F0E8DE] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ถัดไป ›
                </button>
                <button
                  id="page-last"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded border border-[#D5C8BC] bg-white text-[#4A3E37] text-xs font-medium hover:bg-[#F0E8DE] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  หน้าสุดท้าย »
                </button>
              </div>
            )}

            <p className="text-center text-xs text-[#9A8C84] mt-3">
              แสดง {bookings.length} รายการ จากทั้งหมด {total.toLocaleString("th-TH")} รายการ
              (หน้า {page} / {totalPages})
            </p>
          </>
        )}
      </main>


    </div>
  );
}
