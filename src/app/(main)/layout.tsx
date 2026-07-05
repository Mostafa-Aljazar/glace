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
      <div className="pb-14lg:pb-0">{children}</div>
      <BottomNav />
    </>
  );
}
