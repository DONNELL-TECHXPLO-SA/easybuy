import ClientWrapper from "@/components/Common/ClientWrapper";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientWrapper>{children}</ClientWrapper>;
}
