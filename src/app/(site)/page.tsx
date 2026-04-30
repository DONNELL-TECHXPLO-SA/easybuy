import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EasyBuy",
  description: "EasyBuy - Your online shopping destination",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
