"use client";

import { Student } from "@/lib/institute/mockData";
import { BadgeCheck, Clock, ShieldAlert, ShieldCheck, Eye } from "lucide-react";

interface TableProps {
    students: Student[];
    onViewProfile: (student: Student) => void;
}

export function StudentTable({ students, onViewProfile }: TableProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Placed': return <span className="flex items-center w-fit text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200"><BadgeCheck className="w-3.5 h-3.5 mr-1.5" />Placed</span>;
            case 'Looking': return <span className="flex items-center w-fit text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200"><Clock className="w-3.5 h-3.5 mr-1.5" />Looking</span>;
            case 'At Risk': return <span className="flex items-center w-fit text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-full border border-red-200"><ShieldAlert className="w-3.5 h-3.5 mr-1.5" />At Risk</span>;
            case 'Higher Studies': return <span className="flex items-center w-fit text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200"><ShieldCheck className="w-3.5 h-3.5 mr-1.5" />Higher Ed</span>;
            default: return null;
        }
    };

    return (
        <div className="rounded-3xl bg-white border border-gray-100 overflow-hidden shadow-[0_2px_20px_rgb(0,0,0,0.04)]">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider bg-gray-50/50">
                            <th className="p-6">Student Name</th>
                            <th className="p-6">Year & Dept</th>
                            <th className="p-6">CGPA</th>
                            <th className="p-6">Readiness</th>
                            <th className="p-6">Skills</th>
                            <th className="p-6">Status</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-16 text-center text-gray-500 font-medium text-lg">
                                    No students found matching filters.
                                </td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr
                                    key={student.id}
                                    className="group hover:bg-gray-50/80 transition-colors cursor-pointer"
                                    onClick={() => onViewProfile(student)}
                                >
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-sm font-[900] text-gray-400 border border-gray-100 shadow-sm group-hover:border-brand-orange/30 group-hover:text-brand-orange transition-colors">
                                                {student.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-[15px] group-hover:text-brand-orange transition-colors">{student.name}</p>
                                                <p className="text-xs text-gray-400 font-mono mt-0.5">#{student.id.substring(0, 6)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-sm font-semibold text-gray-700">{student.department}</p>
                                        <p className="text-xs text-gray-400 mt-1 font-medium">Year {student.year}</p>
                                    </td>
                                    <td className="p-6">
                                        <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">{student.cgpa}</span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${student.placementReadiness >= 80 ? 'bg-green-500' : student.placementReadiness >= 60 ? 'bg-brand-orange' : 'bg-red-500'}`} style={{ width: `${student.placementReadiness}%` }} />
                                            </div>
                                            <span className="text-xs font-black text-gray-900">{student.placementReadiness}%</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex gap-1.5">
                                            <span title="Coding" className="w-8 h-1.5 bg-gray-100 rounded-sm overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${student.skills.coding}%` }} /></span>
                                            <span title="Aptitude" className="w-8 h-1.5 bg-gray-100 rounded-sm overflow-hidden"><div className="h-full bg-purple-500" style={{ width: `${student.skills.aptitude}%` }} /></span>
                                            <span title="Comm" className="w-8 h-1.5 bg-gray-100 rounded-sm overflow-hidden"><div className="h-full bg-pink-500" style={{ width: `${student.skills.communication}%` }} /></span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        {getStatusBadge(student.status)}
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            className="p-3 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewProfile(student);
                                            }}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Placeholder */}
            <div className="p-5 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-bold bg-gray-50/50">
                <span className="uppercase tracking-widest">Showing {students.length} students</span>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50 font-bold">Previous</button>
                    <button className="px-5 py-2.5 rounded-xl bg-brand-black text-white hover:bg-gray-800 transition-colors font-bold shadow-lg">Next</button>
                </div>
            </div>
        </div>
    );
}
