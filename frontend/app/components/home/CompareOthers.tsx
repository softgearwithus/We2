import Link from 'next/link';
import { getAllSeoPages } from '@/app/lib/seo-pages';

export default function CompareOthers({ currentSlug }: { currentSlug: string }) {
  const alternatives = getAllSeoPages()
    .filter(page => page.category === 'alternative' && page.slug !== currentSlug)
    // Randomize or pick top 5. For now, we take 4 just for standard grid layout
    .slice(0, 4);

  return (
    <section className="py-20 bg-[#f8fafc] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-2xl md:text-3xl font-[900] text-[#1a2b3b] mb-10 text-center tracking-tight">
          Compare Other Platforms
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {alternatives.map((alt) => {
            const rawName = alt.slug.split('-')[0];
            const competitorName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
            
            return (
              <Link 
                key={alt.slug}
                href={`/alternative/${alt.slug}`}
                className="group block p-6 bg-white rounded-2xl border border-slate-200 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Alternative To</div>
                <h4 className="text-xl font-[800] text-[#1a2b3b] group-hover:text-primary transition-colors tracking-tight">
                  {competitorName}
                </h4>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
