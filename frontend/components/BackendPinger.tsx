"use client";
import { useEffect } from "react";
import { pingBackend } from "@/lib/api";

export function BackendPinger() {
  useEffect(() => {
    pingBackend();
  }, []);
  return null;
}
