import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const ScanResult = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    // Simulate getting status from URL or state, default to 'valid' for demo
    const status = searchParams.get('status') || 'valid';
    const isSuccess = status === 'valid';

    const handleNextScan = () => {
        navigate('/scanner/scan');
    };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-between p-6 py-12 text-center transition-colors duration-300 ${isSuccess ? 'bg-green-400' : 'bg-red-400'}`}>

            <div className="w-full max-w-sm bg-white border-4 border-black shadow-[12px_12px_0_rgba(0,0,0,0.5)] p-8 relative overflow-hidden animate-bounce-in">

                {/* Status Icon */}
                <div className={`w-24 h-24 mx-auto rounded-full border-4 border-black flex items-center justify-center text-5xl mb-6 ${isSuccess ? 'bg-green-400 text-black' : 'bg-red-400 text-white'}`}>
                    {isSuccess ? '✓' : '✕'}
                </div>

                {/* Status Message */}
                <h1 className="text-4xl font-black uppercase mb-2">{isSuccess ? 'Valid Ticket' : 'Invalid Ticket'}</h1>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-8">
                    {isSuccess ? 'Entry Authorized' : 'Entry Denied - Expired/Duplicate'}
                </p>

                {/* Attendee Details */}
                <div className="border-t-2 border-dashed border-black pt-6 space-y-4 text-left">
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-500">Attendee</p>
                        <p className="text-xl font-black text-black">Alex Johnson</p>
                    </div>
                    <div className="flex justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-500">Ticket Type</p>
                            <p className="text-lg font-bold text-black">VIP Access</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-gray-500">Scan Time</p>
                            <p className="text-lg font-bold text-black">20:42</p>
                        </div>
                    </div>
                </div>

                {isSuccess && (
                    <div className="absolute -right-12 -top-12 bg-yellow-400 text-black font-black text-[10px] py-1 px-12 rotate-45 border-2 border-black shadow-sm">
                        VIP
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="w-full max-w-sm space-y-4">
                <button
                    onClick={handleNextScan}
                    className="w-full py-4 bg-black text-white font-black uppercase text-xl border-4 border-white shadow-[6px_6px_0_rgba(255,255,255,0.5)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_white] transition-all"
                >
                    Scan Next
                </button>

                {!isSuccess && (
                    <button className="w-full py-3 bg-white/20 text-black font-black uppercase border-2 border-black hover:bg-white/40 transition-colors">
                        Flag Issue
                    </button>
                )}

                <Link to="/scanner/events" className="block text-xs font-black uppercase text-black/60 hover:text-black mt-6">
                    Exit Scanning Mode
                </Link>
            </div>

            <style>{`
                @keyframes bounce-in {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
        </div>
    );
};

export default ScanResult;
