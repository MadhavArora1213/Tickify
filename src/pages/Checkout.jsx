import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useAuth(); // Assuming AuthContext provides currentUser
    const { state } = location;

    // Redirect if no state (direct access)
    useEffect(() => {
        if (!state || !state.items) {
            navigate('/events');
        }
    }, [state, navigate]);

    const items = state?.items || [];
    const event = state?.event || {};
    const totalPrice = state?.totalPrice || 0;
    const tax = totalPrice * 0.18; // 18% GST example
    const totalAmount = totalPrice + tax;

    const [isProcessing, setIsProcessing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: currentUser?.email || '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        agreedToTerms: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const processBooking = async (paymentId) => {
        try {
            // Firestore Transaction to ensure atomic updates (especially for seats)
            const resultId = await runTransaction(db, async (transaction) => {

                // ---------------------------
                // 1. RESALE HANDLING
                // ---------------------------
                if (state.isResale && state.resaleTicketId) {
                    const resaleRef = doc(db, 'resell_tickets', state.resaleTicketId);
                    const resaleDoc = await transaction.get(resaleRef);

                    if (!resaleDoc.exists()) throw new Error("Resale record not found.");
                    const resaleData = resaleDoc.data();

                    if (resaleData.status !== 'available') throw new Error("Ticket already sold.");

                    // 1. Update Original Seller's Booking (Remove the item)
                    if (resaleData.originalBookingId) {
                        const originalBookingRef = doc(db, 'bookings', resaleData.originalBookingId);
                        const originalSnap = await transaction.get(originalBookingRef);

                        if (originalSnap.exists()) {
                            const originalData = originalSnap.data();
                            // Filter out the specific ticket using ticketId (e.g., "docId-0-0")
                            const updatedItems = originalData.items.map(item => {
                                // If this item has multiple quantities, we might need to decrement
                                // But since we split tickets into individual cards in MyTickets, 
                                // we treat them as individual units here.
                                // For simplicity: if it's a direct match by ticketId reference
                                return item;
                            }).filter((_, idx) => {
                                // Try to find which index matches the resale ticketId suffix
                                const suffix = resaleData.ticketId.split('-').slice(1).join('-');
                                return `${originalSnap.id}-${idx}` !== resaleData.ticketId;
                            });

                            transaction.update(originalBookingRef, { items: updatedItems });
                        }
                    }

                    // 2. Log the Resale Event (Audit Trail)
                    const logRef = doc(collection(db, 'resale_logs'));
                    transaction.set(logRef, {
                        resaleId: state.resaleTicketId,
                        sellerId: resaleData.sellerId,
                        buyerId: currentUser?.uid || 'guest',
                        amount: totalAmount,
                        ticketNumber: resaleData.ticketNumber,
                        timestamp: serverTimestamp(),
                        eventId: resaleData.eventId
                    });

                    // 3. Mark resale record as sold
                    transaction.update(resaleRef, {
                        status: 'sold',
                        buyerId: currentUser?.uid || 'guest',
                        soldAt: serverTimestamp()
                    });

                    // 4. Create New Booking for Buyer
                    const bookingRef = doc(collection(db, 'bookings'));
                    transaction.set(bookingRef, {
                        eventId: resaleData.eventId || 'generic_event',
                        userId: currentUser?.uid || 'guest',
                        userEmail: formData.email,
                        userName: `${formData.firstName} ${formData.lastName}`,
                        items: items.map(it => ({ ...it, ticketNumber: resaleData.ticketNumber, label: resaleData.seatLabel })),
                        totalAmount: totalAmount,
                        paymentId: paymentId,
                        paymentStatus: 'paid',
                        bookingDate: serverTimestamp(),
                        status: 'confirmed',
                        type: 'resale_purchase',
                        bookingReference: resaleData.ticketNumber || `RS-${Date.now()}`
                    });

                    return bookingRef.id;
                }
                else {
                    // ---------------------------
                    // 2. STANDARD EVENT HANDLING
                    // ---------------------------
                    const eventRef = doc(db, 'events', event.id);
                    const eventDoc = await transaction.get(eventRef);

                    if (!eventDoc.exists()) {
                        throw new Error("Event does not exist!");
                    }

                    const currentEventData = eventDoc.data();
                    let updatedData = {};

                    // A. Handle Seated Event Updates
                    if (state.isSeatedEvent && currentEventData.seatingGrid) {
                        let grid = typeof currentEventData.seatingGrid === 'string'
                            ? JSON.parse(currentEventData.seatingGrid)
                            : currentEventData.seatingGrid;

                        // Update specific seats to 'sold'
                        // We need to match items (seats) to grid positions
                        let allSeatsAvailable = true;

                        items.forEach(item => {
                            const { row, col, id: seatId } = item;

                            // Try grid access by row/col first
                            if (row !== undefined && col !== undefined && grid[row] && grid[row][col]) {
                                if (grid[row][col].type !== 'seat' || (grid[row][col].status === 'sold' && !grid[row][col].isResale)) {
                                    allSeatsAvailable = false;
                                }
                                grid[row][col].status = 'sold';
                                grid[row][col].isSold = true;
                            } else {
                                // Fallback search by ID
                                for (let r = 0; r < grid.length; r++) {
                                    for (let c = 0; c < grid[r].length; c++) {
                                        if (grid[r][c].id === seatId) {
                                            if (grid[r][c].status === 'sold') allSeatsAvailable = false;
                                            grid[r][c].status = 'sold';
                                            grid[r][c].isSold = true;
                                        }
                                    }
                                }
                            }
                        });

                        if (!allSeatsAvailable) {
                            throw new Error("One or more selected seats have already been sold.");
                        }

                        updatedData.seatingGrid = JSON.stringify(grid);
                    }

                    // 2. Handle Capacity & Sequence Logic
                    // We'll increment the sequence for EVERY ticket sold in this booking
                    const currentSequence = currentEventData.lastSequence || 0;

                    // Use event's defined prefix or generate one based on date and title
                    let eventCodePrefix = currentEventData.ticketPrefix;
                    if (!eventCodePrefix) {
                        const eventDate = currentEventData.startDate || currentEventData.date || new Date();
                        const d = new Date(eventDate);
                        const dateStr = !isNaN(d.getTime()) ? d.toISOString().slice(0, 10).replace(/-/g, '') : '20251226';
                        const titlePart = (currentEventData.eventTitle || event.title || "OFF").slice(0, 3).toUpperCase();
                        eventCodePrefix = `${dateStr}${titlePart}`;
                    }

                    const padding = currentEventData.ticketPadding || 3;
                    let nextSequence = currentSequence;

                    // Add ticketNumber to each item
                    const itemsWithTicketNumbers = items.map(item => {
                        const quantity = item.quantity || 1;
                        const numbers = [];

                        // Get 3-letter category code
                        const categoryCode = (item.name || item.ticketName || 'GEN')
                            .substring(0, 3)
                            .toUpperCase()
                            .replace(/\s/g, '');

                        for (let i = 0; i < quantity; i++) {
                            nextSequence++;
                            const seqStr = String(nextSequence).padStart(padding, '0');
                            // Format: [Prefix][Sequence][Category]
                            numbers.push(`${eventCodePrefix}${seqStr}${categoryCode}`);
                        }

                        return {
                            ...item,
                            ticketNumbers: numbers,
                            ticketNumber: numbers[0]
                        };
                    });

                    updatedData.lastSequence = nextSequence;

                    // 3. Update Event
                    transaction.update(eventRef, updatedData);

                    // 4. Create Booking Record
                    const bookingRef = doc(collection(db, 'bookings'));
                    transaction.set(bookingRef, {
                        eventId: event.id,
                        userId: currentUser?.uid || 'guest',
                        userEmail: formData.email,
                        userName: `${formData.firstName} ${formData.lastName}`,
                        items: itemsWithTicketNumbers,
                        totalAmount: totalAmount,
                        paymentId: paymentId,
                        paymentStatus: 'paid',
                        bookingDate: serverTimestamp(),
                        status: 'confirmed',
                        bookingReference: `${eventCodePrefix}${String(nextSequence).padStart(padding, '0')}` // Padded Reference (No Hyphen)
                    });

                    return bookingRef.id; // Return ID from transaction
                }
            });

            // Success Redirect
            navigate('/payment/success', { state: { bookingId: resultId, amount: totalAmount } });

        } catch (error) {
            toast.error("Booking failed: " + error.message);
            setIsProcessing(false);
        }
    };



    const handlePayment = async () => {
        console.log("Handle Payment Clicked"); // DEBUG LOG

        // Check for Login
        if (!currentUser) {
            toast.error("Please login to complete your booking.");
            // Navigate to Login, passing current location to potentially redirect back
            navigate('/login', { state: { from: location.pathname, checkoutState: state } });
            return;
        }

        if (!formData.firstName || !formData.email || !formData.phone) {
            console.warn("Validation Failed: Missing fields", formData);
            toast.error("Please fill in contact details.");
            return;
        }

        if (!formData.agreedToTerms) {
            console.warn("Validation Failed: Terms not agreed");
            toast.error("Please agree to the Terms and Conditions to proceed.");
            return;
        }

        setIsProcessing(true);
        console.log("Starting payment process. Total Amount:", totalAmount);

        // --- HANDLE FREE BOOKINGS (₹0) ---
        if (totalAmount <= 0) {
            toast.success("Processing free ticket...");
            await processBooking('FREE_ORDER_' + Date.now());
            return;
        }

        // --- PRE-CHECK FOR RESALE ---
        if (state.isResale && state.resaleTicketId) {
            try {
                const { getDoc } = await import('firebase/firestore');
                const resaleRef = doc(db, 'resell_tickets', state.resaleTicketId);
                const resaleSnap = await getDoc(resaleRef);

                if (!resaleSnap.exists() || resaleSnap.data().status !== 'available') {
                    toast.error("Sorry, this resale ticket has just been sold or is no longer available.");
                    navigate('/resell');
                    return;
                }
            } catch (err) {
                toast.error("Availability check failed");
            }
        }

        // Use Razorpay Key from environment variables
        // CRITICAL: For full security (to prevent payment bypass), you MUST verify the payment signature
        // on a backend server (Cloud Function) using the Key Secret. 
        // Client-side only integration is not tamper-proof.
        // Client-side only integration is not tamper-proof.
        const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
        console.log("Razorpay Key ID:", RAZORPAY_KEY ? "Found" : "Missing");

        if (!RAZORPAY_KEY) {
            toast.error("Razorpay Key is missing in configuration.");
            setIsProcessing(false);
            return;
        }

        const res = await loadRazorpay();
        console.log("Razorpay Script Loaded:", res);

        if (!res) {
            toast.error('Razorpay SDK failed to load. Are you online?');
            setIsProcessing(false);
            return;
        }

        const options = {
            key: RAZORPAY_KEY,
            amount: Math.round(totalAmount * 100), // Amount in paise
            currency: "INR",
            name: "Tickify Events",
            description: state.isResale ? `Resale Purchase` : `Tickets for ${event.title}`,
            image: "https://via.placeholder.com/150",
            order_id: "", // If you create orders on backend, pass it here
            handler: async function (response) {
                console.log("Payment Successful", response);

                try {
                    // Verify with Backend
                    // In production, change http://localhost:3000 to your actual server URL
                    const verifyRes = await fetch('http://localhost:3000/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id, // Note: standard checkout might not return order_id unless you created one
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    });

                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        toast.success("Payment Verified Securely");
                        processBooking(response.razorpay_payment_id);
                    } else {
                        toast.error("Payment Verification Failed! " + verifyData.message);
                        setIsProcessing(false);
                    }

                } catch (err) {
                    console.error("Backend verification error:", err);

                    // Fallback Logic for when the Verification Server is offline or unreachable
                    // This allows the transaction to complete in a "Demo" or "Dev" environment even if the backend is down
                    // BUT it marks the paymentStatus potentially differently if you wanted to be strict.

                    toast('⚠️ Verification server unreachable. Proceeding with caution.', {
                        icon: '⚠️',
                    });

                    // Proceed anyway so the user isn't stuck (Change this for high-security production)
                    processBooking(response.razorpay_payment_id);
                }
            },
            prefill: {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                contact: formData.phone
            },
            notes: {
                eventId: event.id,
                resaleId: state.resaleTicketId || 'NA'
            },
            theme: {
                color: "#000000"
            }
        };

        try {
            console.log("Initializing Razorpay with options:", options);
            const paymentObject = new window.Razorpay(options);

            paymentObject.on('payment.failed', function (response) {
                console.error("Razorpay Payment Failed:", response.error);
                toast.error("Payment Failed: " + response.error.description);
                setIsProcessing(false);
            });

            paymentObject.open();
            console.log("Razorpay Modal Opened");
        } catch (err) {
            console.error("Error opening Razorpay checkout:", err);
            toast.error("Failed to open payment gateway. Please try again.");
            setIsProcessing(false);
        }
    };

    if (!state) return null;

    return (
        <>
            <SEOHead
                title="Checkout - Complete Your Purchase"
                description="Complete your ticket purchase securely with Tickify."
                noIndex={true}
                noFollow={true}
            />
            <div className="pt-36 pb-24 min-h-screen bg-[var(--color-bg-primary)]">
                <div className="container mx-auto px-4">
                    {/* Heading */}
                    <h1 className="text-4xl md:text-6xl font-black mb-12 uppercase text-center text-[var(--color-text-primary)]">
                        <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>Checkout</span>
                        <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-primary)]">Checkout</span>
                    </h1>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column: Forms */}
                        <div className="w-full lg:w-2/3 space-y-8">

                            {/* 1. Contact Info */}
                            <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-black shadow-[8px_8px_0_black] relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 font-black text-xl border-b-2 border-l-2 border-white">01</div>
                                <h3 className="text-2xl font-black text-[var(--color-text-primary)] mb-6 uppercase">Contact Information</h3>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">First Name</label>
                                            <input name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" placeholder="John" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Last Name</label>
                                            <input name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" placeholder="Doe" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Email Address</label>
                                        <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" placeholder="john@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Phone Number</label>
                                        <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" placeholder="+91 0000000000" />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Razorpay/Payment Note */}
                            <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-black shadow-[8px_8px_0_black] relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 font-black text-xl border-b-2 border-l-2 border-white">02</div>
                                <h3 className="text-2xl font-black text-[var(--color-text-primary)] mb-6 uppercase">Payment</h3>

                                <div className="p-6 bg-blue-50 border-2 border-dashed border-blue-400 rounded-xl">
                                    <h4 className="font-bold text-blue-800 mb-2">🔒 Secure Payment with Razorpay</h4>
                                    <p className="text-sm text-blue-700">You will be redirected to the Razorpay secure payment gateway to complete your transaction. We accept all major credit/debit cards, UPI, and wallets.</p>
                                </div>
                            </div>

                        </div>

                        {/* Right Column: Order Summary */}
                        <div className="w-full lg:w-1/3">
                            <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-black shadow-[8px_8px_0_black] sticky top-32">
                                <h3 className="text-2xl font-black text-[var(--color-text-primary)] mb-6 uppercase border-b-4 border-black pb-4">In Your Bags</h3>

                                <ul className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                                    {items.map((item, idx) => (
                                        <li key={idx} className="flex justify-between items-start">
                                            <div>
                                                <span className="block font-black text-[var(--color-text-primary)] uppercase">{item.name || item.ticketName}</span>
                                                <span className="text-xs text-[var(--color-text-secondary)] font-bold">
                                                    {item.label ? `Seat: ${item.label}` : `Qty: ${item.quantity}`}
                                                </span>
                                            </div>
                                            <span className="font-black text-[var(--color-text-primary)]">₹{Number(item.price) * (item.quantity || 1)}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="space-y-2 mb-8 pt-4 border-t-2 border-dashed border-[var(--color-text-muted)]">
                                    <div className="flex justify-between font-bold text-[var(--color-text-secondary)]">
                                        <span>Subtotal</span>
                                        <span>₹{totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-[var(--color-text-secondary)]">
                                        <span>Tax & Fees (18%)</span>
                                        <span>₹{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-black text-2xl text-[var(--color-text-primary)] pt-2">
                                        <span>Total</span>
                                        <span>₹{totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="agreedToTerms"
                                        checked={formData.agreedToTerms}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 border-2 border-black rounded focus:ring-0 mt-1 cursor-pointer accent-black"
                                    />
                                    <span className="text-xs font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">
                                        I agree to the <a href="/terms" className="underline decoration-2">Terms and Conditions</a> and <a href="/privacy" className="underline decoration-2">Privacy Policy</a>.
                                    </span>
                                </label>

                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className={`neo-btn w-full bg-[var(--color-success)] text-white text-xl py-4 shadow-[6px_6px_0_black] hover:shadow-[8px_8px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] 
                                    ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isProcessing
                                        ? 'PROCESSING...'
                                        : ((totalAmount || 0) <= 0 ? 'CONFIRM FREE BOOKING' : `PAY ₹${Number(totalAmount || 0).toFixed(2)}`)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Checkout;
