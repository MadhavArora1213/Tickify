import React from 'react';

const RollingGallery = ({ images = [] }) => {
    return (
        <section className="py-20 bg-[var(--color-bg-primary)] overflow-hidden relative border-t-4 border-black">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-2 bg-[var(--color-accent-primary)] text-white text-sm font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0_black] transform -rotate-2">
                        Partners
                    </span>
                    <h3 className="text-4xl md:text-5xl font-black text-[var(--color-text-primary)] mt-6 text-2xl uppercase shadow-black transform rotate-1">
                        <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>Trusted by Top Organizers</span>
                        <span className="hidden dark:block drop-shadow-[4px_4px_0_white]">Trusted by Top Organizers</span>
                    </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {images.map((src, i) => (
                        <div
                            key={i}
                            className="group relative h-32 bg-[var(--color-bg-surface)] border-2 border-black rounded-xl flex items-center justify-center p-6 transition-all duration-300 shadow-[6px_6px_0_black] hover:shadow-[8px_8px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                        >
                            <img
                                src={src}
                                alt="logo"
                                className="w-full h-full object-contain filter grayscale opacity-100 group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RollingGallery;
