"use client";

import LogOutButton from "./LogOutButton";
import { useAuth } from "@/context/AuthContext";
import TopMenuButton from "./TopMenuButton";
import Image from "next/image";
import dolLogo from "@/images/dol.png";
export default function TopMenu(){

  
  const { user } = useAuth();
  

  return (
    <div>
      <header className="bg-[#1C3A27] border-b-4 border-[#C59B27] shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div >
              <Image
                src={dolLogo}
                alt="กรมที่ดิน"
                width={40}
                height={40}
                className="h-full w-full rounded-full object-contain p-1"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-col">
                  <h1 className="text-white font-bold text-lg leading-tight tracking-wide">
                    LandQ
                  </h1>
                  <p className="text-[#C59B27] text-xs font-semibold tracking-widest uppercase">
                    ระบบตรวจสอบนัดโอนมรดกที่ดิน
                  </p>
                </div>
                
                {
                user ? 
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${user?.role === "super_admin"
                      ? "bg-[#C59B27] text-[#1C3A27]"
                      : "bg-[#2D5A3F] text-white border border-[#C59B27]/40"
                      }`}
                  >
                      {user?.role === "super_admin" ? "Super Admin" : "Admin"}
                  </span> : ""
                }
              </div>
              {
                user ? 
                <p className="text-[#C59B27] text-xs font-medium">
                 ยินดีต้อนรับ, {user?.username} ({user?.email})
                </p> : ""
              }
            </div>
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            
            <TopMenuButton/>
            { user ? <LogOutButton/> : "" }
          </div>
        </div>
      </header>
    </div>
  );
}