import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import DashboardNav from "./components/dashboard-nav";
import UserProfile from "./components/user-profile";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { LogoutButton } from "./components/logout-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logo = PlaceHolderImages.find((img) => img.id === "estores-logo");

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border p-3">
            <div className="flex items-center justify-between">
                {logo && (
                    <Image
                        src={logo.imageUrl}
                        alt={logo.description}
                        width={120}
                        height={40}
                        data-ai-hint={logo.imageHint}
                        className="object-contain"
                    />
                )}
            </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
            <div className="p-2">
              <UserProfile />
            </div>
            <SidebarSeparator />
            <DashboardNav />
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border mt-auto">
            <LogoutButton />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/50 px-6 backdrop-blur-sm sticky top-0 z-30">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
            <LogoutButton variant="outline" className="w-auto">
              Exit
            </LogoutButton>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
