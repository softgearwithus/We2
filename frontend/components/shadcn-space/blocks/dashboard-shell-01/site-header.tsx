import { SidebarTrigger } from "@/components/ui/sidebar";
import UserDropdown from "@/components/shadcn-space/blocks/dashboard-shell-01/user-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

export function SiteHeader() {
  const { user } = useAuth();
  
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName) return 'U';
    return `${firstName[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="flex w-full items-center justify-between relative">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 h-8 w-8 cursor-pointer" />
      </div>
      
      {/* Centered Navigation Links */}
      <div className="hidden md:flex flex-row items-center gap-8 absolute left-1/2 -translate-x-1/2">
         <Link href="/pricing" className="text-[14px] font-[600] tracking-tight text-slate-600 hover:text-slate-900 transition-colors">
            Pricing
         </Link>
      </div>

      <div className="flex items-center gap-3">
        <UserDropdown
          defaultOpen={false}
          align="center"
          trigger={
            <div className="rounded-full">
              <Avatar className="size-8 cursor-pointer">
                <AvatarImage
                  src={user?.avatarUrl || undefined}
                  alt={user?.firstName || 'User'}
                />
                <AvatarFallback className="bg-emerald-100 text-emerald-800 font-medium">
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
            </div>
          }
        />
      </div>
    </div>
  );
}
