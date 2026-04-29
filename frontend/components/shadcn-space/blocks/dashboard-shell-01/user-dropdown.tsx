"use client";

import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LucideIcon,
  CircleUserRound,
  CreditCard,
  ReceiptText,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

type Props = {
  trigger: ReactNode;
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
};

type MenuItem = {
  label: string;
  icon: LucideIcon;
  destructive?: boolean;
};

const PROFILE_ITEMS: MenuItem[] = [
  { label: "My Profile", icon: CircleUserRound },
  { label: "My Subscription", icon: CreditCard },
  { label: "My Invoice", icon: ReceiptText },
];

const SETTINGS_ITEMS: MenuItem[] = [
  { label: "Account Settings", icon: Settings },
];

const LOGOUT_ITEM: MenuItem = {
  label: "Signout",
  icon: LogOut,
  destructive: true,
};

const itemClass =
  "p-2 text-sm font-medium text-popover-foreground cursor-pointer gap-2";

const UserDropdown = ({ trigger, defaultOpen, align = "end" }: Props) => {
  const { user, logout } = useAuth();
  return (
    <div className="flex items-center justify-center">
      <DropdownMenu defaultOpen={defaultOpen}>
        <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className="w-3xs rounded-none border-2 border-[#202b20] shadow-[4px_4px_0_0_#202b20] bg-white data-open:slide-in-from-bottom-20! data-closed:slide-out-to-bottom-20 data-open:fade-in-0 data-closed:fade-out-0 data-closed:zoom-out-100 duration-200"
        >
          {/* User Info */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center gap-3 px-4 py-3">
              <div className="relative">
                <Avatar className="data-[size=lg]:size-8 border-2 border-[#202b20] rounded-none">
                  <AvatarImage
                    src={user?.avatarUrl || undefined}
                    alt={user?.firstName || 'User'}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-[#ffa116] text-[#202b20] font-bold rounded-none">
                    {user?.firstName?.[0]?.toUpperCase() || 'E'}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute right-[-4px] bottom-[-4px] size-3 bg-[#ffa116] border-2 border-[#202b20]" />
              </div>

              <div className="flex flex-col">
                <span className="text-[#202b20] text-sm font-bold uppercase tracking-tight">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Team Emble'}
                </span>
                <span className="text-[#202b20]/70 text-xs font-medium">
                  {user?.email || 'hello@emble.com'}
                </span>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Main Links */}
          <DropdownMenuGroup>
            {PROFILE_ITEMS.map(({ label, icon: Icon }) => (
              <DropdownMenuItem key={label} className={itemClass}>
                <Icon size={20} />
                <span>{label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Settings */}
          <DropdownMenuGroup>
            {SETTINGS_ITEMS.map(({ label, icon: Icon }) => (
              <DropdownMenuItem key={label} className={itemClass}>
                <Icon size={20} />
                <span>{label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Logout */}
          <DropdownMenuItem onClick={logout} className={`${itemClass} text-red-600 focus:text-red-600 focus:bg-red-50`}>
            <LOGOUT_ITEM.icon size={20} />
            <span>{LOGOUT_ITEM.label}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserDropdown;
