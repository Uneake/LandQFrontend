import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5EFE6] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-full bg-[#1C3A27] border-2 border-[#C59B27] flex items-center justify-center mb-6 shadow-md">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#C59B27">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
        </svg>
      </div>
      <h1 className="text-4xl font-extrabold text-[#1C3A27] mb-2">404</h1>
      <h2 className="text-xl font-bold text-[#4A3E37] mb-2">ไม่พบหน้าที่คุณต้องการ</h2>
      <p className="text-xs text-[#7A695B] max-w-sm mb-6">
        หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบ หรือไม่มีอยู่ในระบบ LandQ
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-[#1C3A27] hover:bg-[#2D5A3F] text-white text-xs font-bold rounded-xl transition shadow-md"
      >
        กลับสู่หน้าหลัก
      </Link>
    </div>
  );
}
