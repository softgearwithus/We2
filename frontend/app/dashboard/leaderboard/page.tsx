'use client';

export default function GamificationPage() {
    const badges = [
        { name: 'Bug Hunter', description: 'Found and fixed 50 bugs in simulation', icon: 'bug_report', color: 'text-red-500', bg: 'bg-red-50', level: 'Gold' },
        { name: 'Code Ninja', description: 'Solved 100 DSA problems', icon: 'code', color: 'text-blue-500', bg: 'bg-blue-50', level: 'Platinum' },
        { name: 'Team Player', description: 'Replied to 200 chat messages', icon: 'group', color: 'text-green-500', bg: 'bg-green-50', level: 'Silver' },
        { name: 'Night Owl', description: 'Committed code after 2 AM', icon: 'bedtime', color: 'text-purple-500', bg: 'bg-purple-50', level: 'Bronze' },
    ];

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex items-center gap-8">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border-4 border-white/30">
                        <span className="material-symbols-outlined text-5xl">military_tech</span>
                    </div>
                    <div>
                        <p className="text-blue-100 font-bold uppercase tracking-wider text-sm mb-1">Your Rank</p>
                        <h1 className="text-4xl font-extrabold mb-2">Grandmaster <span className="text-lg font-normal opacity-80">(Level 42)</span></h1>
                        <p className="text-blue-100">Top 1% of all developers on the platform.</p>
                    </div>
                    <div className="ml-auto text-right hidden md:block">
                        <p className="text-5xl font-bold">12,450</p>
                        <p className="text-sm font-bold uppercase tracking-wider opacity-80">XP Points</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 text-lg">Recent Achievements</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {badges.map((badge, i) => (
                            <div key={i} className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group bg-slate-50 hover:bg-white cursor-pointer">
                                <div className={`w-12 h-12 rounded-full ${badge.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                    <span className={`material-symbols-outlined ${badge.color} text-2xl`}>{badge.icon}</span>
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1">{badge.name}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed mb-3">{badge.description}</p>
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-600`}>
                                    {badge.level}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 text-lg">Leaderboard</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={`flex items-center p-3 rounded-xl ${i === 2 ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}>
                                <span className={`w-8 h-8 flex items-center justify-center font-bold rounded-lg mr-4 ${i < 3 ? 'bg-yellow-400 text-yellow-900 shadow-sm' : 'text-slate-400 bg-slate-100'}`}>
                                    {i}
                                </span>
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Developer Name</p>
                                        <p className="text-xs text-slate-500">Global Rank #{i + 42}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-blue-600">14,200</p>
                                    <p className="text-[10px] text-slate-400 uppercase">XP</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
