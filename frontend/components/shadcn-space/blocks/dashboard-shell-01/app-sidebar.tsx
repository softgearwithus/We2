"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
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
} from "lucide-react";
import { SiteHeader } from "@/components/shadcn-space/blocks/dashboard-shell-01/site-header";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

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
  const isFreePlan = !user?.subscriptionPlan || user?.subscriptionPlan.toLowerCase() === 'free';

  return (
    <SidebarProvider>
      <Sidebar className="py-4 px-0 bg-background border-r border-border">
        <div className="flex flex-col gap-6 bg-background h-full">
          {/* ---------------- Header ---------------- */}
          <SidebarHeader className="py-0 px-6">
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-2 overflow-hidden transition-all duration-300">
                    <div className="min-w-[8px] h-8 rounded-full bg-emerald-500 shadow-[0_0_10px_var(--color-primary)]"></div>
                    <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Workspace</p>
                        <p className="text-sm font-bold text-foreground whitespace-nowrap">
                            {mode === 'prep' ? 'Placement Prep' : 'Simulation Lab'}
                        </p>
                    </div>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
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

          {/* ---------------- Upgrade Footer Card ---------------- */}
          {isFreePlan && (
          <div className="px-5 pb-5 mt-auto flex-shrink-0">
             <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/30 flex flex-col items-center text-center p-4 shadow-sm relative overflow-hidden">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 border border-blue-100">
                   <Zap className="w-4 h-4 text-blue-600 fill-blue-600/20" />
                </div>
                <h4 className="text-[14px] font-[800] text-slate-900 mb-1 leading-tight font-sans tracking-tight">Grab Pro Now</h4>
                <p className="text-[12px] text-slate-500 mb-4 font-medium leading-snug font-sans max-w-[140px]">Unlock unlimited mock tests & features</p>
                <Link href="/pricing" className="w-full">
                   <Button className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white text-[13px] font-[700] rounded-[10px] shadow-sm h-9 transition-all hover:scale-[1.02]">
                      Get Premium
                   </Button>
                </Link>
             </div>
          </div>
          )}
        </div>
      </Sidebar>

      {/* ---------------- Main ---------------- */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden bg-slate-50">
        <header className="sticky top-0 z-50 flex items-center border-b px-6 py-3 bg-white shadow-sm shrink-0">
          <SiteHeader />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">{children}</main>
      </div>
    </SidebarProvider>
  );
};

export default AppSidebar;
