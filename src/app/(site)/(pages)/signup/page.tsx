import Signup from "@/components/Auth/Signup";
import React, { Suspense } from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Signup Page | NextCommerce Nextjs E-commerce template",
  description: "This is Signup Page for NextCommerce Template",
  // other metadata
};

const SignupPage = () => {
  return (
    <main>
      <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
        <Signup />
      </Suspense>
    </main>
  );
};

export default SignupPage;
