"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import { fetchCollegeById } from "@/app/lib/colleges";
import {
    LayoutDashboard,
    Users,
    Briefcase,
    PieChart,
    BarChart3,
    Settings,
    LogOut
} from "lucide-react";

export function InstituteSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [collegeName, setCollegeName] = useState<string>('Institute');

    const menuItems = [
        { label: "Dashboard", href: "/institute/dashboard", icon: LayoutDashboard },
        { label: "Student Analytics", href: "/institute/students", icon: Users },
        { label: "Placements", href: "/institute/placements", icon: Briefcase },
        { label: "Skill Intelligence", href: "/institute/skills", icon: PieChart },
        { label: "Reports", href: "/institute/reports", icon: BarChart3 },
    ];

    useEffect(() => {
        const loadCollege = async () => {
            if (!user?.collegeId) return;
            const token = localStorage.getItem('accessToken') || '';
            try {
                const data = await fetchCollegeById(token, user.collegeId);
                setCollegeName(data?.name || 'Institute');
            } catch (error) {
                setCollegeName('Institute');
            }
        };
        loadCollege();
    }, [user?.collegeId]);

    return (
        <div className="flex flex-col h-screen w-72 bg-white border-r border-gray-200 relative z-20">
            {/* Header */}
            <div className="p-8">
                <Link href="/" className="flex items-center gap-2 group mb-10">
                    <span className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center text-white font-bold text-lg shadow-[0_4px_14px_rgba(255,87,34,0.4)] group-hover:scale-110 transition-transform">
                        I
                    </span>
                    <span className="text-xl font-[900] text-gray-900 tracking-tighter">
                        Institute<span className="text-brand-orange">.ai</span>
                    </span>
                </Link>

                <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">Menu</p>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 font-semibold",
                                    isActive
                                        ? "bg-brand-orange/5 text-brand-orange"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-brand-orange" : "text-gray-400 group-hover:text-gray-700")} />
                                    <span>{item.label}</span>
                                </div>
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto p-6 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-sm font-bold text-gray-700 shadow-sm">
                        {collegeName.substring(0, 3).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">{collegeName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.subscriptionPlan ? `${user.subscriptionPlan.replace(/_/g, ' ')} Plan` : 'Plan'}</p>
                    </div>
                </div>

                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-500 hover:text-gray-900 hover:bg-white transition-all text-sm font-medium border border-transparent hover:border-gray-200 hover:shadow-sm">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                </button>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
