import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, onSnapshot, query, where, orderBy, addDoc, serverTimestamp, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadToS3 } from '../services/s3Service';
import Tesseract from 'tesseract.js';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';

const ResellMarketplace = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Listing Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState(1); // 1: Upload, 2: Analysis, 3: Form
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [listingData, setListingData] = useState({
        ticketName: '',
        eventTitle: '',
        eventId: '',
        ticketNumber: '',
        seatLabel: '',
        originalPrice: '',
        resalePrice: '',
        ticketImage: null,
        imageUrl: '',
        verificationFlag: 'PENDING',
        originalBookingId: ''
    });

    useEffect(() => {
        setLoading(true);
        const q = query(
            collection(db, 'resell_tickets'),
            where('status', '==', 'available')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTickets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const sortedTickets = fetchedTickets.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });

            setTickets(sortedTickets);
            setLoading(false);
        }, (error) => {
            console.error("Fetch Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setListingData(prev => ({ ...prev, ticketImage: file }));
            startAnalysis(file);
        }
    };

    const startAnalysis = async (file) => {
        setModalStep(2);
        setIsAnalyzing(true);

        try {
            let qrVerifiedData = null;
            let verifiedBookingId = "";

            // 1. Try QR Scanning First (Tickify Built-in Support)
            try {
                // Ensure the hidden element exists for Html5Qrcode
                const html5QrCode = new Html5Qrcode("qr-reader-hidden");
                const decodedText = await html5QrCode.scanFile(file, false);
                console.log("QR Decoded:", decodedText);

                if (decodedText.includes('/verify/')) {
                    verifiedBookingId = decodedText.split('/verify/')[1].split(/[?#/]/)[0];
                }

                if (verifiedBookingId) {
                    const bookingRef = doc(db, 'bookings', verifiedBookingId);
                    const bookingSnap = await getDoc(bookingRef);
                    if (bookingSnap.exists()) {
                        qrVerifiedData = bookingSnap.data();
                    }
                }
            } catch (qrError) {
                console.log("No valid Tickify QR found:", qrError);
            }

            // 2. OCR Analysis
            const { data: { text } } = await Tesseract.recognize(file, 'eng');
            const lines = text.split('\n').map(l => l.trim().toUpperCase());

            // Extract Price via OCR
            let extractedPrice = 0;
            const priceRegex = /(?:[₹7\?]|RS\.?|INR|PRICE|TOTAL|AMT|PAID)[:\s]*(\d{1,5}(?:,\d+)*(?:\.\d+)?)/i;
            const explicitPriceMatch = text.match(priceRegex);
            if (explicitPriceMatch) {
                extractedPrice = parseInt(explicitPriceMatch[1].replace(/,/g, ''));
            }

            // Extract Seat Label (patterns like A1, F8, F9, B12, ROW-A-12, SEAT: F8, etc.)
            let extractedSeat = "";
            const seatPatterns = [
                /(?:SEAT|SEAT\s*(?:NO|NUMBER|#)?|SECTION)[:\s]*([A-Z]\d{1,3})/i,
                /(?:ROW[:\s]*)?([A-Z])[:\s-]*(\d{1,3})/i,
                /\b([A-Z][0-9]{1,2})\b/,
                /\b(SEAT[:\s]*[A-Z0-9]+)\b/i
            ];
            for (const pattern of seatPatterns) {
                const seatMatch = text.match(pattern);
                if (seatMatch) {
                    // Handle patterns that capture row and seat separately
                    if (seatMatch[2]) {
                        extractedSeat = `${seatMatch[1]}${seatMatch[2]}`;
                    } else {
                        extractedSeat = seatMatch[1].replace(/SEAT[:\s]*/i, '').trim();
                    }
                    if (extractedSeat.length <= 4 && /^[A-Z]\d{1,2}$/i.test(extractedSeat)) {
                        break; // Good seat format found
                    }
                }
            }

            // Extract Ticket ID / Booking Reference
            let extractedTicketId = "";
            const ticketIdPatterns = [
                /(?:TICKET\s*(?:ID|NO|NUMBER|#)?|BOOKING\s*(?:ID|REF|REFERENCE)?|REF(?:ERENCE)?)[:\s#]*([A-Z0-9]{6,12})/i,
                /(?:ID|REF)[:\s#]*([A-Z0-9]{6,12})/i,
                /\b([A-Z]{2,4}[0-9]{4,8})\b/,
                /\b(\d{8,12})\b/
            ];
            for (const pattern of ticketIdPatterns) {
                const idMatch = text.match(pattern);
                if (idMatch && idMatch[1]) {
                    extractedTicketId = idMatch[1].toUpperCase();
                    break;
                }
            }

            // Extract Type
            const ticketTypes = ['VIP', 'GENERAL', 'EARLY BIRD', 'VVIP', 'PLATINUM', 'GOLD', 'SILVER', 'STUDENT', 'REGULAR', 'PREMIUM'];
            const foundType = ticketTypes.find(type => text.toUpperCase().includes(type)) || "GENERAL PASS";

            // Match Event
            let eventTitle = qrVerifiedData?.items?.[0]?.eventTitle || "";
            let eventId = qrVerifiedData?.eventId || "";

            if (!eventId) {
                const eventsSnap = await getDocs(collection(db, 'events'));
                const allEvents = eventsSnap.docs.map(d => ({
                    id: d.id,
                    title: (d.data().eventTitle || d.data().title || '').toUpperCase()
                }));
                const match = allEvents.find(ev => ev.title && (text.toUpperCase().includes(ev.title) || ev.title.split(' ').some(word => word.length > 3 && text.toUpperCase().includes(word))));
                if (match) {
                    eventTitle = match.title;
                    eventId = match.id;
                }
            }

            // If still no event title, try to extract from OCR
            if (!eventTitle || eventTitle === "") {
                // Look for common event patterns
                const eventPatterns = [
                    /(?:EVENT|SHOW|CONCERT|FESTIVAL)[:\s]*(.{5,40})/i,
                    /(?:PRESENTS?|LIVE)[:\s]*(.{5,40})/i
                ];
                for (const pattern of eventPatterns) {
                    const eventMatch = text.match(pattern);
                    if (eventMatch && eventMatch[1]) {
                        eventTitle = eventMatch[1].trim().toUpperCase();
                        break;
                    }
                }
            }

            // Fallback event title
            if (!eventTitle) eventTitle = "UNKNOWN EVENT";

            setListingData(prev => ({
                ...prev,
                eventTitle: eventTitle,
                eventId: eventId,
                ticketName: qrVerifiedData?.items?.[0]?.name || foundType,
                ticketNumber: qrVerifiedData?.items?.[0]?.ticketNumber || extractedTicketId || "",
                seatLabel: qrVerifiedData?.items?.[0]?.label || extractedSeat || "",
                originalPrice: qrVerifiedData?.items?.[0]?.price || extractedPrice || "",
                resalePrice: (qrVerifiedData?.items?.[0]?.price || extractedPrice) > 0 ? ((qrVerifiedData?.items?.[0]?.price || extractedPrice) * 0.9).toFixed(0) : "",
                verificationFlag: qrVerifiedData ? "VERIFIED_GENUINE" : (eventId ? "AI_MATCHED" : "UNVERIFIED"),
                originalBookingId: verifiedBookingId
            }));

        } catch (error) {
            console.error("Analysis Error:", error);
            toast.error("Analysis failed. Please enter details manually.");
        } finally {
            setIsAnalyzing(false);
            setModalStep(3);
        }
    };

    const handleListingSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) { navigate('/login'); return; }

        if (Number(listingData.resalePrice) > Number(listingData.originalPrice)) {
            toast.error(`Price limit: ₹${listingData.originalPrice}`);
            return;
        }

        setIsSubmitting(true);
        try {
            let finalImageUrl = 'https://via.placeholder.com/400x200?text=Ticket+Preview';
            if (listingData.ticketImage) {
                try {
                    finalImageUrl = await uploadToS3(listingData.ticketImage, 'tickets/resale');
                } catch (e) {
                    console.warn("Upload failed, using placeholder");
                }
            }

            await addDoc(collection(db, 'resell_tickets'), {
                sellerId: currentUser.uid,
                sellerName: currentUser.displayName || 'Fan Seller',
                ticketName: listingData.ticketName,
                ticketNumber: listingData.ticketNumber,
                seatLabel: listingData.seatLabel,
                eventTitle: listingData.eventTitle,
                eventId: listingData.eventId || 'generic_event',
                originalPrice: Number(listingData.originalPrice),
                resalePrice: Number(listingData.resalePrice),
                imageUrl: finalImageUrl,
                status: 'available',
                createdAt: serverTimestamp(),
                isAIVerified: true,
                verificationFlag: listingData.verificationFlag,
                originalBookingId: listingData.originalBookingId
            });

            toast.success("Ticket listed successfully!");
            setShowModal(false);
            setModalStep(1);
        } catch (err) {
            toast.error("Failed to post listing.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBuy = (ticket) => {
        navigate('/checkout', {
            state: {
                isResale: true,
                items: [{
                    ...ticket,
                    name: `RESALE: ${ticket.ticketName}`,
                    price: ticket.resalePrice,
                    quantity: 1
                }],
                totalPrice: ticket.resalePrice,
                resaleTicketId: ticket.id
            }
        });
    };

    return (
        <>
            <SEOHead
                title="Resell Marketplace - Buy & Sell Tickets Safely"
                description="Tickify's secure secondary ticket marketplace. Buy and sell event tickets with AI-powered verification. Safe fan-to-fan transactions with price protection. No scalping - fair prices only."
                keywords={[
                    'resell tickets',
                    'buy resale tickets',
                    'sell my tickets',
                    'secondary ticket market',
                    'verified ticket resale',
                    'ticket marketplace india',
                    'safe ticket resale',
                    'fan to fan tickets'
                ]}
                canonical="https://tickify.com/resell"
                breadcrumbs={[
                    { name: 'Home', url: '/' },
                    { name: 'Resell Marketplace' }
                ]}
            />
            <div className="min-h-screen bg-[var(--color-bg-primary)] pt-36 pb-24">
                {/* Hidden reader for scanning library */}
                <div id="qr-reader-hidden" style={{ display: 'none' }}></div>

                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase text-[var(--color-text-primary)]">
                            <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>Fans Marketplace</span>
                            <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-primary)]">Fans Marketplace</span>
                        </h1>
                        <p className="text-xl font-bold text-[var(--color-text-secondary)] mb-8">Secure secondary market with Tickify AI verification.</p>

                        <button
                            onClick={() => setShowModal(true)}
                            className="neo-btn bg-[var(--color-accent-primary)] text-white px-10 py-4 font-black uppercase text-xl shadow-[8px_8px_0_black] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0_black] transition-all"
                        >
                            List for Resale
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center"><div className="text-xl font-bold animate-pulse">Loading Live Market...</div></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {tickets.length > 0 ? (
                                tickets.map(ticket => (
                                    <div key={ticket.id} className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)] hover:translate-y-[-4px] hover:shadow-[12px_12px_0_var(--color-text-primary)] transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-[var(--color-text-primary)] inline-block ${ticket.verificationFlag === 'VERIFIED_GENUINE' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'}`}>
                                                    {ticket.verificationFlag === 'VERIFIED_GENUINE' ? '✓ Verified Genuine' : 'Verified Resale'}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-bold text-[var(--color-text-muted)]">
                                                {ticket.createdAt ? new Date(ticket.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                            </span>
                                        </div>

                                        {ticket.imageUrl && (
                                            <div className="w-full h-32 bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] mb-4 overflow-hidden relative">
                                                <img src={ticket.imageUrl} alt="Ticket" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all opacity-80" />
                                                <div className="absolute inset-0 bg-black/10"></div>
                                            </div>
                                        )}

                                        <h3 className="text-xl font-black text-[var(--color-text-primary)] mb-1 uppercase tracking-tighter truncate">{ticket.eventTitle}</h3>
                                        <p className="text-xs font-bold text-[var(--color-accent-primary)] mb-4 uppercase">{ticket.ticketName}</p>

                                        <div className="flex flex-col gap-2 mb-6">
                                            {/* Event Info Row */}
                                            <div className="flex items-center justify-between border-b border-[var(--color-bg-hover)] pb-2">
                                                <span className="text-[9px] font-black uppercase text-[var(--color-text-muted)]">Event</span>
                                                <span className="text-[10px] font-bold text-[var(--color-text-primary)] truncate max-w-[150px]">
                                                    {ticket.eventTitle}
                                                </span>
                                            </div>

                                            {/* Seat Row - Always show if available */}
                                            {ticket.seatLabel && (
                                                <div className="flex items-center justify-between border-b border-[var(--color-bg-hover)] pb-2">
                                                    <span className="text-[9px] font-black uppercase text-[var(--color-text-muted)]">Seat</span>
                                                    <span className="bg-yellow-400 badge-accent text-gray-900 px-2 py-0.5 text-[10px] font-black uppercase border-2 border-[var(--color-text-primary)] shadow-[2px_2px_0_var(--color-text-primary)]">
                                                        {ticket.seatLabel}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Ticket ID Row */}
                                            <div className="flex items-center justify-between border-b border-[var(--color-bg-hover)] pb-2">
                                                <span className="text-[9px] font-black uppercase text-[var(--color-text-muted)]">Ticket ID</span>
                                                <span className="bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] px-2 py-0.5 text-[10px] font-mono tracking-tighter">
                                                    {ticket.ticketNumber || ticket.bookingReference || ticket.ticketId?.slice(-8).toUpperCase() || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-6 p-4 bg-[var(--color-bg-secondary)] border-2 border-dashed border-[var(--color-text-muted)]/30">
                                            <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-widest text-[var(--color-text-muted)]">
                                                <span>Original</span>
                                                <span className="line-through text-red-400">₹{ticket.originalPrice}</span>
                                            </div>
                                            <div className="flex justify-between text-2xl font-black text-[var(--color-text-primary)] items-baseline">
                                                <span className="text-[10px] uppercase text-[var(--color-text-muted)]">Market Price</span>
                                                <span className="text-[var(--color-accent-primary)]">₹{ticket.resalePrice}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleBuy(ticket)}
                                            className="w-full neo-btn bg-black text-white py-3 uppercase text-sm font-black shadow-[4px_4px_0_#666] hover:bg-[var(--color-accent-primary)] active:shadow-none transition-all"
                                        >
                                            Secure Purchase
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 border-4 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                                    <span className="text-4xl mb-4 block">🎫</span>
                                    <p className="text-xl font-bold text-gray-400">No resale tickets available right now.</p>
                                    <button onClick={() => setShowModal(true)} className="mt-4 text-[var(--color-accent-primary)] font-black uppercase hover:underline">List yours first</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* List Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                        <div className="w-full max-w-xl neo-modal-content bg-white border-4 border-black shadow-[20px_20px_0_black] relative overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="bg-black text-white p-6 flex justify-between items-center border-b-4 border-black">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">AI Verification Engine</h2>
                                <button onClick={() => setShowModal(false)} className="text-3xl font-black hover:text-red-500">&times;</button>
                            </div>

                            <div className="p-8 overflow-y-auto">
                                {modalStep === 1 && (
                                    <div className="text-center">
                                        <div className="w-40 h-40 bg-gray-50 border-4 border-dashed border-gray-300 rounded-full flex items-center justify-center mx-auto mb-6 group hover:border-black cursor-pointer relative overflow-hidden transition-all">
                                            <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                            <span className="text-5xl group-hover:scale-125 transition-transform duration-500">📥</span>
                                        </div>
                                        <h3 className="text-2xl font-black uppercase mb-2">Upload Ticket Media</h3>
                                        <p className="text-sm font-medium text-gray-500 mb-8 max-w-xs mx-auto">Upload a clear photo or screenshot of your ticket QR. We'll scan it to verify authenticity.</p>
                                        <label className="neo-btn inline-block bg-black text-white px-10 py-3 cursor-pointer shadow-[6px_6px_0_var(--color-accent-primary)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase font-black text-sm">
                                            Browse Files
                                            <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                                        </label>
                                    </div>
                                )}

                                {modalStep === 2 && (
                                    <div className="text-center py-12">
                                        <div className="relative w-48 h-48 mx-auto mb-10">
                                            <div className="absolute inset-0 border-4 border-black rounded-xl overflow-hidden grayscale opacity-50">
                                                {listingData.ticketImage && <img src={URL.createObjectURL(listingData.ticketImage)} alt="scanning" className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_20px_green] animate-scan"></div>
                                        </div>
                                        <h3 className="text-3xl font-black uppercase mb-2 animate-pulse">Running Scan...</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Checking QR Code & Cloud Database</p>
                                    </div>
                                )}

                                {modalStep === 3 && (
                                    <form onSubmit={handleListingSubmit} className="space-y-6">
                                        <div className={`p-4 border-2 flex items-center gap-4 ${listingData.verificationFlag === 'VERIFIED_GENUINE' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                            <span className="text-3xl">{listingData.verificationFlag === 'VERIFIED_GENUINE' ? '🛡️' : '🔍'}</span>
                                            <div>
                                                <p className={`text-[10px] font-black uppercase ${listingData.verificationFlag === 'VERIFIED_GENUINE' ? 'text-green-700' : 'text-yellow-700'}`}>
                                                    {listingData.verificationFlag === 'VERIFIED_GENUINE' ? 'Verified Official Tickify Pass' : 'AI Analysis Results'}
                                                </p>
                                                <p className="text-xs font-bold text-gray-600">{listingData.verificationFlag === 'VERIFIED_GENUINE' ? 'Genuine cloud-linked ticket detected.' : 'Please verify details below.'}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="col-span-1 md:col-span-2">
                                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Event Entry</label>
                                                <input type="text" value={listingData.eventTitle} readOnly className="w-full p-3 border-2 border-black font-black uppercase text-sm bg-gray-50 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Pass Category</label>
                                                <input type="text" value={listingData.ticketName} readOnly className="w-full p-3 border-2 border-black font-black uppercase text-sm bg-gray-50 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Ticket Number</label>
                                                <input type="text" value={listingData.ticketNumber} readOnly className="w-full p-3 border-2 border-black font-mono text-sm bg-gray-50 outline-none" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 p-6 bg-black text-white border-4 border-black">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Original (₹)</label>
                                                <input type="text" value={listingData.originalPrice} readOnly className="w-full bg-transparent border-b-2 border-white/20 p-2 font-black text-2xl outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Resell For (₹)</label>
                                                <input type="number" value={listingData.resalePrice} onChange={e => setListingData(p => ({ ...p, resalePrice: e.target.value }))} className="w-full bg-transparent border-b-2 border-[var(--color-accent-primary)] p-2 font-black text-2xl outline-none text-[var(--color-accent-primary)] animate-pulse" />
                                            </div>
                                        </div>

                                        <button type="submit" disabled={isSubmitting} className="w-full neo-btn bg-black text-white py-4 font-black uppercase text-xl shadow-[8px_8px_0_var(--color-accent-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_var(--color-accent-primary)] transition-all">
                                            {isSubmitting ? 'SECURE LISTING...' : 'LIST TICKET NOW'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <style>{`
                @keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
                .animate-scan { animation: scan 2s linear infinite; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
            </div>
        </>
    );
};

export default ResellMarketplace;

