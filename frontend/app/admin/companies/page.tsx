export default function CompaniesPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
                <h1 className="text-2xl font-bold text-slate-900">Company Partnerships</h1>
                <p className="text-sm text-slate-500">Manage employer relationships and hiring pipelines.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">C</div>
                    <h2 className="text-xl font-extrabold text-slate-900">Companies - Coming Soon</h2>
                    <p className="text-sm text-slate-500 max-w-md">
                        This workspace is being built. Check back soon for company onboarding, hiring pipelines,
                        and account management.
                    </p>
                </div>
            </div>
        </div>
    );
}
