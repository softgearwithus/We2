"use client";
import React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/logo/logo";
import { NavMain } from "@/components/shadcn-space/blocks/dashboard-shell-01/nav-main";
import {
  AlignStartVertical,
  CreditCard,
  LayoutPanelTop,
  ChartPie,
  BarChart3,
  CircleUserRound,
  ClipboardList,
  Languages,
  LucideIcon,
  Notebook,
  NotepadText,
  Table,
  Ticket,
  Zap,
  ChevronDown
} from "lucide-react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import UserDropdown from "@/components/shadcn-space/blocks/dashboard-shell-01/user-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/app/context/AuthContext";

export type NavItem = {
  label?: string;
  isSection?: boolean;
  title?: string;
  icon?: any; // any string or icon component
  href?: string;
  children?: NavItem[];
  isActive?: boolean;
  hasUpdate?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                   Page                                     */
/* -------------------------------------------------------------------------- */

const AppSidebar = ({ children, navItems, mode }: { children: React.ReactNode, navItems: NavItem[], mode: string }) => {
  const { user } = useAuth();
  const normalizedPlan = (user?.subscriptionPlan || '').toLowerCase();
  const isProUser = normalizedPlan === 'pro';

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName) return 'U';
    return `${firstName[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <SidebarProvider>
      <Sidebar className="py-4 px-0 bg-background border-r border-border">
        <div className="flex flex-col gap-6 bg-background h-full">
          {/* ---------------- Header ---------------- */}
          <SidebarHeader className="py-4 px-6">
             <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                <Logo />
             </Link>
          </SidebarHeader>

          {/* ---------------- Content ---------------- */}
          <SidebarContent className="overflow-hidden gap-0 px-0 flex-1">
            <SimpleBar
              autoHide={true}
              className="h-full border-none"
            >
              <div className="px-4 pb-12">
                <NavMain items={navItems} />
              </div>
            </SimpleBar>
          </SidebarContent>

          {/* ---------------- Upgrade Footer Card (Free only) ---------------- */}
          {!isProUser && (
            <div className="px-4 pb-2 mt-auto flex-shrink-0">
              <div className="border-2 border-[#202b20] bg-white flex flex-col items-center text-center p-4 shadow-[4px_4px_0_0_#202b20]">
                <div className="w-8 h-8 bg-[#ffa116] flex items-center justify-center mb-2.5 border-2 border-[#202b20]">
                  <Zap className="w-3.5 h-3.5 text-[#202b20]" />
                </div>
                <h4 className="text-[13px] font-[800] text-[#202b20] mb-1 uppercase tracking-tight">Grab Pro Now</h4>
                <p className="text-[11px] text-[#202b20]/60 mb-3 font-[700]">Level up your prep</p>
                <Link href="/pricing" className="w-full">
                  <Button className="w-full bg-[#ffa116] hover:bg-[#ff9100] text-[#202b20] text-[12px] font-[700] border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] rounded-none h-8 transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#202b20]">
                    Get Premium
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* ---------------- User Profile Row ---------------- */}
          <div className="px-4 pb-4 mt-auto">
            <UserDropdown
              defaultOpen={false}
              align="start"
              trigger={
                <div className="flex items-center justify-between w-full p-2 bg-white border-2 border-transparent hover:border-[#202b20] hover:shadow-[2px_2px_0_0_#202b20] transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="relative">
                      <Avatar className="size-9 border-2 border-[#202b20] rounded-none">
                        <AvatarImage
                          src={user?.avatarUrl || undefined}
                          alt={user?.firstName || 'User'}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-[#ffa116] text-[#202b20] font-bold text-xs rounded-none">
                          {getInitials(user?.firstName, user?.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Plan indicator dot */}
                      <span className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white ${ isProUser ? 'bg-[#ffa116]' : 'bg-[#202b20]/30' }`} />
                    </div>
                    <div className="flex flex-col overflow-hidden text-left">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-sm font-[800] text-[#202b20] truncate">
                          {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'My Workspace'}
                        </p>
                        {isProUser ? (
                          <span className="shrink-0 text-[8px] font-[900] px-1.5 py-0.5 bg-[#ffa116] text-[#202b20] border border-[#202b20] uppercase tracking-widest">Pro</span>
                        ) : (
                          <span className="shrink-0 text-[8px] font-[900] px-1.5 py-0.5 bg-[#f4f4f5] text-[#202b20]/60 border border-[#202b20]/20 uppercase tracking-widest">Free</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#202b20]/50 font-[700] uppercase tracking-wider">
                        {mode === 'prep' ? 'Placement Prep' : 'Simulation Lab'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#202b20]/40 group-hover:text-[#202b20] flex-shrink-0 transition-colors" />
                </div>
              }
            />
          </div>
        </div>
      </Sidebar>

      {/* ---------------- Main ---------------- */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden bg-[#f7f7f5] relative">
        <div className="md:hidden absolute top-4 left-4 z-50">
          <SidebarTrigger className="h-10 w-10 bg-white shadow-sm border rounded-md" />
        </div>
        <main className="flex-1 overflow-y-auto bg-[#f7f7f5]">{children}</main>
      </div>
    </SidebarProvider>
  );
};

export default AppSidebar;
