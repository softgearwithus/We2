"use client";

import { Users, Briefcase, TrendingUp, Building2, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatsProps {
    totalStudents: number;
    placementRate: number;
    avgPackage: string;
    activeCompanies: number;
}

export function StatsCards({ totalStudents, placementRate, avgPackage, activeCompanies }: StatsProps) {
    const stats = [
        {
            label: "Total Students",
            value: totalStudents.toLocaleString(),
            icon: Users,
            trend: "+12%",
            isPositive: true,
            color: "text-brand-orange",
            bgColor: "bg-brand-orange/10",
            borderColor: "border-brand-orange/20"
        },
        {
            label: "Placement Rate",
            value: `${placementRate}%`,
            icon: Briefcase,
            trend: "+5.2%",
            isPositive: true,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-200"
        },
        {
            label: "Avg. Package",
            value: avgPackage,
            icon: TrendingUp,
            trend: "+8.4%",
            isPositive: true,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200"
        },
        {
            label: "Active Recruiters",
            value: activeCompanies.toString(),
            icon: Building2,
            trend: "-2.1%",
            isPositive: false,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200"
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <div key={i} className="group relative rounded-3xl bg-white border border-gray-100 p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl ${stat.bgColor} border ${stat.borderColor} transition-colors`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${stat.isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                            {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {stat.trend}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.label}</h3>
                        <p className="text-3xl font-[900] text-gray-900 tracking-tight">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
