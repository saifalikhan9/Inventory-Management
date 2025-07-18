// components/CustomerInfoCard.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";

interface CustomerInfoCardProps {
  customerName: string;
  setCustomerName: (name: string) => void;
  customerContact: number;
  setCustomerContact: (contact: number) => void;
   setpaymentMethod:(method:string)=> void,
  setpaymentStatus: (status:string)=> void,
  amountPaid : number,
  setAmountPaid : (amount:string)=> void,
}

export function CustomerInfoCard({
  customerName,
  setCustomerName,
  customerContact,
  setCustomerContact,
  setpaymentMethod,
  setpaymentStatus,
  amountPaid,
  setAmountPaid
}: CustomerInfoCardProps) {
  return (
    <Card className="rounded-t-none" >
      <CardHeader>
        <CardTitle className="text-xl">Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
           <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
          />
        </div>
         <div className="space-y-2">
          <Label htmlFor="customerContact">Customer Contact</Label>
          <Input
            id="customerContact"
            type="text"
            value={customerContact || ""}
            onChange={(e) => {
              const value = e.target.value
                if (/^[0-9]*$/.test(value)) {
                  setCustomerContact(value)
                }
              }}
            placeholder="Enter customer contact"
          />
        </div>
         <div className="space-y-2">
          <Label htmlFor="amountPaid">Amount paid</Label>
          <Input
            id="amountPaid"
            type="text"
            value={amountPaid || ""}
            onChange={(e) => {
              const value = e.target.value
                if (/^[0-9]*$/.test(value)) {
                  setAmountPaid(value)
                }
              }}
            placeholder="Enter paid amount by the customer"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentMode">Payment Mode</Label>
          <Select onValueChange={(value)=>setpaymentMethod(value)}>
        <SelectTrigger>
  <SelectValue  placeholder="Select a Payment Mode" />
        </SelectTrigger>
           <SelectContent>
        <SelectGroup>
          <SelectLabel>Modes</SelectLabel>
          <SelectItem value="CASH">CASH</SelectItem>
          <SelectItem value="ONLINE">ONLINE</SelectItem>
        </SelectGroup>
      </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentMode">Payment Mode</Label>
          <Select onValueChange={(value)=>setpaymentStatus(value)}>
        <SelectTrigger>
  <SelectValue  placeholder="Select a Payment Mode" />
        </SelectTrigger>
           <SelectContent>
        <SelectGroup>
          <SelectLabel>Modes</SelectLabel>
          <SelectItem value="PENDING">PENDING</SelectItem>
          <SelectItem value="PAID">PAID</SelectItem>
        </SelectGroup>
      </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}