'use client';

import { Trophy, Medal, Crown } from 'lucide-react';

const mockLeaderboard = [
    { rank: 1, name: 'Alex Johnson', xp: 12500, avatar: 'A' },
    { rank: 2, name: 'Sarah Williams', xp: 11800, avatar: 'S' },
    { rank: 3, name: 'Michael Chen', xp: 10400, avatar: 'M' },
    { rank: 4, name: 'Emily Davis', xp: 9800, avatar: 'E' },
    { rank: 5, name: 'David Miller', xp: 9200, avatar: 'D' },
    { rank: 42, name: 'You', xp: 5400, avatar: 'Y', isCurrentUser: true },
    { rank: 6, name: 'Jessica Taylor', xp: 8900, avatar: 'J' },
    { rank: 7, name: 'James Wilson', xp: 8500, avatar: 'J' },
];

export default function Leaderboard() {
    return (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] h-full max-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <Trophy className="text-yellow-500 fill-yellow-500" size={20} />
                    Leaderboard
                </h3>
                <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">View All</button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {mockLeaderboard.map((user) => (
                    <div
                        key={user.rank}
                        className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 border ${user.isCurrentUser
                                ? 'bg-indigo-50 border-indigo-200 shadow-sm sticky bottom-0 z-10'
                                : 'hover:bg-slate-50 border-transparent hover:border-slate-100'
                            }`}
                    >
                        <div className="w-8 flex justify-center font-bold text-slate-500">
                            {user.rank === 1 ? <Crown size={20} className="text-yellow-500 fill-yellow-500" /> :
                                user.rank === 2 ? <Medal size={20} className="text-slate-400 fill-slate-400" /> :
                                    user.rank === 3 ? <Medal size={20} className="text-amber-700 fill-amber-700" /> :
                                        `#${user.rank}`}
                        </div>

                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${user.isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                            {user.avatar}
                        </div>

                        <div className="flex-1">
                            <p className={`text-sm font-bold ${user.isCurrentUser ? 'text-indigo-900' : 'text-slate-700'}`}>
                                {user.name} {user.isCurrentUser && '(You)'}
                            </p>
                            <p className="text-xs font-medium text-slate-400">{user.xp.toLocaleString()} XP</p>
                        </div>

                        {user.rank <= 3 && (
                            <div className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                                Top Rated
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
