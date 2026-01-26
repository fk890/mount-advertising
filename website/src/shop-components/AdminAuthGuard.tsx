"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Utility to fetch current user from backend
async function fetchCurrentUser() {
  try {
    const res = await fetch("/api/auth/me", {
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.user || null;
  } catch {
    return null;
  }
}

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const user = await fetchCurrentUser();
      if (!user || (user.role !== "admin" && user.role !== "super-admin")) {
        router.replace("/shop/admin/login");
      }
    })();
  }, [router]);

  return <>{children}</>;
}
