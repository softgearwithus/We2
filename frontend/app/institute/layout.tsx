import { InstituteSidebar } from "@/components/institute/InstituteSidebar";

export default function InstituteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden selection:bg-brand-orange/20 selection:text-brand-orange font-sans antialiased">
            <InstituteSidebar />
            <main className="flex-1 overflow-y-auto bg-gray-50 relative">
                {/* Background Animated Glow (Subtle for Light Mode) */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] rounded-full bg-brand-orange/5 blur-[120px] animate-pulse-soft"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-purple-500/5 blur-[120px] animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="relative z-10 p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
