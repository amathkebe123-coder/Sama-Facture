"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useRateLimit() {
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = useCallback((seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    setRemainingSeconds(seconds);
    setIsLocked(true);

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const checkLimit = useCallback(async (email?: string): Promise<{ isLocked: boolean; remainingSeconds: number }> => {
    try {
      const res = await fetch("/api/auth/rate-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check", email }),
      });
      const data = await res.json();
      if (data.isLocked && data.remainingSeconds > 0) {
        startCountdown(data.remainingSeconds);
        return { isLocked: true, remainingSeconds: data.remainingSeconds };
      }
      setIsLocked(false);
      setRemainingSeconds(0);
      return { isLocked: false, remainingSeconds: 0 };
    } catch {
      return { isLocked: false, remainingSeconds: 0 };
    }
  }, [startCountdown]);

  const recordFailure = useCallback(async (email?: string): Promise<{ isLocked: boolean; remainingSeconds: number }> => {
    try {
      const res = await fetch("/api/auth/rate-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "record_failure", email }),
      });
      const data = await res.json();
      if (data.isLocked && data.remainingSeconds > 0) {
        startCountdown(data.remainingSeconds);
        return { isLocked: true, remainingSeconds: data.remainingSeconds };
      }
      return { isLocked: false, remainingSeconds: 0 };
    } catch {
      return { isLocked: false, remainingSeconds: 0 };
    }
  }, [startCountdown]);

  const resetLimit = useCallback(async (email?: string) => {
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsLocked(false);
      setRemainingSeconds(0);
      await fetch("/api/auth/rate-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", email }),
      });
    } catch {
      // Ignoré
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formattedCountdown = `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")}`;

  return {
    isLocked,
    remainingSeconds,
    formattedCountdown,
    checkLimit,
    recordFailure,
    resetLimit,
  };
}

