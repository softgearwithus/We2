"use client";

import { Student } from "@/lib/institute/mockData";
import { X, Mail, Phone, Calendar, Download, Trophy, GraduationCap, Github, Linkedin, ExternalLink } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
    student: Student;
    onClose: () => void;
}

export function StudentProfileModal({ student, onClose }: ModalProps) {
    const chartData = [
        { subject: 'Coding', A: student.skills.coding, fullMark: 100 },
        { subject: 'Aptitude', A: student.skills.aptitude, fullMark: 100 },
        { subject: 'Comm', A: student.skills.communication, fullMark: 100 },
        { subject: 'Core', A: student.skills.core, fullMark: 100 },
        { subject: 'Projects', A: (student.skills.coding + student.skills.core) / 2, fullMark: 100 }, // Derived
        { subject: 'Consistency', A: student.attendance, fullMark: 100 },
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-20 p-3 text-gray-500 bg-white/80 hover:bg-white rounded-full transition-colors shadow-sm hover:shadow-md hover:rotate-90 duration-300"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Banner Gradient */}
                    <div className="h-40 bg-gradient-to-r from-orange-50 via-purple-50 to-white relative border-b border-gray-100">
                        <div className="absolute inset-0 bg-grid-black/[0.02]" />
                    </div>

                    <div className="px-10 pb-10 -mt-20 overflow-y-auto custom-scrollbar">
                        {/* Header Info */}
                        <div className="flex flex-col md:flex-row gap-8 items-end mb-10">
                            <div className="w-36 h-36 rounded-[28px] bg-white p-2 shadow-xl relative">
                                <div className="w-full h-full rounded-[20px] bg-gray-50 flex items-center justify-center text-5xl font-[900] text-gray-300 border border-gray-100">
                                    {student.name.charAt(0)}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center border-4 border-white text-white shadow-lg">
                                    <Trophy className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="flex-1 mb-2">
                                <h2 className="text-4xl font-[900] text-gray-900 tracking-tighter mb-1">{student.name}</h2>
                                <p className="text-gray-500 font-medium text-xl">{student.department} • Batch 2026</p>
                                <div className="flex gap-6 mt-6">
                                    <a href="#" className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-orange transition-colors font-semibold"><Mail className="w-4 h-4" /> {student.name.toLowerCase().replace(' ', '.')}@college.edu</a>
                                    <a href="#" className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-orange transition-colors font-semibold"><Phone className="w-4 h-4" /> +91 98765 43210</a>
                                </div>
                            </div>
                            <div className="flex gap-4 mb-2">
                                <button className="p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-colors"><Github className="w-6 h-6" /></button>
                                <button className="p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-blue-600 border border-gray-200 transition-colors"><Linkedin className="w-6 h-6" /></button>
                                <button className="px-8 py-4 rounded-2xl bg-brand-black hover:bg-gray-800 text-white font-[900] text-lg shadow-xl hover:-translate-y-1 transition-all">View Resume</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Column 1: Stats & Academic */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Academic Status</h4>
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 text-sm font-semibold">Current CGPA</span>
                                            <span className="text-2xl font-[900] text-gray-900 font-mono">{student.cgpa}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 text-sm font-semibold">Attendance</span>
                                            <span className={`text-2xl font-[900] ${student.attendance > 75 ? 'text-green-600' : 'text-red-500'} font-mono`}>{student.attendance}%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 text-sm font-semibold">Backlogs</span>
                                            <span className="text-2xl font-[900] text-green-600 font-mono">0</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Trophy className="w-6 h-6 text-brand-orange" />
                                        <h4 className="font-[900] text-gray-900 text-lg">Top 5%</h4>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium leading-relaxed">Ranked #14 in Computer Science Department this semester.</p>
                                </div>
                            </div>

                            {/* Column 2: Skill Chart */}
                            <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col shadow-sm">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Skill Radar</h4>
                                <div className="flex-1 w-full min-h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                            <PolarGrid stroke="#e5e7eb" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10, fontWeight: '900' }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar
                                                name={student.name}
                                                dataKey="A"
                                                stroke="#FF5722"
                                                strokeWidth={3}
                                                fill="#FF5722"
                                                fillOpacity={0.2}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="text-center mt-4">
                                    <span className="text-4xl font-[900] text-gray-900">{student.placementReadiness}</span>
                                    <span className="text-xs text-brand-orange uppercase font-bold tracking-widest block mt-1">Readiness Score</span>
                                </div>
                            </div>

                            {/* Column 3: AI Insights */}
                            <div className="space-y-5">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Recommendations</h4>

                                <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy className="w-16 h-16 text-blue-500" /></div>
                                    <h5 className="font-bold text-blue-700 text-base mb-2">Strong Coding Profile</h5>
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                        Excellent consistentcy in LeetCode. Suggest enabling "Dream Company" mode.
                                    </p>
                                </div>

                                {student.skills.communication < 70 && (
                                    <div className="p-6 bg-red-50 border border-red-100 rounded-3xl">
                                        <h5 className="font-bold text-red-700 text-base mb-2">Communication Gap</h5>
                                        <p className="text-sm text-gray-600 leading-relaxed font-medium mb-4">
                                            Mock interview score was low. Recommended: 2 Audio Drills this week.
                                        </p>
                                        <button className="text-xs font-bold text-white bg-red-500 px-4 py-2 rounded-xl hover:bg-red-600 transition-colors w-full shadow-lg shadow-red-500/20">Assign Task</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
