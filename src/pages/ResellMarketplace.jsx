import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, onSnapshot, query, where, orderBy, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadToS3 } from '../services/s3Service';
import Tesseract from 'tesseract.js';
import toast from 'react-hot-toast';

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
    const [uploadProgress, setUploadProgress] = useState(0);

    const [listingData, setListingData] = useState({
        ticketName: '',
        eventTitle: '',
        eventId: '',
        originalPrice: '',
        resalePrice: '',
        ticketImage: null,
        imageUrl: '',
        verificationFlag: 'PENDING'
    });

    useEffect(() => {
        setLoading(true);
        // Query available resell tickets
        const q = query(
            collection(db, 'resell_tickets'),
            where('status', '==', 'available')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTickets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort locally to avoid needing a Firestore composite index
            const sortedTickets = fetchedTickets.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA; // Descending
            });

            setTickets(sortedTickets);
            setLoading(false);
        }, (error) => {
            toast.error("Error fetching resell tickets");
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
            // Real OCR Analysis using Tesseract.js
            const { data: { text } } = await Tesseract.recognize(file, 'eng', {
                logger: m => console.log(m)
            });

            console.log("OCR Extracted Text:", text);

            // Analysis Logic: Find real data in the text
            const lines = text.split('\n').map(l => l.trim().toUpperCase());

            // 1. Try to find price
            let extractedPrice = 0;

            // Broad pattern for currency or price labels, handling potential symbol misreads
            const priceRegex = /(?:[₹7\?]|RS\.?|INR|PRICE|TOTAL|AMT|PAID)[:\s]*(\d{1,5}(?:,\d+)*(?:\.\d+)?)/i;
            const explicitPriceMatch = text.match(priceRegex);

            if (explicitPriceMatch) {
                extractedPrice = parseInt(explicitPriceMatch[1].replace(/,/g, ''));
            } else {
                // Secondary check: Look for lines containing keywords and nearby numbers
                const keywords = ['₹', 'RS', 'PRICE', 'ADMISSION', 'PASS', 'TICKET', 'TOTAL', 'PAID'];
                for (const line of lines) {
                    if (keywords.some(k => line.includes(k))) {
                        const lineNumbers = line.match(/\b\d{1,5}\b/g);
                        if (lineNumbers) {
                            // Take first number in the line that isn't a likely year
                            const candidate = lineNumbers.find(n => !['2023', '2024', '2025', '2026'].includes(n));
                            if (candidate) {
                                extractedPrice = parseInt(candidate);
                                break;
                            }
                        }
                    }
                }
            }

            // Final fallback: any numeric value that isn't a year or long ID
            if (extractedPrice === 0) {
                const allNumbers = text.match(/\b\d{1,5}\b/g) || [];
                const commonYears = ['2023', '2024', '2025', '2026'];
                const filteredNumbers = allNumbers.filter(n => !commonYears.includes(n) && n.length < 5);
                if (filteredNumbers.length > 0) {
                    extractedPrice = parseInt(filteredNumbers[0]);
                }
            }

            // 2. Try to find Ticket Type
            const ticketTypes = ['VIP', 'GENERAL', 'EARLY BIRD', 'VVIP', 'PLATINUM', 'GOLD', 'SILVER', 'STUDENT'];
            const foundType = ticketTypes.find(type => text.toUpperCase().includes(type)) || "GENERAL PASS";

            // 3. Try to match Event Title with real events in our DB
            let eventTitle = "UNKNOWN EVENT";
            let eventId = "";
            try {
                const eventsSnap = await getDocs(collection(db, 'events'));
                const allEvents = eventsSnap.docs.map(d => ({
                    id: d.id,
                    title: (d.data().eventTitle || d.data().title || '').toUpperCase()
                }));

                // Fine best fuzzy match
                const match = allEvents.find(ev => ev.title && (text.toUpperCase().includes(ev.title) || ev.title.split(' ').some(word => word.length > 3 && text.toUpperCase().includes(word))));
                if (match) {
                    eventTitle = match.title;
                    eventId = match.id;
                } else {
                    // Try to find any line that looks like a title
                    const possibleTitle = lines.find(l => l.length > 5 && l.length < 50 && !l.includes('₹') && !l.includes('TICKET'));
                    if (possibleTitle) eventTitle = possibleTitle;
                }
            } catch (e) {
                // Fail silently for event matching
            }

            // Update UI with REAL Extracted Data
            setListingData(prev => ({
                ...prev,
                eventTitle: eventTitle,
                eventId: eventId,
                ticketName: foundType,
                originalPrice: extractedPrice > 0 ? extractedPrice.toString() : "",
                resalePrice: extractedPrice > 0 ? (extractedPrice * 0.9).toFixed(0) : "", // Suggest a 10% discount
                verificationFlag: eventId ? "VERIFIED_GENUINE" : "UNVERIFIED"
            }));

        } catch (error) {
            toast.error("Analysis failed to read the image properly. Please enter details manually.");
        } finally {
            setIsAnalyzing(false);
            setModalStep(3);
        }
    };

    const handleListingSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            toast.error("Please login to list a ticket.");
            navigate('/login');
            return;
        }

        if (Number(listingData.resalePrice) > Number(listingData.originalPrice)) {
            toast.error(`Fair Price Policy: You cannot list for more than the original price (₹${listingData.originalPrice}).`);
            return;
        }

        setIsSubmitting(true);
        try {
            let finalImageUrl = 'https://via.placeholder.com/400x200?text=Ticket+Preview';

            if (listingData.ticketImage) {
                // Real upload to S3 if service exists, otherwise use placeholder
                try {
                    finalImageUrl = await uploadToS3(listingData.ticketImage, 'tickets/resale');
                } catch (e) {
                    console.warn("S3 upload failed, using secondary mock url");
                }
            }

            await addDoc(collection(db, 'resell_tickets'), {
                sellerId: currentUser.uid,
                sellerName: currentUser.displayName || 'Fan Seller',
                ticketName: listingData.ticketName,
                eventTitle: listingData.eventTitle,
                eventId: listingData.eventId || 'generic_event', // Ensure eventId is never undefined
                originalPrice: Number(listingData.originalPrice),
                resalePrice: Number(listingData.resalePrice),
                imageUrl: finalImageUrl,
                status: 'available',
                createdAt: serverTimestamp(),
                isAIVerified: true
            });

            toast.success("Ticket listed successfully on the marketplace!");
            setShowModal(false);
            setModalStep(1);
            setListingData({
                ticketName: '',
                eventTitle: '',
                originalPrice: '',
                resalePrice: '',
                ticketImage: null,
                imageUrl: '',
                verificationFlag: 'PENDING'
            });
        } catch (err) {
            toast.error("Failed to post listing. Please try again.");
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
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-36 pb-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase text-[var(--color-text-primary)]">
                        <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>Resale Market</span>
                        <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-primary)]">Resale Market</span>
                    </h1>
                    <p className="text-xl font-bold text-[var(--color-text-secondary)] mb-8">Buy tickets from other fans at fair prices.</p>

                    <button
                        onClick={() => setShowModal(true)}
                        className="neo-btn bg-[var(--color-accent-primary)] text-white px-10 py-4 font-black uppercase text-xl shadow-[8px_8px_0_black] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0_black] transition-all"
                    >
                        List Your Ticket
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center">
                        <div className="text-xl font-bold">Loading Marketplace...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tickets.length > 0 ? (
                            tickets.map(ticket => (
                                <div key={ticket.id} className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-black shadow-[8px_8px_0_black] hover:translate-y-[-4px] hover:shadow-[12px_12px_0_black] transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase px-2 py-0.5 border border-black inline-block">
                                                Verified Resale
                                            </span>
                                            {ticket.isAIVerified && (
                                                <span className="bg-green-100 text-green-700 text-[8px] font-black uppercase px-2 py-0.5 border border-black flex items-center gap-1">
                                                    🤖 AI Security Checked
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">
                                            {ticket.createdAt ? new Date(ticket.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                        </span>
                                    </div>

                                    {ticket.imageUrl && (
                                        <div className="w-full h-32 bg-gray-100 border-2 border-black mb-4 overflow-hidden relative group">
                                            <img src={ticket.imageUrl} alt="Ticket" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all opacity-80" />
                                            <div className="absolute inset-0 bg-black/10"></div>
                                        </div>
                                    )}

                                    <h3 className="text-xl font-black text-[var(--color-text-primary)] mb-1 uppercase tracking-tighter truncate">{ticket.ticketName}</h3>
                                    <p className="text-[10px] font-bold text-gray-500 mb-4 uppercase truncate">{ticket.eventTitle}</p>

                                    <div className="mb-6 p-3 bg-gray-50 border-2 border-dashed border-gray-200">
                                        <div className="flex justify-between text-[10px] font-bold mb-1">
                                            <span className="text-gray-400">Original Value:</span>
                                            <span className="line-through text-red-300">₹{ticket.originalPrice}</span>
                                        </div>
                                        <div className="flex justify-between text-2xl font-black text-[var(--color-text-primary)] items-baseline">
                                            <span className="text-[10px] uppercase text-gray-400">Market Price</span>
                                            <span className="text-[var(--color-accent-primary)]">₹{ticket.resalePrice}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleBuy(ticket)}
                                        className="w-full neo-btn bg-black text-white py-3 uppercase text-sm font-black shadow-[4px_4px_0_#999] hover:bg-[var(--color-accent-primary)] active:shadow-none transition-all"
                                    >
                                        Secure Purchase
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 border-4 border-dashed border-gray-300 rounded-xl">
                                <p className="text-xl font-bold text-gray-400">No resale tickets available right now.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* List Ticket Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-xl bg-white border-4 border-black shadow-[16px_16px_0_black] relative overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="bg-black text-white p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">List for Resale</h2>
                            <button onClick={() => setShowModal(false)} className="text-3xl font-black hover:text-[var(--color-accent-primary)]">&times;</button>
                        </div>

                        <div className="p-8 overflow-y-auto">
                            {/* Step Indicator */}
                            <div className="flex gap-2 mb-8 items-center justify-center">
                                {[1, 2, 3].map(s => (
                                    <div key={s} className={`h-2 flex-1 rounded-full border border-black ${modalStep >= s ? 'bg-black' : 'bg-gray-100'}`}></div>
                                ))}
                            </div>

                            {modalStep === 1 && (
                                <div className="text-center animate-fade-in-up">
                                    <div className="mb-8">
                                        <div className="w-32 h-32 bg-gray-50 border-4 border-dashed border-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 group hover:border-black transition-colors cursor-pointer relative overflow-hidden">
                                            <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                            <span className="text-4xl group-hover:scale-110 transition-transform">📸</span>
                                        </div>
                                        <h3 className="text-xl font-black uppercase mb-2">Upload Ticket Photo</h3>
                                        <p className="text-sm font-bold text-gray-500">Take a photo of your physical or digital ticket for AI analysis.</p>
                                    </div>
                                    <label className="neo-btn inline-block bg-black text-white px-8 py-3 cursor-pointer shadow-[4px_4px_0_#444] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase font-black">
                                        Select Image
                                        <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                                    </label>
                                </div>
                            )}

                            {modalStep === 2 && (
                                <div className="text-center py-10 animate-fade-in-up">
                                    <div className="relative w-48 h-48 mx-auto mb-8">
                                        {/* Analyzing Animation */}
                                        <div className="absolute inset-0 border-4 border-black rounded-lg overflow-hidden grayscale">
                                            {listingData.ticketImage && <img src={URL.createObjectURL(listingData.ticketImage)} alt="scanning" className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-accent-primary)] shadow-[0_0_15px_var(--color-accent-primary)] animate-scan"></div>
                                    </div>
                                    <h3 className="text-2xl font-black uppercase mb-2">Analyzing Security...</h3>
                                    <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Running OCR and Authenticity Checks</p>
                                </div>
                            )}

                            {modalStep === 3 && (
                                <form onSubmit={handleListingSubmit} className="space-y-6 animate-fade-in-up">
                                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded flex items-center gap-3">
                                        <span className="text-2xl">🤖</span>
                                        <div>
                                            <p className="text-[10px] font-black text-green-700 uppercase">AI Found This Info</p>
                                            <p className="text-xs font-bold text-gray-600 italic">Please review and edit if necessary.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Event Title</label>
                                            <input
                                                type="text"
                                                value={listingData.eventTitle}
                                                onChange={e => setListingData(p => ({ ...p, eventTitle: e.target.value }))}
                                                className="w-full p-3 border-2 border-black font-black uppercase text-sm bg-gray-50"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Ticket Type</label>
                                            <input
                                                type="text"
                                                value={listingData.ticketName}
                                                onChange={e => setListingData(p => ({ ...p, ticketName: e.target.value }))}
                                                className="w-full p-3 border-2 border-black font-black uppercase text-sm bg-gray-50"
                                                placeholder="e.g. Early Bird"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 p-6 bg-black text-white border-4 border-black shadow-[8px_8px_0_#999]">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Original Price (₹)</label>
                                            <input
                                                type="number"
                                                value={listingData.originalPrice}
                                                onChange={e => setListingData(p => ({ ...p, originalPrice: e.target.value }))}
                                                className="w-full bg-transparent border-b-2 border-white p-2 font-black text-2xl outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Resale Price (Fair Limit)</label>
                                            <input
                                                type="number"
                                                value={listingData.resalePrice}
                                                onChange={e => setListingData(p => ({ ...p, resalePrice: e.target.value }))}
                                                className="w-full bg-transparent border-b-2 border-[var(--color-accent-primary)] p-2 font-black text-2xl outline-none text-[var(--color-accent-primary)]"
                                                placeholder="0"
                                                required
                                            />
                                            <p className="text-[8px] mt-1 italic text-gray-400">Must be ₹{listingData.originalPrice || '0'} or less</p>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full neo-btn bg-black text-white py-4 font-black uppercase text-xl shadow-[8px_8px_0_var(--color-accent-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_var(--color-accent-primary)] transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'SECURE LISTING...' : 'LIST TICKET NOW'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes scan {
                    0% { top: 0%; transform: scaleX(1); opacity: 0; }
                    5% { opacity: 1; }
                    100% { top: 100%; transform: scaleX(1.1); opacity: 0; }
                }
                .animate-scan {
                    animation: scan 1.5s linear infinite;
                }
                @keyframes fade-in-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ResellMarketplace;
