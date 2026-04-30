"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import Breadcrumb from "../Common/Breadcrumb";
import Orders from "../Orders";
import AddressModal from "./AddressModal";
import AddressCard from "./AddressCard";
import DashboardTab from "./DashboardTab";
import AccountDetailsTab from "./AccountDetailsTab";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/app/context/AuthContext";

type Profile = {
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
};

type Address = {
  id: string;
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

const NAV_TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders", label: "Orders" },
  { id: "downloads", label: "Downloads" },
  { id: "addresses", label: "Addresses" },
  { id: "account-details", label: "Account Details" },
  { id: "logout", label: "Logout" },
];

const NAV_ICONS: Record<string, React.ReactNode> = {
  dashboard: (
    <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M5.91002 1.60413C5.08642 1.6041 4.39962 1.60408 3.85441 1.67738C3.27893 1.75475 2.75937 1.92495 2.34185 2.34246C1.92434 2.75998 1.75414 3.27954 1.67677 3.85502C1.60347 4.40023 1.60349 5.08701 1.60352 5.9106V6.00596C1.60349 6.82956 1.60347 7.51636 1.67677 8.06157C1.75414 8.63705 1.92434 9.15661 2.34185 9.57413C2.75937 9.99164 3.27893 10.1618 3.85441 10.2392C4.39962 10.3125 5.0864 10.3125 5.90999 10.3125H6.00535C6.82894 10.3125 7.51575 10.3125 8.06096 10.2392C8.63644 10.1618 9.156 9.99164 9.57352 9.57413C9.99103 9.15661 10.1612 8.63705 10.2386 8.06157C10.3119 7.51636 10.3119 6.82958 10.3119 6.00599V5.91063C10.3119 5.08704 10.3119 4.40023 10.2386 3.85502C10.1612 3.27954 9.99103 2.75998 9.57352 2.34246C9.156 1.92495 8.63644 1.75475 8.06096 1.67738C7.51575 1.60408 6.82897 1.6041 6.00538 1.60413H5.91002ZM15.9934 1.60413C15.1698 1.6041 14.483 1.60408 13.9377 1.67738C13.3623 1.75475 12.8427 1.92495 12.4252 2.34246C12.0077 2.75998 11.8375 3.27954 11.7601 3.85502C11.6868 4.40024 11.6868 5.08702 11.6869 5.91063V6.00596C11.6868 6.82957 11.6868 7.51635 11.7601 8.06157C11.8375 8.63705 12.0077 9.15661 12.4252 9.57413C12.8427 9.99164 13.3623 10.1618 13.9377 10.2392C14.483 10.3125 15.1697 10.3125 15.9933 10.3125H16.0887C16.9123 10.3125 17.5991 10.3125 18.1443 10.2392C18.7198 10.1618 19.2393 9.99164 19.6569 9.57413C20.0744 9.15661 20.2446 8.63705 20.3219 8.06157C20.3952 7.51636 20.3952 6.82958 20.3952 6.00599V5.91063C20.3952 5.08704 20.3952 4.40023 20.3219 3.85502C20.2446 3.27954 20.0744 2.75998 19.6569 2.34246C19.2393 1.92495 18.7198 1.75475 18.1443 1.67738C17.5991 1.60408 16.9123 1.6041 16.0887 1.60413H15.9934ZM5.91002 11.6875H6.00535C6.82896 11.6874 7.51574 11.6874 8.06096 11.7607C8.63644 11.8381 9.156 12.0083 9.57352 12.4258C9.99103 12.8433 10.1612 13.3629 10.2386 13.9384C10.3119 14.4836 10.3119 15.1703 10.3119 15.9939V16.0893C10.3119 16.9129 10.3119 17.5997 10.2386 18.1449C10.1612 18.7204 9.99103 19.2399 9.57352 19.6575C9.156 20.075 8.63644 20.2452 8.06096 20.3225C7.51575 20.3958 6.82899 20.3958 6.0054 20.3958H5.91002C5.08644 20.3958 4.39962 20.3958 3.85441 20.3225C3.27893 20.2452 2.75937 20.075 2.34185 19.6575C1.92434 19.2399 1.75414 18.7204 1.67677 18.1449C1.60347 17.5997 1.60349 16.9129 1.60352 16.0893V15.994C1.60349 15.1704 1.60347 14.4836 1.67677 13.9384C1.75414 13.3629 1.92434 12.8433 2.34185 12.4258C2.75937 12.0083 3.27893 11.8381 3.85441 11.7607C4.39963 11.6874 5.08641 11.6874 5.91002 11.6875ZM15.9934 11.6875C15.1697 11.6874 14.483 11.6874 13.9377 11.7607C13.3623 11.8381 12.8427 12.0083 12.4252 12.4258C12.0077 12.8433 11.8375 13.3629 11.7601 13.9384C11.6868 14.4836 11.6868 15.1704 11.6869 15.994V16.0893C11.6868 16.9129 11.6868 17.5997 11.7601 18.1449C11.8375 18.7204 12.0077 19.2399 12.4252 19.6575C12.8427 20.075 13.3623 20.2452 13.9377 20.3225C14.4829 20.3958 15.1697 20.3958 15.9933 20.3958H16.0887C16.9123 20.3958 17.5991 20.3958 18.1443 20.3225C18.7198 20.2452 19.2393 20.075 19.6569 19.6575C20.0744 19.2399 20.2446 18.7204 20.3219 18.1449C20.3952 17.5997 20.3952 16.913 20.3952 16.0894V15.994C20.3952 15.1704 20.3952 14.4836 20.3219 13.9384C20.2446 13.3629 20.0744 12.8433 19.6569 12.4258C19.2393 12.0083 18.7198 11.8381 18.1443 11.7607C17.5991 11.6874 16.9123 11.6874 16.0887 11.6875H15.9934Z" fill="" />
    </svg>
  ),
  orders: (
    <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.0203 11.9167C8.0203 11.537 7.71249 11.2292 7.3328 11.2292C6.9531 11.2292 6.6453 11.537 6.6453 11.9167V15.5833C6.6453 15.963 6.9531 16.2708 7.3328 16.2708C7.71249 16.2708 8.0203 15.963 8.0203 15.5833V11.9167Z" fill="" />
      <path d="M14.6661 11.2292C15.0458 11.2292 15.3536 11.537 15.3536 11.9167V15.5833C15.3536 15.963 15.0458 16.2708 14.6661 16.2708C14.2864 16.2708 13.9786 15.963 13.9786 15.5833V11.9167C13.9786 11.537 14.2864 11.2292 14.6661 11.2292Z" fill="" />
      <path d="M11.687 11.9167C11.687 11.537 11.3792 11.2292 10.9995 11.2292C10.6198 11.2292 10.312 11.537 10.312 11.9167V15.5833C10.312 15.963 10.6198 16.2708 10.9995 16.2708C11.3792 16.2708 11.687 15.963 11.687 15.5833V11.9167Z" fill="" />
    </svg>
  ),
  downloads: (
    <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.5074 15.1306C11.3772 15.273 11.193 15.3542 11 15.3542C10.807 15.3542 10.6229 15.273 10.4926 15.1306L6.82594 11.1202C6.56973 10.8399 6.5892 10.4051 6.86943 10.1489C7.14966 9.89265 7.58452 9.91212 7.84073 10.1923L10.3125 12.8958V2.75C10.3125 2.3703 10.6203 2.0625 11 2.0625C11.3797 2.0625 11.6875 2.3703 11.6875 2.75V12.8958L14.1593 10.1923C14.4155 9.91212 14.8503 9.89265 15.1306 10.1489C15.4108 10.4051 15.4303 10.8399 15.1741 11.1202L11.5074 15.1306Z" fill="" />
    </svg>
  ),
  addresses: (
    <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.25065 15.8125C7.87096 15.8125 7.56315 16.1203 7.56315 16.5C7.56315 16.8797 7.87096 17.1875 8.25065 17.1875H13.7507C14.1303 17.1875 14.4382 16.8797 14.4382 16.5C14.4382 16.1203 14.1303 15.8125 13.7507 15.8125H8.25065Z" fill="" />
    </svg>
  ),
  "account-details": (
    <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M10.9995 1.14581C8.59473 1.14581 6.64531 3.09524 6.64531 5.49998C6.64531 7.90472 8.59473 9.85415 10.9995 9.85415C13.4042 9.85415 15.3536 7.90472 15.3536 5.49998C15.3536 3.09524 13.4042 1.14581 10.9995 1.14581ZM8.02031 5.49998C8.02031 3.85463 9.35412 2.52081 10.9995 2.52081C12.6448 2.52081 13.9786 3.85463 13.9786 5.49998C13.9786 7.14533 12.6448 8.47915 10.9995 8.47915C9.35412 8.47915 8.02031 7.14533 8.02031 5.49998Z" fill="" />
    </svg>
  ),
  logout: (
    <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.7507 10.3125C14.1303 10.3125 14.4382 10.6203 14.4382 11C14.4382 11.3797 14.1303 11.6875 13.7507 11.6875H3.69247L5.48974 13.228C5.77802 13.4751 5.81141 13.9091 5.56431 14.1974C5.3172 14.4857 4.88318 14.5191 4.5949 14.272L1.38657 11.522C1.23418 11.3914 1.14648 11.2007 1.14648 11C1.14648 10.7993 1.23418 10.6086 1.38657 10.478L4.5949 7.72799C4.88318 7.48089 5.3172 7.51428 5.56431 7.80256C5.81141 8.09085 5.77802 8.52487 5.48974 8.77197L3.69247 10.3125H13.7507Z" fill="" />
    </svg>
  ),
};

const MyAccount = () => {
  const router = useRouter();
  const { user, firstName: authFirstName } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [addressModal, setAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    const supabase = createClient();

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setEmail(session.user.email ?? "");

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("first_name, last_name, phone, country")
        .eq("id", session.user.id)
        .maybeSingle() as { data: Profile | null; error: unknown };

      if (profileData) setProfile(profileData);

      const { data: addressData } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false }) as { data: Address[] | null; error: unknown };

      if (addressData) setAddresses(addressData);
    })();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/signin");
  };

  const handleTabClick = (id: string) => {
    if (id === "logout") {
      handleLogout();
      return;
    }
    setActiveTab(id);
  };

  const openAddAddress = () => {
    setEditingAddress(null);
    setAddressModal(true);
  };

  const openEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressModal(true);
  };

  const handleAddressSaved = (saved: Address) => {
    setAddresses((prev) => {
      const idx = prev.findIndex((a) => a.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
  };

  const handleAddressDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) {
        toast.error("Failed to delete address.");
        return;
      }
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Address deleted.");
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  const firstName = profile?.first_name || authFirstName || user?.user_metadata?.first_name || "";
  const lastName = profile?.last_name || "";
  const fullName = (firstName + " " + lastName).trim() || user?.email?.split("@")[0] || "Member";

  return (
    <>
      <Breadcrumb title={"My Account"} pages={["my account"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="flex xl:flex-col">
                <div className="hidden lg:flex flex-wrap items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-r xl:border-r-0 xl:border-b border-gray-3">
                  <div className="max-w-[64px] w-full h-16 rounded-full overflow-hidden">
                    <Image
                      src="/images/users/user-04.jpg"
                      alt="user"
                      width={64}
                      height={64}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-dark mb-0.5">{fullName}</p>
                    <p className="text-custom-xs">{email}</p>
                  </div>
                </div>

                <div className="p-4 sm:p-7.5 xl:p-9">
                  <div className="flex flex-wrap xl:flex-nowrap xl:flex-col gap-4">
                    {NAV_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                          activeTab === tab.id
                            ? "text-white bg-blue"
                            : "text-dark-2 bg-gray-1"
                        }`}
                      >
                        {NAV_ICONS[tab.id]}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${
                activeTab === "dashboard" ? "block" : "hidden"
              }`}
            >
              <DashboardTab profile={profile} email={email} />
            </div>

            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 ${
                activeTab === "orders" ? "block" : "hidden"
              }`}
            >
              <Orders />
            </div>

            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${
                activeTab === "downloads" ? "block" : "hidden"
              }`}
            >
              <p>You don&apos;t have any downloads</p>
            </div>

            <div
              className={`flex-col gap-7.5 ${
                activeTab === "addresses" ? "flex" : "hidden"
              }`}
            >
              <div className="flex justify-end">
                <button
                  onClick={openAddAddress}
                  className="inline-flex items-center gap-2 font-medium text-white bg-blue py-2.5 px-5 rounded-md ease-out duration-200 hover:bg-blue-dark"
                >
                  <svg
                    className="fill-current"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 2C8.41421 2 8.75 2.33579 8.75 2.75V7.25H13.25C13.6642 7.25 14 7.58579 14 8C14 8.41421 13.6642 8.75 13.25 8.75H8.75V13.25C8.75 13.6642 8.41421 14 8 14C7.58579 14 7.25 13.6642 7.25 13.25V8.75H2.75C2.33579 8.75 2 8.41421 2 8C2 7.58579 2.33579 7.25 2.75 7.25H7.25V2.75C7.25 2.33579 7.58579 2 8 2Z"
                      fill=""
                    />
                  </svg>
                  Add Address
                </button>
              </div>

              {addresses.length > 0 ? (
                <div className="flex flex-wrap gap-7.5">
                  {addresses.map((address) => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      onEdit={openEditAddress}
                      onDelete={handleAddressDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
                  <p className="text-dark">You don&apos;t have any saved addresses yet.</p>
                </div>
              )}
            </div>

            <div
              className={`xl:max-w-[770px] w-full ${
                activeTab === "account-details" ? "block" : "hidden"
              }`}
            >
              <AccountDetailsTab
                profile={profile}
                onProfileUpdated={(updated) => setProfile(updated)}
              />
            </div>
          </div>
        </div>
      </section>

      <AddressModal
        isOpen={addressModal}
        closeModal={() => setAddressModal(false)}
        address={editingAddress}
        onSaved={handleAddressSaved}
      />
    </>
  );
};

export default MyAccount;
