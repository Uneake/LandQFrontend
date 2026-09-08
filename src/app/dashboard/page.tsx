"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import getBookings, { Booking } from "@/libs/getBookings";
import createBooking, { CreateBookingData } from "@/libs/createBooking";
import updateBooking, { UpdateBookingData } from "@/libs/updateBooking";
import deleteBooking from "@/libs/deleteBooking";
import getEmployees, { EmployeeData } from "@/libs/getEmployees";
import getAdmins, { AdminItem } from "@/libs/getAdmins";
import createAdmin, { CreateAdminData } from "@/libs/createAdmin";
import deleteAdmin from "@/libs/deleteAdmin";
import updateAdmin from "@/libs/updateAdmin";

/* ─────────────────────── Toast Alert ─────────────────────── */
interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, accessToken, isLoading: authLoading, logout, refreshUser } = useAuth();

  // Active navigation tab: 'overview' | 'bookings' | 'admins' | 'profile'
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "admins" | "profile">("bookings");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  /* ─────────────────────── Bookings State ─────────────────────── */
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingTotalPages, setBookingTotalPages] = useState(1);
  const [bookingTotal, setBookingTotal] = useState(0);

  // Employees list for booking dropdown
  const [employees, setEmployees] = useState<EmployeeData[]>([]);

  // Booking Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingForm, setBookingForm] = useState({
    appointmentDate: "",
    titleDeedNumber: "",
    subDistrict: "",
    heir: "",
    appointedBy: "",
    fee: 0,
    registrationDate: "",
    employee: "",
  });
  const [bookingModalLoading, setBookingModalLoading] = useState(false);

  /* ─── Delete Countdown State (generic for booking / admin / account) ─── */
  interface CountdownState {
    active: boolean;
    type: "booking" | "admin" | "account";
    targetId?: string;
    targetName?: string;
    secondsLeft: number;
    timerRef?: ReturnType<typeof setInterval> | null;
  }

  const [countdown, setCountdown] = useState<CountdownState>({
    active: false,
    type: "booking",
    secondsLeft: 5,
    timerRef: null,
  });

  /* ─────────────────────── Admins State (super_admin) ─────────────────────── */
  const [adminsList, setAdminsList] = useState<AdminItem[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState<CreateAdminData>({
    username: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [adminModalLoading, setAdminModalLoading] = useState(false);

  /* ─────────────────────── Profile State ─────────────────────── */
  const [profileUsername, setProfileUsername] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Change State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  /* Sync profile form when user loads */
  useEffect(() => {
    if (user) {
      setProfileUsername(user.username);
      setProfileEmail(user.email);
    }
  }, [user]);

  /* ─────────────────────── Fetching Data ─────────────────────── */
  const fetchBookingsList = useCallback(
    async (q: string, p: number) => {
      setBookingsLoading(true);
      try {
        const res = await getBookings({ search: q, page: p, limit: 10 });
        setBookings(res.data);
        setBookingTotal(res.total);
        setBookingTotalPages(res.totalPages);
      } catch (err: unknown) {
        addToast("error", err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลการจองได้");
      } finally {
        setBookingsLoading(false);
      }
    },
    []
  );

  const fetchEmployeesList = useCallback(async () => {
    try {
      const res = await getEmployees();
      if (res.success && res.data) {
        setEmployees(res.data);
      }
    } catch {
      // silently handle
    }
  }, []);

  const fetchAdminsList = useCallback(async () => {
    if (!accessToken || user?.role !== "super_admin") return;
    setAdminsLoading(true);
    try {
      const res = await getAdmins(accessToken);
      if (res.success) {
        setAdminsList(res.data);
      }
    } catch (err: unknown) {
      addToast("error", err instanceof Error ? err.message : "ไม่สามารถโหลดรายชื่อผู้ดูแลระบบได้");
    } finally {
      setAdminsLoading(false);
    }
  }, [accessToken, user?.role]);

  useEffect(() => {
    if (user && accessToken) {
      fetchBookingsList(bookingSearch, bookingPage);
      fetchEmployeesList();
      if (user.role === "super_admin") {
        fetchAdminsList();
      }
    }
  }, [user, accessToken, bookingSearch, bookingPage, fetchBookingsList, fetchEmployeesList, fetchAdminsList]);

  /* ─────────────────────── Countdown Handlers ─────────────────────── */
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (countdown.timerRef) clearInterval(countdown.timerRef);
    };
  }, [countdown.timerRef]);

  const startCountdown = (
    type: "booking" | "admin" | "account",
    targetId?: string,
    targetName?: string
  ) => {
    // If any countdown is active, clear it first
    if (countdown.timerRef) clearInterval(countdown.timerRef);

    setCountdown({
      active: true,
      type,
      targetId,
      targetName,
      secondsLeft: 5,
      timerRef: null,
    });
  };

  const cancelCountdown = () => {
    if (countdown.timerRef) clearInterval(countdown.timerRef);
    setCountdown({
      active: false,
      type: "booking",
      secondsLeft: 5,
      timerRef: null,
    });
    addToast("info", "ยกเลิกการลบเรียบร้อยแล้ว");
  };

  const executeConfirmedAction = useCallback(async () => {
    if (countdown.timerRef) clearInterval(countdown.timerRef);
    const { type, targetId } = countdown;

    setCountdown((prev) => ({ ...prev, active: false }));

    if (!accessToken) return;

    if (type === "booking" && targetId) {
      try {
        await deleteBooking(accessToken, targetId);
        addToast("success", "ลบรายการนัดหมายสำเร็จแล้ว");
        fetchBookingsList(bookingSearch, bookingPage);
      } catch (err: unknown) {
        addToast("error", err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบ");
      }
    } else if (type === "admin" && targetId) {
      try {
        await deleteAdmin(accessToken, targetId);
        addToast("success", "ลบบัญชีผู้ดูแลระบบสำเร็จแล้ว พร้อมส่งอีเมลแจ้งเตือน");
        fetchAdminsList();
      } catch (err: unknown) {
        addToast("error", err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบแอดมิน");
      }
    } else if (type === "account" && user) {
      try {
        await deleteAdmin(accessToken, user.id);
        addToast("success", "ลบบัญชีของคุณเรียบร้อยแล้ว");
        await logout();
        router.push("/login");
      } catch (err: unknown) {
        addToast("error", err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบบัญชี");
      }
    }
  }, [countdown, accessToken, user, bookingSearch, bookingPage, fetchBookingsList, fetchAdminsList, logout, router]);

  // Handle countdown tick
  const triggerCountdownTimer = () => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev.secondsLeft <= 1) {
          clearInterval(interval);
          executeConfirmedAction();
          return { ...prev, secondsLeft: 0, active: false };
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);

    setCountdown((prev) => ({ ...prev, timerRef: interval }));
  };

  /* ─────────────────────── Booking Modal Actions ─────────────────────── */
  const openCreateBookingModal = () => {
    setEditingBooking(null);
    setBookingForm({
      appointmentDate: "",
      titleDeedNumber: "",
      subDistrict: "",
      heir: "",
      appointedBy: "",
      fee: 0,
      registrationDate: "",
      employee: employees[0]?._id || "",
    });
    setIsBookingModalOpen(true);
  };

  const openEditBookingModal = (b: Booking) => {
    setEditingBooking(b);
    // Find matching employee ID if available
    let empId = "";
    if (b.employee && typeof b.employee === "object" && "name" in b.employee) {
      const match = employees.find((e) => e.name === (b.employee as { name: string }).name);
      empId = match?._id || employees[0]?._id || "";
    }
    setBookingForm({
      appointmentDate: b.appointmentDate || "",
      titleDeedNumber: b.titleDeedNumber || "",
      subDistrict: b.subDistrict || "",
      heir: b.heir || "",
      appointedBy: b.appointedBy || "",
      fee: b.fee || 0,
      registrationDate: b.registrationDate || "",
      employee: empId,
    });
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    if (!bookingForm.employee) {
      addToast("error", "กรุณาเลือกเจ้าหน้าที่ผู้รับผิดชอบ");
      return;
    }

    setBookingModalLoading(true);
    try {
      if (editingBooking) {
        // Update
        const updateData: UpdateBookingData = {
          appointmentDate: bookingForm.appointmentDate,
          titleDeedNumber: bookingForm.titleDeedNumber,
          subDistrict: bookingForm.subDistrict,
          heir: bookingForm.heir,
          appointedBy: bookingForm.appointedBy,
          fee: Number(bookingForm.fee),
          registrationDate: bookingForm.registrationDate || undefined,
          employee: bookingForm.employee,
        };
        await updateBooking(accessToken, editingBooking._id, updateData);
        addToast("success", "แก้ไขข้อมูลการนัดหมายสำเร็จแล้ว");
      } else {
        // Create
        const createData: CreateBookingData = {
          appointmentDate: bookingForm.appointmentDate,
          titleDeedNumber: bookingForm.titleDeedNumber,
          subDistrict: bookingForm.subDistrict,
          heir: bookingForm.heir,
          appointedBy: bookingForm.appointedBy,
          fee: Number(bookingForm.fee),
          registrationDate: bookingForm.registrationDate || undefined,
          employee: bookingForm.employee,
        };
        await createBooking(accessToken, createData);
        addToast("success", "เพิ่มรายการนัดหมายใหม่สำเร็จแล้ว");
      }
      setIsBookingModalOpen(false);
      fetchBookingsList(bookingSearch, bookingPage);
    } catch (err: unknown) {
      addToast("error", err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setBookingModalLoading(false);
    }
  };

  /* ─────────────────────── Admin Modal Actions (super_admin) ─────────────────────── */
  const handleAdminCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    if (adminForm.password.length < 8) {
      addToast("error", "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setAdminModalLoading(true);
    try {
      await createAdmin(accessToken, adminForm);
      addToast("success", "สร้างบัญชีผู้ดูแลระบบสำเร็จ (ส่งอีเมลยืนยันแล้ว)");
      setIsAdminModalOpen(false);
      setAdminForm({ username: "", email: "", password: "", role: "admin" });
      fetchAdminsList();
    } catch (err: unknown) {
      addToast("error", err instanceof Error ? err.message : "ไม่สามารถสร้างแอดมินได้");
    } finally {
      setAdminModalLoading(false);
    }
  };

  /* ─────────────────────── Profile & Password Actions ─────────────────────── */
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !user) return;

    setProfileLoading(true);
    try {
      await updateAdmin(accessToken, user.id, {
        username: profileUsername.trim(),
        email: profileEmail.trim(),
      });
      await refreshUser();
      addToast("success", "อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว");
    } catch (err: unknown) {
      addToast("error", err instanceof Error ? err.message : "ไม่สามารถอัปเดตข้อมูลได้");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !user) return;

    if (newPassword.length < 8) {
      addToast("error", "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast("error", "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setPasswordLoading(true);
    try {
      await updateAdmin(accessToken, user.id, {
        password: newPassword,
      });
      addToast("success", "เปลี่ยนรหัสผ่านสำเร็จแล้ว");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      addToast("error", err instanceof Error ? err.message : "ไม่สามารถเปลี่ยนรหัสผ่านได้");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#C59B27] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-[#1C3A27]">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EFE6] flex flex-col font-sans">
      {/* ── Toast Notifications ── */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2.5 transition-all transform animate-bounce-short ${
              t.type === "success"
                ? "bg-[#1C3A27] text-white border border-[#C59B27]"
                : t.type === "error"
                ? "bg-[#7A3020] text-white border border-red-400"
                : "bg-[#2C2520] text-white border border-gray-500"
            }`}
          >
            {t.type === "success" && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C59B27" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {t.type === "error" && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
            {t.type === "info" && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* ── Top Navigation Bar ── */}
      <header className="bg-[#1C3A27] border-b-4 border-[#C59B27] shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C59B27]/20 border-2 border-[#C59B27] flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#C59B27">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white font-bold text-base leading-tight tracking-wide">
                  ระบบบริหารจัดการที่ดิน
                </h1>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    user.role === "super_admin"
                      ? "bg-[#C59B27] text-[#1C3A27]"
                      : "bg-[#2D5A3F] text-white border border-[#C59B27]/40"
                  }`}
                >
                  {user.role === "super_admin" ? "Super Admin" : "Admin"}
                </span>
              </div>
              <p className="text-[#C59B27] text-xs font-medium">
                ยินดีต้อนรับ, {user.username} ({user.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#EAE0D4] hover:text-[#C59B27] bg-[#2D5A3F]/50 rounded-lg border border-[#C59B27]/30 transition"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span>ดูหน้าค้นหาประชาชน</span>
            </Link>

            <button
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
              className="px-3.5 py-1.5 bg-[#7A3020] hover:bg-[#8D3826] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Container with Sidebar ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6">
        {/* ── Sidebar ── */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-[#FAF8F5] border border-[#C59B27]/30 rounded-2xl p-4 shadow-sm space-y-1 sticky top-24">
            <div className="px-3 py-2 text-[11px] font-bold text-[#7A695B] uppercase tracking-wider">
              เมนูหลัก
            </div>

            <button
              onClick={() => setActiveTab("bookings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                activeTab === "bookings"
                  ? "bg-[#1C3A27] text-white shadow-sm"
                  : "text-[#4A3E37] hover:bg-[#EAE0D4]/60"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>จัดการการนัดหมาย</span>
            </button>

            {user.role === "super_admin" && (
              <button
                onClick={() => setActiveTab("admins")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                  activeTab === "admins"
                    ? "bg-[#1C3A27] text-white shadow-sm"
                    : "text-[#4A3E37] hover:bg-[#EAE0D4]/60"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>จัดการแอดมิน</span>
                <span className="ml-auto text-[10px] bg-[#C59B27] text-[#1C3A27] px-1.5 py-0.2 rounded font-bold">
                  Super
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                activeTab === "profile"
                  ? "bg-[#1C3A27] text-white shadow-sm"
                  : "text-[#4A3E37] hover:bg-[#EAE0D4]/60"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>โปรไฟล์และการตั้งค่า</span>
            </button>

            <div className="pt-4 mt-4 border-t border-[#EAE0D4]">
              <div className="p-3 bg-[#F5EFE6] rounded-xl text-[11px] text-[#7A695B] space-y-1">
                <div className="font-bold text-[#1C3A27]">ระดับสิทธิ์:</div>
                <div>{user.role === "super_admin" ? "ผู้ดูแลระบบสูงสุด (Super Admin)" : "ผู้ดูแลระบบ (Admin)"}</div>
                <div className="pt-1 text-[10px] text-[#A8832A]">สถานะ: ใช้งานได้ปกติ (Verified)</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Tab Content ── */}
        <main className="flex-1 space-y-6">
          {/* ═════════════════ TAB 1: BOOKINGS ═════════════════ */}
          {activeTab === "bookings" && (
            <div className="bg-[#FAF8F5] border border-[#C59B27]/30 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#1C3A27]">
                    จัดการข้อมูลการนัดหมายรังวัดและโฉนด
                  </h2>
                  <p className="text-xs text-[#7A695B] mt-0.5">
                    ค้นหา เพิ่ม แก้ไข และลบข้อมูลการจองคิวรังวัดที่ดิน
                  </p>
                </div>
                <button
                  onClick={openCreateBookingModal}
                  className="px-4 py-2.5 bg-[#1C3A27] hover:bg-[#2D5A3F] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>เพิ่มรายการนัดหมาย</span>
                </button>
              </div>

              {/* Search input */}
              <div className="mb-6 flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A695B] pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => {
                      setBookingSearch(e.target.value);
                      setBookingPage(1);
                      fetchBookingsList(e.target.value, 1);
                    }}
                    placeholder="ค้นหาเลขโฉนดที่ดิน..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5C9BE] rounded-xl text-xs text-[#2C2520] outline-none placeholder-[#B0A098] focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]/20"
                  />
                </div>
              </div>

              {/* Bookings Table */}
              <div className="overflow-x-auto border border-[#EAE0D4] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#EAE0D4]/70 text-[#4A3E37] font-bold border-b border-[#EAE0D4]">
                    <tr>
                      <th className="py-3 px-4">วันที่นัด</th>
                      <th className="py-3 px-4">โฉนดที่ดิน</th>
                      <th className="py-3 px-4">ตำบล</th>
                      <th className="py-3 px-4">ผู้สืบสันดาน/ทายาท</th>
                      <th className="py-3 px-4">ผู้นัดรังวัด</th>
                      <th className="py-3 px-4">ค่าธรรมเนียม</th>
                      <th className="py-3 px-4">เจ้าหน้าที่</th>
                      <th className="py-3 px-4 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE0D4]/60 bg-white">
                    {bookingsLoading ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-[#7A695B]">
                          <div className="inline-block w-6 h-6 border-2 border-[#C59B27] border-t-transparent rounded-full animate-spin mb-2" />
                          <div>กำลังโหลดข้อมูล...</div>
                        </td>
                      </tr>
                    ) : bookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-[#7A695B]">
                          ไม่พบข้อมูลการจองคิวรังวัดที่ดิน
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b) => (
                        <tr key={b._id} className="hover:bg-[#FDFAF7] transition">
                          <td className="py-3.5 px-4 font-medium text-[#1C3A27]">
                            {b.appointmentDate}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#2C2520]">
                            {b.titleDeedNumber}
                          </td>
                          <td className="py-3.5 px-4 text-[#4A3E37]">{b.subDistrict}</td>
                          <td className="py-3.5 px-4 text-[#4A3E37]">{b.heir}</td>
                          <td className="py-3.5 px-4 text-[#4A3E37]">{b.appointedBy}</td>
                          <td className="py-3.5 px-4 font-bold text-[#C59B27]">
                            {b.fee?.toLocaleString("th-TH")} บาท
                          </td>
                          <td className="py-3.5 px-4 text-[#4A3E37]">
                            {b.employee?.name || "-"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditBookingModal(b)}
                                className="p-1.5 text-[#1C3A27] hover:bg-[#EAE0D4] rounded-lg transition"
                                title="แก้ไข"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => startCountdown("booking", b._id, b.titleDeedNumber)}
                                className="p-1.5 text-[#C0392B] hover:bg-red-50 rounded-lg transition"
                                title="ลบ"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {bookingTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-xs text-[#7A695B]">
                  <span>
                    พบทั้งหมด {bookingTotal} รายการ (หน้า {bookingPage} / {bookingTotalPages})
                  </span>
                  <div className="flex gap-1">
                    <button
                      disabled={bookingPage <= 1}
                      onClick={() => setBookingPage((p) => p - 1)}
                      className="px-2.5 py-1 bg-white border border-[#D5C9BE] rounded-lg disabled:opacity-40"
                    >
                      ก่อนหน้า
                    </button>
                    <button
                      disabled={bookingPage >= bookingTotalPages}
                      onClick={() => setBookingPage((p) => p + 1)}
                      className="px-2.5 py-1 bg-white border border-[#D5C9BE] rounded-lg disabled:opacity-40"
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════ TAB 2: ADMIN MANAGEMENT (super_admin) ═════════════════ */}
          {activeTab === "admins" && user.role === "super_admin" && (
            <div className="bg-[#FAF8F5] border border-[#C59B27]/30 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#1C3A27]">
                    จัดการผู้ดูแลระบบ (Super Admin Only)
                  </h2>
                  <p className="text-xs text-[#7A695B] mt-0.5">
                    สร้างและลบผู้ดูแลระบบ พร้อมระบบแจ้งเตือนทางอีเมลอัตโนมัติ
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAdminForm({ username: "", email: "", password: "", role: "admin" });
                    setIsAdminModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-[#C59B27] hover:bg-[#A8832A] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>เพิ่มผู้ดูแลระบบ (Admin)</span>
                </button>
              </div>

              {/* Admins Table */}
              <div className="overflow-x-auto border border-[#EAE0D4] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#EAE0D4]/70 text-[#4A3E37] font-bold border-b border-[#EAE0D4]">
                    <tr>
                      <th className="py-3 px-4">ชื่อผู้ใช้</th>
                      <th className="py-3 px-4">อีเมล</th>
                      <th className="py-3 px-4">บทบาท</th>
                      <th className="py-3 px-4">สถานะอีเมล</th>
                      <th className="py-3 px-4">วันที่สร้าง</th>
                      <th className="py-3 px-4 text-center">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE0D4]/60 bg-white">
                    {adminsLoading ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#7A695B]">
                          <div className="inline-block w-6 h-6 border-2 border-[#C59B27] border-t-transparent rounded-full animate-spin mb-2" />
                          <div>กำลังโหลดรายชื่อแอดมิน...</div>
                        </td>
                      </tr>
                    ) : adminsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#7A695B]">
                          ไม่พบรายชื่อผู้ดูแลระบบ
                        </td>
                      </tr>
                    ) : (
                      adminsList.map((a) => {
                        const isSelf = a._id === user.id;
                        return (
                          <tr key={a._id} className="hover:bg-[#FDFAF7] transition">
                            <td className="py-3.5 px-4 font-bold text-[#1C3A27]">
                              {a.username}
                              {isSelf && (
                                <span className="ml-2 text-[10px] bg-[#FAF8F5] text-[#7A695B] border border-[#D5C9BE] px-1.5 py-0.5 rounded">
                                  (บัญชีของคุณ)
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-[#4A3E37]">{a.email}</td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  a.role === "super_admin"
                                    ? "bg-[#C59B27] text-[#1C3A27]"
                                    : "bg-[#2D5A3F] text-white"
                                }`}
                              >
                                {a.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {a.emailVerified ? (
                                <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  ยืนยันแล้ว
                                </span>
                              ) : (
                                <span className="text-amber-700 font-medium text-[11px]">
                                  รอยืนยัน
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-[#7A695B]">
                              {new Date(a.createdAt).toLocaleDateString("th-TH")}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {isSelf ? (
                                <span
                                  className="text-[11px] text-[#7A695B] italic"
                                  title="Super admin ไม่สามารถลบบัญชีของตนเองได้"
                                >
                                  ไม่สามารถลบตัวเองได้
                                </span>
                              ) : (
                                <button
                                  onClick={() => startCountdown("admin", a._id, a.username)}
                                  className="px-2.5 py-1 text-xs text-[#C0392B] hover:bg-red-50 border border-red-200 rounded-lg transition font-medium"
                                >
                                  ลบแอดมิน
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═════════════════ TAB 3: PROFILE & SETTINGS ═════════════════ */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-[#FAF8F5] border border-[#C59B27]/30 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#1C3A27] mb-1">
                  ข้อมูลส่วนตัว (Profile Information)
                </h2>
                <p className="text-xs text-[#7A695B] mb-6">
                  แก้ไขชื่อผู้ใช้และอีเมลประจำบัญชีผู้ดูแลระบบ
                </p>

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-[#4A3E37] uppercase tracking-wider mb-2">
                      ชื่อผู้ใช้ (Username)
                    </label>
                    <input
                      type="text"
                      required
                      minLength={3}
                      value={profileUsername}
                      onChange={(e) => setProfileUsername(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#D5C9BE] rounded-xl text-xs text-[#2C2520] outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3E37] uppercase tracking-wider mb-2">
                      อีเมล (Email)
                    </label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#D5C9BE] rounded-xl text-xs text-[#2C2520] outline-none focus:border-[#C59B27]"
                    />
                    <p className="text-[10px] text-[#7A695B] mt-1">
                      * หากเปลี่ยนอีเมล ระบบจะส่งลิงก์ยืนยันตัวตนไปยังอีเมลใหม่
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-5 py-2.5 bg-[#1C3A27] hover:bg-[#2D5A3F] text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {profileLoading ? "กำลังบันทึก..." : "บันทึกการแก้ไขโปรไฟล์"}
                  </button>
                </form>
              </div>

              {/* Password Card */}
              <div className="bg-[#FAF8F5] border border-[#C59B27]/30 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#1C3A27] mb-1">
                  เปลี่ยนรหัสผ่าน (Change Password)
                </h2>
                <p className="text-xs text-[#7A695B] mb-6">
                  กำหนดรหัสผ่านใหม่เพื่อความปลอดภัยในการเข้าใช้งาน
                </p>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-[#4A3E37] uppercase tracking-wider mb-2">
                      รหัสผ่านใหม่ (New Password)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="อย่างน้อย 8 ตัวอักษร"
                      className="w-full px-4 py-2.5 bg-white border border-[#D5C9BE] rounded-xl text-xs text-[#2C2520] outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3E37] uppercase tracking-wider mb-2">
                      ยืนยันรหัสผ่านใหม่ (Confirm Password)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                      className="w-full px-4 py-2.5 bg-white border border-[#D5C9BE] rounded-xl text-xs text-[#2C2520] outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-5 py-2.5 bg-[#1C3A27] hover:bg-[#2D5A3F] text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {passwordLoading ? "กำลังเปลี่ยนรหัสผ่าน..." : "เปลี่ยนรหัสผ่าน"}
                  </button>
                </form>
              </div>

              {/* Delete Account (Admin only, NOT super_admin) */}
              {user.role === "admin" && (
                <div className="bg-[#FDF0ED] border border-[#E8C4BB] rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-[#7A3020] mb-1">
                    ลบบัญชีผู้ใช้ของคุณ (Delete Account)
                  </h2>
                  <p className="text-xs text-[#7A3020]/80 mb-4">
                    การกระทำนี้ไม่สามารถย้อนกลับได้ บัญชีของคุณจะถูกลบออกจากระบบอย่างถาวร
                  </p>

                  <button
                    onClick={() => startCountdown("account", user.id, user.username)}
                    className="px-4 py-2.5 bg-[#C0392B] hover:bg-[#962D22] text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                  >
                    ลบบัญชีของฉัน
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── COUNTDOWN CONFIRMATION MODAL ── */}
      {countdown.active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-[#FAF8F5] border-2 border-[#C0392B] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center gap-3 text-[#C0392B]">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-base">ยืนยันการลบข้อมูล</h3>
                <p className="text-xs text-[#7A695B]">
                  {countdown.type === "booking" && `ลบรายการนัดหมายโฉนด: ${countdown.targetName}`}
                  {countdown.type === "admin" && `ลบผู้ดูแลระบบ: ${countdown.targetName}`}
                  {countdown.type === "account" && `ลบบัญชีผู้ใช้ของคุณถาวร`}
                </p>
              </div>
            </div>

            {/* Countdown Box */}
            {countdown.timerRef ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center space-y-3">
                <div className="text-4xl font-extrabold text-[#C0392B] animate-pulse">
                  {countdown.secondsLeft}
                </div>
                <p className="text-xs text-[#7A3020] font-semibold">
                  ระบบกำลังจะดำเนินการลบข้อมูลใน {countdown.secondsLeft} วินาที...
                </p>
                <p className="text-[11px] text-[#7A695B]">
                  ท่านสามารถกดยกเลิกได้ตลอดเวลาระหว่างนับถอยหลัง
                </p>
                <button
                  onClick={cancelCountdown}
                  className="w-full py-2.5 px-4 bg-white border-2 border-[#1C3A27] text-[#1C3A27] hover:bg-[#1C3A27] hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  ยกเลิกทันที (Cancel)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[#4A3E37] leading-relaxed">
                  เมื่อคุณกด &quot;ยืนยันการลบ&quot; ระบบจะเริ่มนับถอยหลัง 5 วินาที
                  เพื่อให้คุณมีเวลายืนยันหรือยกเลิกการกระทำนี้
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={cancelCountdown}
                    className="px-4 py-2 bg-[#EAE0D4] hover:bg-[#D5C9BE] text-[#4A3E37] text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={triggerCountdownTimer}
                    className="px-4 py-2 bg-[#C0392B] hover:bg-[#962D22] text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                  >
                    ยืนยันการลบ (เริ่มนับ 5 วินาที)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT BOOKING MODAL ── */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-[#C59B27]/40 rounded-2xl p-6 max-w-xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between mb-4 border-b border-[#EAE0D4] pb-3">
              <h3 className="font-bold text-lg text-[#1C3A27]">
                {editingBooking ? "แก้ไขรายการนัดหมาย" : "เพิ่มรายการนัดหมายใหม่"}
              </h3>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-[#7A695B] hover:text-[#2C2520] p-1 rounded-lg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#4A3E37] mb-1">
                    วันที่นัดหมาย (Appointment Date) *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.appointmentDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, appointmentDate: e.target.value })}
                    placeholder="เช่น 15 มีนาคม 2567"
                    className="w-full px-3 py-2 bg-white border border-[#D5C9BE] rounded-xl text-xs text-[#2C2520] outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A3E37] mb-1">
                    เลขที่โฉนดที่ดิน (Title Deed No.) *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.titleDeedNumber}
                    onChange={(e) => setBookingForm({ ...bookingForm, titleDeedNumber: e.target.value })}
                    placeholder="เช่น 12345"
                    className="w-full px-3 py-2 bg-white border border-[#D5C9BE] rounded-xl text-xs text-[#2C2520] outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A3E37] mb-1">
                    ตำบล (Sub-district) *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.subDistrict}
                    onChange={(e) => setBookingForm({ ...bookingForm, subDistrict: e.target.value })}
                    placeholder="เช่น ในเมือง"
                    className="w-full px-3 py-2 bg-white border border-[#D5C9BE] rounded-xl text-xs text-[#2C2520] outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A3E37] mb-1">
                    ทายาท/ผู้รับมรดก (Heir) *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.heir}
                    onChange={(e) => setBookingForm({ ...bookingForm, heir: e.target.value })}
                    placeholder="ชื่อ-นามสกุล ผู้สืบสันดาน"
                    className="w-full px-3 py-2 bg-white border border-[#D5C9BE] rounded-xl text-xs text-[#2C2520] outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A3E37] mb-1">
                    ผู้นัดรังวัด (Appointed By) *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.appointedBy}
                    onChange={(e) => setBookingForm({ ...bookingForm, appointedBy: e.target.value })}
                    placeholder="ชื่อ-นามสกุล ผู้นัดหมาย"
                    className="w-full px-3 py-2 bg-white border border-[#D5C9BE] rounded-xl text-xs text-[#2C2520] outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A3E37] mb-1">
                    ค่าธรรมเนียม (Fee - บาท) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={bookingForm.fee}
                    onChange={(e) => setBookingForm({ ...bookingForm, fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#D5C9BE] rounded-xl text-xs text-[#2C2520] outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A3E37] mb-1">
                    วันที่จดทะเบียน (Registration Date)
                  </label>
                  <input
                    type="text"
                    value={bookingForm.registrationDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, registrationDate: e.target.value })}
                    placeholder="เช่น 1 มกราคม 2567"
                    className="w-full px-3 py-2 bg-white border border-[#D5C9BE] rounded-xl text-xs text-[#2C2520] outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A3E37] mb-1">
                    เจ้าหน้าที่ผู้รับผิดชอบ (Officer) *
                  </label>
                  <select
                    required
                    value={bookingForm.employee}
                    onChange={(e) => setBookingForm({ ...bookingForm, employee: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D5C9BE] rounded-xl text-xs text-[#2C2520] outline-none focus:border-[#C59B27]"
                  >
                    <option value="">-- เลือกเจ้าหน้าที่ --</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} {emp.tel ? `(${emp.tel})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[#EAE0D4]">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 bg-[#EAE0D4] hover:bg-[#D5C9BE] text-[#4A3E37] text-xs font-bold rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={bookingModalLoading}
                  className="px-5 py-2 bg-[#1C3A27] hover:bg-[#2D5A3F] text-white text-xs font-bold rounded-xl transition disabled:opacity-50 cursor-pointer"
                >
                  {bookingModalLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE ADMIN MODAL (super_admin) ── */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-[#FAF8F5] border border-[#C59B27]/40 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-[#EAE0D4] pb-3">
              <h3 className="font-bold text-lg text-[#1C3A27]">
                เพิ่มผู้ดูแลระบบ (Create Admin)
              </h3>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="text-[#7A695B] hover:text-[#2C2520] p-1 rounded-lg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAdminCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#4A3E37] mb-1">
                  ชื่อผู้ใช้ (Username) *
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={adminForm.username}
                  onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                  placeholder="เช่น admin_somchai"
                  className="w-full px-3 py-2 bg-white border border-[#D5C9BE] rounded-xl text-xs text-[#2C2520] outline-none focus:border-[#C59B27]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A3E37] mb-1">
                  อีเมล (Email) *
                </label>
                <input
                  type="email"
                  required
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  placeholder="admin@landq.com"
                  className="w-full px-3 py-2 bg-white border border-[#D5C9BE] rounded-xl text-xs text-[#2C2520] outline-none focus:border-[#C59B27]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A3E37] mb-1">
                  รหัสผ่านเริ่มต้น (Password) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  className="w-full px-3 py-2 bg-white border border-[#D5C9BE] rounded-xl text-xs text-[#2C2520] outline-none focus:border-[#C59B27]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A3E37] mb-1">
                  ระดับสิทธิ์ (Role)
                </label>
                <select
                  value={adminForm.role}
                  onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value as "admin" | "super_admin" })}
                  className="w-full px-3 py-2 bg-white border border-[#D5C9BE] rounded-xl text-xs text-[#2C2520] outline-none focus:border-[#C59B27]"
                >
                  <option value="admin">Admin (ผู้ดูแลระบบทั่วไป)</option>
                  <option value="super_admin">Super Admin (ผู้ดูแลระบบสูงสุด)</option>
                </select>
              </div>

              <p className="text-[10px] text-[#7A695B]">
                * เมื่อสร้างบัญชีแล้ว ระบบจะส่งอีเมลยืนยันตัวตนไปยังอีเมลที่ระบุ เพื่อให้ผู้ดูแลเปิดใช้งานบัญชี
              </p>

              <div className="flex gap-3 justify-end pt-4 border-t border-[#EAE0D4]">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="px-4 py-2 bg-[#EAE0D4] hover:bg-[#D5C9BE] text-[#4A3E37] text-xs font-bold rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={adminModalLoading}
                  className="px-5 py-2 bg-[#C59B27] hover:bg-[#A8832A] text-white text-xs font-bold rounded-xl transition disabled:opacity-50 cursor-pointer"
                >
                  {adminModalLoading ? "กำลังสร้าง..." : "สร้างบัญชีแอดมิน"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="py-4 text-center text-xs text-[#7A695B] border-t border-[#EAE0D4] mt-auto">
        ระบบบริหารจัดการที่ดินและโฉนด · LandQ Official Management System © 2026
      </footer>
    </div>
  );
}
