"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
};

type Props = {
  profile: Profile | null;
  onProfileUpdated: (profile: Profile) => void;
};

const AccountDetailsTab = ({ profile, onProfileUpdated }: Props) => {
  const [form, setForm] = useState<Profile>({
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
    phone: profile?.phone ?? "",
    country: profile?.country ?? "",
  });
  const [saving, setSaving] = useState(false);

  const inputClass =
    "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be signed in.");
        return;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .update(form as never)
        .eq("id", session.user.id)
        .select("first_name, last_name, phone, country")
        .maybeSingle() as { data: Profile | null; error: unknown };

      if (error) {
        toast.error("Failed to update profile.");
        return;
      }

      if (data) onProfileUpdated(data);
      toast.success("Profile updated.");
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="first_name" className="block mb-2.5">
              First Name <span className="text-red">*</span>
            </label>
            <input
              type="text"
              name="first_name"
              id="first_name"
              placeholder="John"
              value={form.first_name}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div className="w-full">
            <label htmlFor="last_name" className="block mb-2.5">
              Last Name <span className="text-red">*</span>
            </label>
            <input
              type="text"
              name="last_name"
              id="last_name"
              placeholder="Doe"
              value={form.last_name}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="phone" className="block mb-2.5">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              id="phone"
              placeholder="+27 123 456 789"
              value={form.phone}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="w-full">
            <label htmlFor="country" className="block mb-2.5">
              Country / Region
            </label>
            <input
              type="text"
              name="country"
              id="country"
              placeholder="South Africa"
              value={form.country}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <p className="text-custom-sm mt-5 mb-9">
        This will be how your name will be displayed in the account section and
        in reviews
      </p>
    </form>
  );
};

export default AccountDetailsTab;
