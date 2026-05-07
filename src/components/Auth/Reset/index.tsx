"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

const Reset = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const initializeRecoverySession = async () => {
      try {
        setSessionError(null);

        const {
          data: { session: existingSession },
        } = await supabase.auth.getSession();

        if (existingSession) {
          return;
        }

        const url = new URL(window.location.href);
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");

        // Support token_hash recovery links.
        if (tokenHash && type === "recovery") {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });

          if (error) {
            throw error;
          }

          window.history.replaceState({}, "", "/reset-password");
          return;
        }

        // Support legacy hash-based recovery links.
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const hashType = hashParams.get("type");

        if (accessToken && refreshToken && hashType === "recovery") {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }

          window.history.replaceState({}, "", "/reset-password");
          return;
        }

        setSessionError("Invalid or expired reset link. Please request a new one.");
      } catch (err) {
        console.error("Failed to initialize reset session:", err);
        setSessionError("Invalid or expired reset link. Please request a new one.");
      } finally {
        setIsCheckingSession(false);
      }
    };

    initializeRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setSessionError(null);

    try {
      const supabase = createClient();
      
      // Explicitly check session before updating
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const message = "Invalid or expired reset session. Please request a new link.";
        setSessionError(message);
        toast.error(message);
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      toast.success("Password updated successfully!");
      
      // Delay redirect slightly so toast is visible
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
      
    } catch (err) {
      console.error("Reset password error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update password.");
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb title={"Reset Password"} pages={["Reset Password"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Set New Password
              </h2>
              <p>Enter your new password below</p>
            </div>

            <form onSubmit={handleSubmit}>
              {sessionError && (
                <p className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {sessionError}
                </p>
              )}

              <div className="mb-5">
                <label htmlFor="password" title="New Password" className="block mb-2.5">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="confirmPassword" title="Confirm Password" className="block mb-2.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !!sessionError}
                className="w-full flex justify-center items-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Reset;
