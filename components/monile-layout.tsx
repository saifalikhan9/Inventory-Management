"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { UserButton, useUser } from "@clerk/nextjs";
import { useInventoryStore } from "@/lib/store";
import { setInterval } from "timers/promises";
import { LoaderOne } from "./loader";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loader, setLoader] = useState(true);
  const { user } = useUser(); // useUser is preferred over useClerk for easier access

  const resetStore = useInventoryStore((state) => state.reset);

  useEffect(() => {
    const storageData = localStorage.getItem("Inventory-Storage");
    if (!user?.id || !storageData) return;

    try {
      const parsed = JSON.parse(storageData);
      const storedUserId = parsed?.state?.sales?.[0]?.userId;

      if (storedUserId && user.id !== storedUserId) {
        console.log("Mismatch detected. Clearing local data.");
        resetStore();
        localStorage.clear();
      }
    } catch (err) {
      console.warn("Error parsing local storage", err);
      resetStore();
      localStorage.clear();
    }
  }, [user?.id, resetStore]);
  useEffect(() => {
    const interval = setTimeout(() => setLoader(false), 1000);
    return () => {
      clearTimeout(interval);
    };
  });

  if (loader) {
    return (
      <div className=" flex justify-center items-center min-h-screen">
        <LoaderOne />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="p-6 pb-4">
              <SheetTitle className="text-left">InventoryPro</SheetTitle>
            </SheetHeader>
            <MobileSidebar onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold text-gray-900">InventoryPro</h1>

        <UserButton />
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <MobileSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 w-full min-w-0">{children}</main>
      </div>
    </div>
  );
}
