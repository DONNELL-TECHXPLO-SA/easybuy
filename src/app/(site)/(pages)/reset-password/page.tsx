import React from "react";
import Reset from "@/components/Auth/Reset";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password - EasyBuy",
  description: "Set a new password for your EasyBuy account",
};

const ResetPasswordPage = () => {
  return <Reset />;
};

export default ResetPasswordPage;
