"use client";

import { useState } from "react";
import { mockStudents } from "@/lib/institute/mockData";
import { StudentFilter } from "@/components/institute/Students/StudentFilter";
import { StudentTable } from "@/components/institute/Students/StudentTable";
import { StudentProfileModal } from "@/components/institute/Students/StudentProfileModal";
import { Search, Download, FileSpreadsheet } from "lucide-react";
import { Student } from "@/lib/institute/mockData";
import { motion } from "framer-motion";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function StudentAnalyticsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [filters, setFilters] = useState<{
        year: number | null;
        department: string | null;
        status: string | null;
    }>({
        year: null,
        department: null,
        status: null,
    });

    const filteredStudents = mockStudents.filter((student) => {
        // Search
        if (searchTerm && !student.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

        // Filters
        if (filters.year && student.year !== filters.year) return false;
        if (filters.department && student.department !== filters.department) return false;
        if (filters.status && student.status !== filters.status) return false;

        return true;
    });

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 relative pb-10 max-w-[1600px] mx-auto"
        >
            <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-5xl font-[900] text-gray-900 tracking-tighter mb-2">Student Analytics<span className="text-brand-orange">.</span></h1>
                    <p className="text-gray-500 mt-2 text-lg font-medium">Deep dive into individual performance, skills, and placement status.</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold rounded-2xl text-sm transition-colors">
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        Import Data
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-brand-black hover:bg-gray-800 text-white rounded-2xl text-sm font-bold transition-colors shadow-lg hover:-translate-y-1">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar - Filters */}
                <motion.div variants={item} className="lg:col-span-1">
                    <StudentFilter filters={filters} setFilters={setFilters} />
                </motion.div>

                {/* Right Content - Table and Search */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Search Bar */}
                    <motion.div variants={item} className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange/20 to-purple-600/20 rounded-3xl opacity-20 group-hover:opacity-40 transition duration-700 blur-xl"></div>
                        <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm">
                            <Search className="absolute left-6 w-6 h-6 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search students by name, roll number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent py-5 pl-16 pr-6 text-gray-900 placeholder:text-gray-400 focus:outline-none text-base font-bold"
                            />
                        </div>
                    </motion.div>

                    {/* Table */}
                    <motion.div variants={item}>
                        <StudentTable
                            students={filteredStudents}
                            onViewProfile={setSelectedStudent}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Modal */}
            {selectedStudent && (
                <StudentProfileModal
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                />
            )}
        </motion.div>
    );
}
