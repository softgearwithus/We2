"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const fallbackData = [
    { month: 'Jan', placed: 45, offers: 60 },
    { month: 'Feb', placed: 52, offers: 75 },
    { month: 'Mar', placed: 48, offers: 82 },
    { month: 'Apr', placed: 61, offers: 90 },
    { month: 'May', placed: 55, offers: 85 },
    { month: 'Jun', placed: 67, offers: 100 },
    { month: 'Jul', placed: 72, offers: 110 },
];

export function PlacementChart({ data = fallbackData }: { data?: Array<{ month: string; placed: number; offers: number }> }) {
    return (
        <div className="rounded-3xl bg-white border border-gray-100 p-8 h-full shadow-[0_2px_20px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-orange/5 blur-[100px] rounded-full pointer-events-none opacity-50" />

            <div className="mb-8 relative z-10 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-[900] text-gray-900 tracking-tight">Placement Analysis</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">Real-time offers vs placements</p>
                </div>
                <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-brand-orange animate-pulse"></span>
                    <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">Live</span>
                </div>
            </div>

            <div className="h-[400px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#9333ea" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPlaced" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FF5722" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#FF5722" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            fontWeight={600}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            fontWeight={600}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#111827', borderRadius: '16px', padding: '12px 16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                            cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#6b7280' }} />
                        <Area
                            type="monotone"
                            dataKey="offers"
                            stroke="#9333ea"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorOffers)"
                            name="Total Offers"
                        />
                        <Area
                            type="monotone"
                            dataKey="placed"
                            stroke="#FF5722"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPlaced)"
                            name="Students Placed"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
