import React from 'react';

const Maintenance = () => {
    return (
        <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-4">
            <div className="text-center max-w-2xl">
                <div className="bg-gray-900 text-yellow-400 inline-block px-4 py-1 text-xs font-black uppercase border-2 border-gray-900 rotate-[-2deg] mb-6">
                    System Update In Progress
                </div>
                <h1 className="text-5xl md:text-7xl font-black uppercase text-gray-900 mb-6 leading-none">
                    We'll Be <br /> Right Back
                </h1>
                <div className="verification-card bg-white border-4 border-gray-900 p-8 shadow-[12px_12px_0_rgba(0,0,0,0.8)] transform rotate-[1deg]">
                    <p className="text-xl font-bold text-gray-900 mb-4">
                        Tickify is currently undergoing scheduled maintenance to make your experience even more awesome.
                    </p>
                    <p className="text-sm font-black uppercase text-gray-600">
                        Estimated uptime: 2 hours
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Maintenance;
