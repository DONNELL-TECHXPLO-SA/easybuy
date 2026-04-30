import React from "react";
import { notFound } from "next/navigation";
import { createClient as createBrowserClient } from "@supabase/supabase-js";
import type { ApiProduct } from "@/types/product";
import ShopDetails from "@/components/ShopDetails";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

function getAnonClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = getAnonClient();
  const { data } = await supabase
    .from("products")
    .select("title")
    .eq("id", Number(id))
    .maybeSingle();

  const title = (data as { title: string } | null)?.title ?? "Product";
  return {
    title: `${title} | NextCommerce`,
    description: `Shop ${title}`,
  };
}

export default async function ShopDetailsPage({ params }: Props) {
  const { id } = await params;
  const productId = Number(id);

  if (!productId || isNaN(productId)) notFound();

  const supabase = getAnonClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();

  if (error || !data) notFound();

  const product = data as ApiProduct;

  return (
    <main>
      <ShopDetails product={product} />
    </main>
  );
}
