"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

type Address = {
  id?: string;
  type: string;
  first_name: string;
  last_name: string;
  company: string;
  country: string;
  street_address: string;
  street_address_2: string;
  city: string;
  phone: string;
  email: string;
  is_default: boolean;
};

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  address?: Address | null;
  onSaved: (address: Address) => void;
};

const emptyAddress: Address = {
  type: "shipping",
  first_name: "",
  last_name: "",
  company: "",
  country: "",
  street_address: "",
  street_address_2: "",
  city: "",
  phone: "",
  email: "",
  is_default: false,
};

const AddressModal = ({ isOpen, closeModal, address, onSaved }: Props) => {
  const [form, setForm] = useState<Address>(emptyAddress);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (address) {
      setForm(address);
    } else {
      setForm(emptyAddress);
    }
  }, [address, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as Element).closest(".modal-content")) {
        closeModal();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeModal]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
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

      const isEdit = !!form.id;
      const payload = {
        type: form.type,
        first_name: form.first_name,
        last_name: form.last_name,
        company: form.company,
        country: form.country,
        street_address: form.street_address,
        street_address_2: form.street_address_2,
        city: form.city,
        phone: form.phone,
        email: form.email,
        is_default: form.is_default,
      };

      let data: Address | null = null;
      let error: unknown = null;

      if (isEdit) {
        const result = await supabase
          .from("addresses")
          .update(payload as never)
          .eq("id", form.id!)
          .eq("user_id", session.user.id)
          .select()
          .maybeSingle() as { data: Address | null; error: unknown };
        data = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from("addresses")
          .insert({ ...payload, user_id: session.user.id } as never)
          .select()
          .maybeSingle() as { data: Address | null; error: unknown };
        data = result.data;
        error = result.error;
      }

      if (error) {
        toast.error("Failed to save address.");
        return;
      }

      toast.success(isEdit ? "Address updated." : "Address saved.");
      if (data) onSaved(data);
      closeModal();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

  return (
    <div
      className={`fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 bg-dark/70 sm:px-8 px-4 py-5 ${
        isOpen ? "block z-99999" : "hidden"
      }`}
    >
      <div className="flex items-center justify-center">
        <div className="w-full max-w-[1100px] rounded-xl shadow-3 bg-white p-7.5 relative modal-content">
          <button
            onClick={closeModal}
            aria-label="Close modal"
            className="absolute top-3 right-3 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-gray-2 text-dark hover:bg-gray-3"
          >
            <svg
              className="fill-current"
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z"
                fill=""
              />
            </svg>
          </button>

          <h3 className="font-medium text-xl text-dark mb-6">
            {form.id ? "Edit Address" : "Add New Address"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
              <div className="w-full">
                <label htmlFor="first_name" className="block mb-2.5">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  required
                  className={inputClass}
                />
              </div>

              <div className="w-full">
                <label htmlFor="last_name" className="block mb-2.5">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
              <div className="w-full">
                <label htmlFor="email" className="block mb-2.5">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className={inputClass}
                />
              </div>

              <div className="w-full">
                <label htmlFor="phone" className="block mb-2.5">
                  Phone
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+27 123 456 789"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
              <div className="w-full">
                <label htmlFor="company" className="block mb-2.5">
                  Company (optional)
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Acme Corp"
                  className={inputClass}
                />
              </div>

              <div className="w-full">
                <label htmlFor="country" className="block mb-2.5">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="South Africa"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="street_address" className="block mb-2.5">
                Street Address
              </label>
              <input
                type="text"
                id="street_address"
                name="street_address"
                value={form.street_address}
                onChange={handleChange}
                placeholder="House number and street name"
                required
                className={inputClass}
              />
              <input
                type="text"
                name="street_address_2"
                value={form.street_address_2}
                onChange={handleChange}
                placeholder="Apartment, suite, unit, etc. (optional)"
                className={`${inputClass} mt-4`}
              />
            </div>

            <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
              <div className="w-full">
                <label htmlFor="city" className="block mb-2.5">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Cape Town"
                  required
                  className={inputClass}
                />
              </div>

              <div className="w-full">
                <label htmlFor="type" className="block mb-2.5">
                  Address Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="shipping">Shipping</option>
                  <option value="billing">Billing</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <input
                type="checkbox"
                id="is_default"
                name="is_default"
                checked={form.is_default}
                onChange={handleChange}
                className="w-4 h-4 accent-blue"
              />
              <label htmlFor="is_default" className="text-custom-sm text-dark cursor-pointer">
                Set as default address
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Address"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
