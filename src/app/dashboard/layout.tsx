export const dynamic = "force-dynamic";

import SidebarWithHeader from "~/components/AlefpageSection/SideBar/page";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarWithHeader>{children}</SidebarWithHeader>;
}
