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
import { UserButton, useClerk } from "@clerk/nextjs";
import { useInventoryStore } from "@/lib/store";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user } = useClerk();
  const resetStore = useInventoryStore((state) => state.reset);
  useEffect(() => {
    if (user === null) {
      console.log(user, "user");
      resetStore();
      localStorage.clear();
    }
  }, [user, resetStore]);

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

        {/* Sign out safely */}

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
