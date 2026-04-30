import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import ClientWrapper from "@/components/Common/ClientWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
