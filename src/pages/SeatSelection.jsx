import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const SeatSelection = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eventName, setEventName] = useState('');

    useEffect(() => {
        const fetchEventAndSeats = async () => {
            try {
                setLoading(true);
                const docRef = doc(db, 'events', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const eventData = docSnap.data();
                    setEventName(eventData.title);

                    // Prefer explicit seat map if available in DB
                    if (eventData.rows || eventData.seatMap) {
                        setRows(eventData.rows || eventData.seatMap);
                    } else if (eventData.tickets) {
                        // Fallback: Generate rows based on ticket types
                        const generatedRows = [];
                        const seatLayouts = [
                            { count: 8, pattern: [1, 1, 1, 1, 1, 1, 1, 1] }, // Default fill
                            { count: 8, pattern: [1, 1, 1, 0, 0, 1, 1, 1] }, // With aisle
                        ];

                        let currentRowId = 'A';

                        eventData.tickets.forEach((ticket, index) => {
                            // Assign 2 rows per ticket type for demo purposes
                            // In a real app, this would be defined in the event creation
                            for (let i = 0; i < 2; i++) {
                                const pattern = seatLayouts[i % seatLayouts.length].pattern; // Alternating patterns
                                // Clone pattern to avoid reference issues
                                const seats = [...pattern];
                                generatedRows.push({
                                    id: currentRowId,
                                    type: ticket.name.includes('VIP') ? 'VIP' : (ticket.name.includes('General') ? 'STD' : 'ECO'),
                                    price: ticket.price,
                                    name: ticket.name, // Store ticket name for reference
                                    seats: seats
                                });
                                // Increment row char
                                currentRowId = String.fromCharCode(currentRowId.charCodeAt(0) + 1);
                            }
                        });
                        setRows(generatedRows);
                    }
                } else {
                    console.log("No such event!");
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEventAndSeats();
    }, [id]);

    const toggleSeat = (rowId, seatIndex, price, type, ticketName) => {
        const seatId = `${rowId}${seatIndex + 1}`;
        const isSelected = selectedSeats.find(s => s.id === seatId);

        if (isSelected) {
            setSelectedSeats(selectedSeats.filter(s => s.id !== seatId));
        } else {
            // Limit to 6 seats max
            if (selectedSeats.length >= 6) {
                alert("You can only select up to 6 seats.");
                return;
            }
            setSelectedSeats([...selectedSeats, { id: seatId, price, type, ticketName }]);
        }
    };

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-32 px-4 flex justify-center items-center">
                <div className="text-xl font-bold text-[var(--color-text-primary)]">Loading Seat Map...</div>
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-32 px-4 flex justify-center items-center">
                <div className="text-xl font-bold text-[var(--color-text-primary)]">No seat map available for this event.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-32 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-5xl font-black uppercase text-[var(--color-text-primary)]">Select Your Seats</h1>
                    <p className="font-bold text-[var(--color-text-secondary)]">{eventName || 'Event'} • Main Stage</p>
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 mb-12 flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 border-2 border-[var(--color-text-primary)] rounded bg-white"></div>
                        <span className="text-xs font-black uppercase">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 border-2 border-[var(--color-text-primary)] rounded bg-[var(--color-accent-primary)]"></div>
                        <span className="text-xs font-black uppercase">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 border-2 border-[var(--color-text-primary)] rounded bg-[var(--color-text-secondary)] opacity-50"></div>
                        <span className="text-xs font-black uppercase">Sold Out</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 border-2 border-[var(--color-text-primary)] rounded bg-yellow-300"></div>
                        <span className="text-xs font-black uppercase">VIP/Premium</span>
                    </div>
                </div>

                {/* Stage */}
                <div className="w-full h-16 bg-gradient-to-b from-[var(--color-text-primary)] to-transparent opacity-20 transform perspective(500px) rotateX(20deg) mb-12 rounded-t-[50%] text-center pt-2">
                    <span className="text-2xl font-black uppercase tracking-[1em] text-[var(--color-text-primary)] opacity-50">STAGE</span>
                </div>

                {/* Seat Map */}
                <div className="flex flex-col items-center gap-4 mb-12 overflow-x-auto pb-4">
                    {rows.map((row) => (
                        <div key={row.id} className="flex items-center gap-4">
                            <span className="text-sm font-black w-6 text-center text-[var(--color-text-secondary)]">{row.id}</span>
                            <div className="flex gap-2 md:gap-4">
                                {row.seats.map((status, index) => {
                                    // 0: Sold, 1: Available
                                    // You can expand this logic for more statuses if needed

                                    const seatId = `${row.id}${index + 1}`;
                                    const isSelected = selectedSeats.find(s => s.id === seatId);

                                    // Status 0: Sold
                                    if (status === 0) {
                                        return (
                                            <div key={index} className="w-8 h-8 md:w-10 md:h-10 rounded-t-lg bg-[var(--color-text-secondary)] opacity-30 border-2 border-transparent cursor-not-allowed"></div>
                                        );
                                    }

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => toggleSeat(row.id, index, row.price, row.type, row.name)}
                                            className={`w-8 h-8 md:w-10 md:h-10 rounded-t-lg border-2 border-[var(--color-text-primary)] transition-all font-black text-[10px] md:text-xs flex items-center justify-center
                                            ${isSelected
                                                    ? 'bg-[var(--color-accent-primary)] text-white translate-y-[-4px] shadow-[0_4px_0_var(--color-text-primary)]'
                                                    : (row.type === 'VIP' || row.price >= 150) // Basic heuristic for "premium" look
                                                        ? 'bg-yellow-300 hover:bg-yellow-200'
                                                        : 'bg-white hover:bg-gray-100'
                                                }`}
                                            title={`${row.name || row.type} - $${row.price}`}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>
                            <span className="text-sm font-black w-6 text-center text-[var(--color-text-secondary)]">{row.id}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-[var(--color-bg-surface)] border-t-4 border-[var(--color-text-primary)] p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 animate-slide-up">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <p className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Selected Seats ({selectedSeats.length})</p>
                        <p className="text-lg font-black text-[var(--color-text-primary)] truncate max-w-xs">
                            {selectedSeats.length > 0 ? selectedSeats.map(s => s.id).join(', ') : 'None'}
                        </p>
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="text-right flex-1 md:flex-none">
                            <p className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Total Amount</p>
                            <p className="text-3xl font-black text-[var(--color-text-primary)]">₹{totalPrice}</p>
                        </div>
                        <button
                            onClick={() => navigate('/checkout')}
                            disabled={selectedSeats.length === 0}
                            className={`px-8 py-3 font-black uppercase text-xl border-2 border-[var(--color-text-primary)] transition-all flex-1 md:flex-none
                            ${selectedSeats.length > 0
                                    ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] shadow-[6px_6px_0_var(--color-text-secondary)] hover:shadow-[8px_8px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'}`}
                        >
                            Confirm Booking
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
};

export default SeatSelection;
