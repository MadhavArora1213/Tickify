import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ScannerInterface = () => {
    const navigate = useNavigate();
    const [manualId, setManualId] = useState('');

    // Mock Scan History
    const [history, setHistory] = useState([
        { id: 1, time: '20:01', status: 'valid' },
        { id: 2, time: '20:05', status: 'invalid' },
        { id: 3, time: '20:12', status: 'valid' },
    ]);

    // Simulate automatic scanning for demo purposes
    useEffect(() => {
        const timer = setTimeout(() => {
            // navigate('/scanner/results?status=valid'); // Uncomment to auto-redirect
        }, 5000);
        return () => clearTimeout(timer);
    }, [navigate]);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        // Simulate check
        if (manualId) navigate('/scanner/results');
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header / Stats */}
            <div className="bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] p-4 border-b-4 border-black flex justify-between items-center z-10">
                <div>
                    <p className="text-[10px] font-black uppercase text-[var(--color-text-secondary)]">Neon Nights Festival</p>
                    <p className="text-xl font-black uppercase">Gate A</p>
                </div>
                <div className="text-right">
                    <span className="block text-2xl font-black">452</span>
                    <span className="text-[10px] font-black uppercase text-[var(--color-text-secondary)]">Checked In</span>
                </div>
            </div>

            {/* Viewfinder Area */}
            <div className="flex-1 relative bg-gray-900 flex flex-col items-center justify-center p-8 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                {/* Simulated Camera Overlay */}
                <div className="relative w-64 h-64 border-4 border-white/50 rounded-xl overflow-hidden shadow-[0_0_0_100vmax_rgba(0,0,0,0.7)] z-10">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--color-accent-primary)] z-20"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--color-accent-primary)] z-20"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--color-accent-primary)] z-20"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--color-accent-primary)] z-20"></div>

                    {/* Scanning Line Animation */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-accent-primary)] shadow-[0_0_15px_var(--color-accent-primary)] animate-[scan_2s_linear_infinite]"></div>

                    <div className="w-full h-full flex items-center justify-center text-white/50 text-xs font-black uppercase">
                        Scanning...
                    </div>
                </div>

                <p className="relative z-10 mt-8 text-sm font-bold text-white/80 uppercase tracking-widest text-center">
                    Point camera at QR code
                </p>
            </div>

            {/* Manual Entry & History */}
            <div className="bg-[var(--color-bg-primary)] p-6 rounded-t-3xl border-t-4 border-black relative z-20 -mt-6">
                <form onSubmit={handleManualSubmit} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                        placeholder="Manual Ticket ID"
                        className="flex-1 neo-input bg-[var(--color-bg-secondary)] border-2 border-black px-4 py-3 font-black text-center uppercase tracking-widest placeholder-gray-500"
                    />
                    <button type="submit" className="neo-btn bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] px-4 font-bold uppercase border-2 border-black">
                        Go
                    </button>
                </form>

                <div>
                    <h3 className="text-xs font-black uppercase text-[var(--color-text-secondary)] mb-3">Recent Scans</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {history.map(scan => (
                            <div key={scan.id} className="flex justify-between items-center p-3 bg-[var(--color-bg-surface)] border-2 border-black">
                                <span className="font-bold text-[var(--color-text-primary)]">#{10293 + scan.id}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">{scan.time}</span>
                                    {scan.status === 'valid' ? (
                                        <span className="w-3 h-3 bg-green-500 rounded-full border border-black"></span>
                                    ) : (
                                        <span className="w-3 h-3 bg-red-500 rounded-full border border-black"></span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hidden style for scan animation */}
            <style>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default ScannerInterface;
