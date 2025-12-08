import React, { useState, useEffect, useMemo } from 'react';

const Masonry = ({ data, gap = 20 }) => {
    const [columns, setColumns] = useState(2);

    useEffect(() => {
        const updateColumns = () => {
            if (window.innerWidth >= 1024) setColumns(4);
            else if (window.innerWidth >= 768) setColumns(3);
            else setColumns(2);
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    const columnChunks = useMemo(() => {
        const chunks = Array.from({ length: columns }, () => []);
        data.forEach((item, i) => {
            chunks[i % columns].push(item);
        });
        return chunks;
    }, [data, columns]);

    return (
        <div className="flex gap-4 md:gap-6 lg:gap-8 justify-center items-start">
            {columnChunks.map((chunk, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-4 md:gap-6 lg:gap-8 flex-1">
                    {chunk.map((item) => (
                        <div key={item.id} className="relative group overflow-hidden rounded-xl border border-[var(--color-neutral-200)]/10 bg-[var(--color-bg-surface)] hover:-translate-y-1 transition-transform duration-300">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-auto object-cover"
                                style={{ aspectRatio: item.height / item.width }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <h4 className="text-white font-bold">{item.title}</h4>
                                <p className="text-gray-300 text-xs">{item.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Masonry;
