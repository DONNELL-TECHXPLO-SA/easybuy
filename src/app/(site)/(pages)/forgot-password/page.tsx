import React from "react";
import Forgot from "@/components/Auth/Forgot";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password - EasyBuy",
  description: "Reset your EasyBuy account password",
};

const ForgotPasswordPage = () => {
  return <Forgot />;
};

export default ForgotPasswordPage;
