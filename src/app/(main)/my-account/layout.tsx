import MyAccountClientPage from "@/components/Account/MyAccountClientPage";

export default function MyAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MyAccountClientPage>{children}</MyAccountClientPage>;
}
