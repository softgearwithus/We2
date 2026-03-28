"use client";

import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { NavItem } from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  // Recursive render function
  const renderItem = (item: NavItem) => {
    //  Section label
    if (item.isSection && item.label) {
      return (
        <SidebarGroup key={item.label} className="p-0 pt-6 pb-1 first:pt-2">
          <SidebarGroupLabel className="p-0 text-xs font-semibold uppercase text-slate-800 tracking-tight font-sans">
            {item.label}
          </SidebarGroupLabel>
        </SidebarGroup>
      );
    }
    const hasChildren = !!item.children?.length;
    // Item with children → collapsible
    if (hasChildren && item.title) {
      return (
        <SidebarGroup key={item.title} className="p-0">
          <SidebarMenu>
            <Collapsible>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild className="w-full collapsible/button">
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="rounded-xl font-sans font-medium text-sm px-3 py-2.5 h-10 cursor-pointer text-slate-700 hover:bg-slate-100/60 transition-colors"
                  >
                    {typeof item.icon === 'string' ? (
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    ) : item.icon ? (
                      <item.icon size={16} />
                    ) : null}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 collapsible/button-[aria-expanded='true']:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="me-0 pe-0 pt-1 space-y-1">
                    {item.children!.map(renderItemSub)}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      );
    }
    // Item without children
    if (item.title) {
      const isActive = item.isActive ?? pathname === item.href;

      return (
        <SidebarGroup key={item.title} className="p-0">
          <SidebarMenu>
            <SidebarMenuItem className="relative">
              <SidebarMenuButton
                tooltip={item.title}
                className={cn(
                  "rounded-xl font-sans font-medium text-sm px-3 py-2.5 h-10 transition-colors",
                  isActive
                    ? "bg-slate-950 text-white hover:bg-slate-900 shadow-sm"
                    : "hover:bg-slate-100/60 text-slate-700",
                )}
                asChild
              >
                <a href={item.href} className="w-full flex items-center gap-2">
                  {typeof item.icon === 'string' ? (
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  ) : item.icon ? (
                    <item.icon size={16} />
                  ) : null}
                  {item.title}
                  {item.hasUpdate && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  )}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      );
    }
    return null;
  };
  // Recursive render function for sub-items
  const renderItemSub = (item: NavItem) => {
    const hasChildren = !!item.children?.length;
    if (hasChildren && item.title) {
      return (
        <SidebarMenuSubItem key={item.title}>
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <SidebarMenuSubButton className="rounded-xl font-sans font-medium text-sm px-3 py-2.5 h-10 text-slate-700 hover:bg-slate-100/60">
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 data-[state=open]:rotate-90" />
              </SidebarMenuSubButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub className="me-0 pe-0">
                {item.children!.map(renderItemSub)}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuSubItem>
      );
    }
    if (item.title) {
      return (
        <SidebarMenuSubItem key={item.title} className="w-full relative">
          <SidebarMenuSubButton asChild className={cn(
            "w-full rounded-xl font-sans font-medium text-sm px-3 py-2.5 h-10 transition-colors",
            item.isActive ? "bg-slate-950 text-white hover:bg-slate-900 shadow-sm" : "hover:bg-slate-100/60 text-slate-700"
          )}>
            <a href={item.href} className="flex items-center gap-2">
              {typeof item.icon === 'string' ? (
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
              ) : item.icon ? (
                <item.icon size={14} />
              ) : null}
              {item.title}
              {item.hasUpdate && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </a>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      );
    }
    return null;
  };

  return <>{items.map(renderItem)}</>;
}
