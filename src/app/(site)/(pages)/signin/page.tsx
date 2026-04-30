import Signin from "@/components/Auth/Signin";
import React, { Suspense } from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Signin Page | NextCommerce Nextjs E-commerce template",
  description: "This is Signin Page for NextCommerce Template",
};

const SigninPage = () => {
  return (
    <main>
      <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
        <Signin />
      </Suspense>
    </main>
  );
};

export default SigninPage;
