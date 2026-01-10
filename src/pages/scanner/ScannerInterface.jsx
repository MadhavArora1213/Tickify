import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

const ScannerInterface = () => {
    const navigate = useNavigate();
    const [manualId, setManualId] = useState('');

    useEffect(() => {
        const scanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        });

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText) {
            console.log(`Code matched = ${decodedText}`);

            let bookingId = null;

            if (decodedText.startsWith('TICKIFY_VERIFY:')) {
                bookingId = decodedText.split(':')[1];
            } else if (decodedText.startsWith('BOOKING:')) {
                bookingId = decodedText.split(':')[1];
            } else if (decodedText.includes('/verify/')) {
                // Handle new URL format: http://base/verify/bookingId
                const parts = decodedText.split('/verify/');
                if (parts.length > 1) {
                    // Extract ID and clean it (remove trailing slashes, query params, hash)
                    bookingId = parts[1].split(/[?#/]/)[0];
                }
            }

            if (bookingId) {
                scanner.clear();
                navigate(`/scanner/results?bookingId=${bookingId}`);
            }
        }

        function onScanFailure(error) {
            // console.warn(`Code scan error = ${error}`);
        }

        return () => {
            scanner.clear().catch(error => { });
        };
    }, [navigate]);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualId) {
            navigate(`/scanner/results?bookingId=${manualId}`);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header / Stats */}
            <div className="bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] p-4 border-b-4 border-black flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <Link to="/scanner/events" className="neo-btn bg-black text-white p-2 text-xs">←</Link>
                    <div>
                        <p className="text-[10px] font-black uppercase text-[var(--color-text-secondary)]">Gate Control</p>
                        <p className="text-xl font-black uppercase tracking-tighter">Live Scanner</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="block text-2xl font-black">ACTIVE</span>
                    <span className="text-[10px] font-black uppercase text-green-500">System Ready</span>
                </div>
            </div>

            {/* Viewfinder Area */}
            <div className="flex-1 relative bg-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                {/* Html5Qrcode Container */}
                <div className="relative w-full max-w-sm aspect-square bg-black border-4 border-white/20 rounded-2xl overflow-hidden z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div id="reader"></div>

                    {/* UI Decoration */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[var(--color-accent-primary)] z-20 pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[var(--color-accent-primary)] z-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[var(--color-accent-primary)] z-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[var(--color-accent-primary)] z-20 pointer-events-none"></div>
                </div>

                <div className="mt-8 text-center space-y-2 relative z-10">
                    <p className="text-sm font-black text-white uppercase tracking-[0.2em]">Ready to Scan</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Place QR code within the frame</p>
                </div>
            </div>

            {/* Manual Entry */}
            <div className="bg-[var(--color-bg-primary)] p-6 rounded-t-[3rem] border-t-4 border-black relative z-20 -mt-8 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>

                <h3 className="text-center font-black uppercase text-[var(--color-text-primary)] mb-4">Manual Verification</h3>
                <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={manualId}
                            onChange={(e) => setManualId(e.target.value)}
                            placeholder="Enter Booking ID"
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-xl px-4 py-4 font-black text-center uppercase tracking-widest placeholder-gray-400 text-[var(--color-text-primary)]"
                        />
                    </div>
                    <button type="submit" className="neo-btn bg-[var(--color-accent-primary)] text-white py-4 font-black uppercase text-lg border-2 border-black shadow-[4px_4px_0_black]">
                        Verify Manually
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/scanner/events" className="text-xs font-black uppercase text-[var(--color-text-secondary)] hover:text-black underline">
                        Switch Event Gate
                    </Link>
                </div>
            </div>

            <style>{`
                #reader {
                    width: 100% !important;
                    border: none !important;
                }
                #reader__scan_region {
                    background: transparent !important;
                }
                #reader__dashboard_section_csr button {
                    display: none !important;
                }
                #reader__camera_selection {
                    background: white;
                    color: black;
                    padding: 8px;
                    border-radius: 8px;
                    margin-top: 10px;
                    width: 100%;
                    font-weight: bold;
                }
                /* Hide default scanner UI bits we don't want */
                #reader img {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default ScannerInterface;
