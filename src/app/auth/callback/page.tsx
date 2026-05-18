"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/my-account");
      } else {
        router.push("/signin?error=Verification failed. Please try again.");
      }
    });
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-2">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-dark border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg text-dark-5">Verifying your email...</p>
      </div>
    </div>
  );
}
