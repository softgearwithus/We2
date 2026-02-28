'use client';

import { useState } from 'react';
import { getStoredToken } from '@/app/lib/auth-storage';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';
import Stepper from '@/app/components/admin/CollegeWizard/Stepper';
import Step1Info from '@/app/components/admin/CollegeWizard/Step1Info';
import Step2Years from '@/app/components/admin/CollegeWizard/Step2Years';
import Step3Departments from '@/app/components/admin/CollegeWizard/Step3Departments';

import { useRouter } from 'next/navigation';

export default function CreateCollegePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    const [formData, setFormData] = useState({
        info: {
            name: '',
            collegeId: '',
            location: '',
            type: '',
            adminEmail: ''
        },
        selectedYears: [] as string[],
        departments: [] as string[],
    });

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const updateInfo = (updates: Partial<typeof formData.info>) => {
        setFormData(prev => ({ ...prev, info: { ...prev.info, ...updates } }));
    };

    const toggleYear = (year: string) => {
        setFormData(prev => ({
            ...prev,
            selectedYears: prev.selectedYears.includes(year)
                ? prev.selectedYears.filter(y => y !== year)
                : [...prev.selectedYears, year].sort()
        }));
    };

    const addDepartment = (dept: string) => {
        if (!formData.departments.includes(dept)) {
            setFormData(prev => ({ ...prev, departments: [...prev.departments, dept] }));
        }
    };

    const removeDepartment = (dept: string) => {
        setFormData(prev => ({ ...prev, departments: prev.departments.filter(d => d !== dept) }));
    };

    const handleSave = async () => {
        if (!formData.info.name || !formData.info.collegeId) {
            alert('Please fill in college information first.');
            setCurrentStep(1);
            return;
        }
        try {
            const token = getStoredToken('admin') || '';
            const { createCollege } = await import('@/app/lib/colleges');
            await createCollege(token, {
                name: formData.info.name,
                code: formData.info.collegeId,
                location: formData.info.location,
                type: formData.info.type,
                years: formData.selectedYears,
                departments: formData.departments,
                adminEmail: formData.info.adminEmail,
            });
            router.push('/admin/colleges');
        } catch (error) {
            alert('Failed to create college.');
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <Step1Info data={formData.info} updateData={updateInfo} />;
            case 2: return <Step2Years selectedYears={formData.selectedYears} toggleYear={toggleYear} />;
            case 3: return <Step3Departments departments={formData.departments} addDepartment={addDepartment} removeDepartment={removeDepartment} />;
            default: return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <Link
                    href="/admin/colleges"
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors w-fit text-sm font-medium"
                >
                    <ChevronLeft size={16} />
                    Back to Super Admin
                </Link>
                <div className="flex items-end justify-between mt-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Onboard New College</h1>
                        <p className="text-slate-500 font-medium mt-1">Fill in the basic structure. You can manage students and staff after onboarding.</p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Step Progress</p>
                        <p className="text-2xl font-black text-blue-600 leading-tight">{currentStep} <span className="text-slate-200 text-lg">/ {totalSteps}</span></p>
                    </div>
                </div>
            </div>

            {/* Stepper Nav */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                <Stepper
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    steps={['College Info', 'Academic Years', 'Departments']}
                />
            </div>

            {/* Content Area */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 min-h-[400px]">
                {renderStep()}
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-4">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all ${currentStep === 1
                        ? 'opacity-0 pointer-events-none'
                        : 'text-slate-600 hover:bg-slate-100 active:scale-95'
                        }`}
                >
                    <ChevronLeft size={20} />
                    Previous Step
                </button>

                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/admin/colleges')}
                        className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 active:scale-95 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={currentStep === totalSteps ? handleSave : nextStep}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        {currentStep === totalSteps ? (
                            <>
                                <Save size={20} />
                                Complete Onboarding
                            </>
                        ) : (
                            <>
                                Next Step
                                <ChevronRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
