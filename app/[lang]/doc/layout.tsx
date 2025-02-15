import { Metadata } from "next";
import { docNavMenuItems, homeNavItems } from "@/config/site";
import CommonNavbar from "@/app/_components/server-client/navbar";
import CommonDrawer from "@/app/_components/client-only/drawer";
import { TreeSection } from "@/app/_components/client-only/tree-section";

export const metadata: Metadata = {
  description: "Abacus Documentation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <CommonNavbar navItems={homeNavItems}>
        <CommonDrawer title="Doc Drawer">
          <TreeSection treeProps={docNavMenuItems} />
        </CommonDrawer>
      </CommonNavbar>
      <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
        {children}
      </main>
    </div>
  );
}
