import LogoNav from "@/components/Common/LogoNav";
import BottomNav from "@/components/Common/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LogoNav />
      {children}
      <BottomNav />
    </>
  );
}
