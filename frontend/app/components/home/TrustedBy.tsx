const companies = [
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Uber', 'Airbnb', 'Stripe', 'Coinbase', 'Spotify'
];

const marqueeCompanies = [...companies, ...companies];

export default function TrustedBy() {
    return (
        <section className="py-10 border-b border-gray-100 bg-white/50 backdrop-blur-sm overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                    Trusted by engineers at
                </p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="animate-marquee whitespace-nowrap flex gap-16 items-center">
                    {marqueeCompanies.map((company, index) => (
                        <span
                            key={`${company}-${index}`}
                            className="text-2xl font-bold text-gray-300 hover:text-brand-black transition-colors duration-300 cursor-default"
                        >
                            {company}
                        </span>
                    ))}
                </div>

                {/* Gradient fades for seamless look */}
                <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
            </div>
        </section>
    );
}
