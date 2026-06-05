"use client";

import { useEffect } from "react";
import { onRateLimit } from "../services/apiEvents";
import { useToast } from "./Toast";

export default function RateLimitListener() {
  const { toast } = useToast();

  useEffect(() => {
    const unsub = onRateLimit((err) => {
      toast(err.message, "error");
    });
    return unsub;
  }, [toast]);

  return null;
}
