"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
};

type Props = {
  profile: Profile | null;
  email: string;
};

const DashboardTab = ({ profile, email }: Props) => {
  const router = useRouter();
  const { user, firstName: authFirstName } = useAuth();

  const firstName = profile?.first_name || authFirstName || user?.user_metadata?.first_name || "";
  const lastName = profile?.last_name || "";
  const fullName = (firstName + " " + lastName).trim() || user?.email?.split("@")[0] || "there";
  const displayEmail = email || user?.email || "";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return (
    <div>
      <p className="text-dark text-base">
        Hello <strong>{fullName}</strong>! (Not {fullName}?{" "}
        <button
          onClick={handleLogout}
          className="text-red ease-out duration-200 hover:underline"
        >
          Log Out
        </button>
        )
      </p>
      {displayEmail && (
        <p className="text-custom-sm mt-2 text-dark-4">
          Signed in as <strong className="text-dark">{displayEmail}</strong>
        </p>
      )}
      <p className="text-custom-sm mt-4 text-dark">
        From your account dashboard you can view your recent orders, manage your
        shipping and billing addresses, and edit your password and account
        details.
      </p>
    </div>
  );
};

export default DashboardTab;
