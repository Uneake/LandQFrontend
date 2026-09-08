"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* fetch data whenever query or page changes */
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
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searched) fetchData(query, page);
  }, [query, page, searched, fetchData]);

  /* debounce typing → auto search */
  const handleInputChange = (val: string) => {
    setInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(val);
      setPage(1);
      setSearched(true);
    }, 500);
  };

  /* explicit submit */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery(input);
    setPage(1);
    setSearched(true);
  };

  const handlePageChange = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
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

      {/* ── Top Header Bar ── */}
      <header className="bg-[#1C3A27] border-b-4 border-[#C59B27] shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#C59B27]/20 border-2 border-[#C59B27] flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#C59B27">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight tracking-wide">
                LandQ
              </h1>
              <p className="text-[#C59B27] text-xs font-semibold tracking-widest uppercase">
                ระบบตรวจสอบนัดโอนมรดกที่ดิน
              </p>
            </div>
          </div>

          <div>
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-[#C59B27] hover:bg-[#A8832A] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>แดชบอร์ด ({user.username})</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-[#2D5A3F] hover:bg-[#3E7051] border border-[#C59B27]/40 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C59B27" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span>เข้าสู่ระบบเจ้าหน้าที่</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Search Section ── */}
      <section className="bg-gradient-to-b from-[#2D5A3F] to-[#1C3A27] py-14 px-6 text-center">
        <h2 className="text-white text-3xl font-bold mb-2 tracking-tight">
          ค้นหาข้อมูลการโอนมรดกที่ดิน
        </h2>
        <p className="text-[#A8C5B0] text-sm mb-8">
          กรุณากรอกเลขทะเบียนที่ดินเพื่อตรวจสอบข้อมูลการโอนมรดกที่ดิน
        </p>

        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto flex items-stretch shadow-xl rounded-lg overflow-hidden border border-[#C59B27]/30"
        >
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A8C7E] pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              id="search-input"
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="ค้นหาโฉนดที่ดิน..."
              className="w-full pl-11 pr-4 py-4 bg-white text-[#2C2520] text-sm outline-none placeholder-[#B0A098] focus:bg-[#FDFAF7] transition-colors"
            />
          </div>
          <button
            type="submit"
            id="search-submit"
            className="px-7 py-4 bg-[#C59B27] hover:bg-[#A8832A] text-white font-bold text-sm tracking-wide transition-colors shrink-0"
          >
            ค้นหา
          </button>
        </form>
      </section>

      {/* ── Results Section ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Status bar */}
        {searched && !loading && !error && (
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#C59B27] rounded" />
              <span className="text-sm text-[#4A3E37] font-medium">
                {total > 0
                  ? `พบ ${total.toLocaleString("th-TH")} รายการ${query ? ` สำหรับ "${query}"` : ""}`
                  : `ไม่พบข้อมูล${query ? ` สำหรับ "${query}"` : ""}`}
              </span>
            </div>
            {total > 0 && (
              <span className="text-xs text-[#7A695B]">
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
                <h3 className="text-base font-bold text-[#1C3A27]">กำลังค้นหาข้อมูล...</h3>
                <p className="text-xs text-[#7A695B] mt-1">กรุณารอสักครู่ ระบบกำลังค้นหาโฉนดที่ดิน</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-[#EAE0D4] rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-[#FDF0ED] border border-[#E8C4BB] rounded-lg text-[#7A3020]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Empty state (after search) */}
        {!loading && !error && searched && bookings.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E8DDD2] mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8C7B6E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-[#6D5C50] font-semibold">ไม่พบข้อมูลที่ตรงกัน</p>
            <p className="text-sm text-[#9A8C84] mt-1">ลองเปลี่ยนคำค้นหาหรือตรวจสอบเลขทะเบียนอีกครั้ง</p>
          </div>
        )}

        {/* Initial prompt */}
        {!searched && !loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#E8DDD2] border-2 border-[#D5C8BC] mb-5">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#8C7B6E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <p className="text-[#6D5C50] font-semibold text-lg">พร้อมให้บริการสืบค้นข้อมูล</p>
            <p className="text-sm text-[#9A8C84] mt-1 max-w-xs mx-auto">
              กรอกเลขทะเบียนที่ดินในช่องค้นหาด้านบน เพื่อแสดงข้อมูลการจอง
            </p>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && !error && bookings.length > 0 && (
          <>
            {/* Horizontal scroll wrapper for wide table */}
            <div className="overflow-x-auto rounded-xl border border-[#D8CFC4] shadow-md">
              <table className="w-full border-collapse text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-[#1C3A27] text-white">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-3.5 text-left font-semibold tracking-wide whitespace-nowrap border-r border-[#2D5A3F] last:border-r-0"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, idx) => (
                    <tr
                      key={b._id}
                      className={`border-t border-[#E0D8D0] hover:bg-[#F0E8DE] transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-[#FAF6F1]"
                        }`}
                    >
                      {/* วันที่นัด */}
                      <td className="px-4 py-3.5 text-[#4A3E37] whitespace-nowrap">
                        {formatDate(b.appointmentDate)}
                      </td>
                      {/* โฉนดที่ดิน */}
                      <td className="px-4 py-3.5 text-[#2C2520] font-medium">
                        {b.titleDeedNumber}
                      </td>
                      {/* ตำบล */}
                      <td className="px-4 py-3.5 text-[#4A3E37]">
                        {b.subDistrict}
                      </td>
                      {/* เจ้ามรดก */}
                      <td className="px-4 py-3.5 text-[#2C2520] font-medium">
                        {b.heir}
                      </td>
                      {/* ผู้นัด */}
                      <td className="px-4 py-3.5 text-[#4A3E37]">
                        {b.appointedBy}
                      </td>
                      {/* ค่าธรรมเนียม */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <span className="inline-block px-2 py-0.5 bg-[#FDF6E2] border border-[#DFD7CC] text-[#6B4E00] text-xs font-semibold rounded">
                          {formatFee(b.fee)}
                        </span>
                      </td>
                      {/* วันจดทะเบียน */}
                      <td className="px-4 py-3.5 text-[#4A3E37] whitespace-nowrap">
                        {b.registrationDate ? formatDate(b.registrationDate) : (
                          <span className="text-[#B0A098] italic text-xs">ไม่ระบุ</span>
                        )}
                      </td>
                      {/* เจ้าหน้าที่ */}
                      <td className="px-4 py-3.5">
                        {b.employee ? (
                          <div>
                            <span className="text-[#2C2520] font-medium">{b.employee.name}</span>
                            {b.employee.tel && (
                              <span className="block text-[#7A695B] text-xs mt-0.5">โทร {b.employee.tel}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#B0A098] italic text-xs">ไม่ระบุ</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-7 flex-wrap">
                <button
                  id="page-first"
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                  className="px-3 py-2 rounded border border-[#D5C8BC] bg-white text-[#4A3E37] text-xs font-medium hover:bg-[#F0E8DE] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  « หน้าแรก
                </button>
                <button
                  id="page-prev"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 rounded border border-[#D5C8BC] bg-white text-[#4A3E37] text-xs font-medium hover:bg-[#F0E8DE] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
