"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs";

import Link from "next/link";
import { useInventoryStore } from "@/lib/store";

export default function Home() {
  const { isSignedIn } = useUser();
  const reset = useInventoryStore((state) => state.reset);
  useEffect(() => {
    if (!isSignedIn) {
      reset();
      sessionStorage.removeItem("Inventory-Storage");
    }
  }, [reset, isSignedIn]);
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 px-4 py-16 flex flex-col items-center text-center">
      {/* Hero Section */}
      <section className="max-w-3xl space-y-6">
        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900">
          Smart Inventory Management
        </h1>
        <p className="text-lg sm:text-xl text-gray-600">
          Track products, manage sales, and monitor stock levels all in one
          place. Built for businesses of any size.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mt-6">
          <SignedOut>
            <SignUpButton>
              <Button>Get Started</Button>
            </SignUpButton>
            <SignInButton>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-6 py-2 flex items-center gap-2"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href={"dashboard"}>
              <Button>Dashboard</Button>
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Features Section */}
      <section className="mt-24 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {[
          {
            title: "Real-time Stock Tracking",
            desc: "Update inventory instantly after every sale or restock.",
          },
          {
            title: "Sales Analytics",
            desc: "View and export detailed reports for better decisions.",
          },
          {
            title: "Customer Management",
            desc: "Save customer info, history, and purchase behavior.",
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white shadow-md p-6 border border-gray-200"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mt-32 text-gray-500 text-sm">
        © {new Date().getFullYear()} InventoryPro. All rights reserved.
      </footer>
    </main>
  );
}
