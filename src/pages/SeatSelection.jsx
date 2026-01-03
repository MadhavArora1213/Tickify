import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

const SeatSelection = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eventData, setEventData] = useState(null);

    useEffect(() => {
        setLoading(true);
        const docRef = doc(db, 'events', id);

        // REAL-TIME LISTENER using onSnapshot
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setEventData(data);

                // Parse the 2D Seating Grid from JSON or direct object
                if (data.seatingGrid) {
                    try {
                        const parsedGrid = typeof data.seatingGrid === 'string'
                            ? JSON.parse(data.seatingGrid)
                            : data.seatingGrid;

                        const tickets = data.tickets || [];

                        // Map the grid to include resolved ticket details for each seat
                        const mappedRows = parsedGrid.map((rowArr, rIndex) => {
                            const rowLabel = String.fromCharCode(65 + rIndex); // A, B, C...
                            return {
                                id: rowLabel,
                                seats: rowArr.map(seat => {
                                    const ticket = tickets[seat.ticketTypeIndex || 0] || {};

                                    // Determine status based on seat type and 'sold' status from Firestore if implemented
                                    // In a real app, 'sold' status might be in a separate subcollection 'bookings' 
                                    // or embedded in the grid if we update the grid on booking.
                                    // Assuming here that 'booked' or 'sold' status is updated directly in the grid.
                                    let status = 'available';
                                    if (seat.type === 'blocked') status = 'blocked';
                                    if (seat.type === 'aisle') status = 'aisle';
                                    if (seat.status === 'sold' || seat.isSold) status = 'sold'; // Checks for sold flag

                                    return {
                                        ...seat,
                                        status: status,
                                        price: Number(ticket.price) || 0,
                                        ticketName: ticket.name || 'Standard',
                                        type: (ticket.name || '').includes('VIP') ? 'VIP' : 'STD',
                                        color: ticket.color // Use color from ticket definition
                                    };
                                })
                            };
                        });

                        setRows(mappedRows);
                    } catch (e) {
                        console.error("Failed to parse seating grid", e);
                        setRows([]);
                    }
                } else if (data.tickets) {
                    // Fallback for events without specific grid
                    const generatedRows = [];
                    let currentRowId = 'A';
                    data.tickets.forEach((ticket, index) => {
                        for (let i = 0; i < 2; i++) {
                            const seats = Array(8).fill(null).map((_, idx) => ({
                                id: `${currentRowId}${idx + 1}`,
                                label: `${currentRowId}${idx + 1}`,
                                status: 'available',
                                price: Number(ticket.price) || 0,
                                ticketName: ticket.name,
                                type: ticket.name.includes('VIP') ? 'VIP' : 'STD',
                                color: ticket.color
                            }));
                            generatedRows.push({
                                id: currentRowId,
                                seats: seats
                            });
                            currentRowId = String.fromCharCode(currentRowId.charCodeAt(0) + 1);
                        }
                    });
                    setRows(generatedRows);
                }
            } else {
                console.log("No such event!");
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to event:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    const toggleSeat = (seat) => {
        if (seat.status !== 'available') return;

        const isSelected = selectedSeats.find(s => s.id === seat.id);

        if (isSelected) {
            setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
        } else {
            // Limit to 6 seats max
            if (selectedSeats.length >= 6) {
                alert("You can only select up to 6 seats.");
                return;
            }
            setSelectedSeats([...selectedSeats, {
                id: seat.id,
                label: seat.label,
                price: seat.price,
                type: seat.type,
                ticketName: seat.ticketName,
                row: seat.row,
                col: seat.col
            }]);
        }
    };

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    const handleConfirmBooking = () => {
        if (!eventData) return;

        navigate('/checkout', {
            state: {
                event: {
                    id: id,
                    ...eventData
                },
                items: selectedSeats.map(seat => ({
                    ...seat,
                    // Add necessary fields for checkout/ticket generation
                    name: seat.ticketName,
                    quantity: 1
                })),
                isSeatedEvent: true,
                totalPrice: totalPrice
            }
        });
    };

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
                    <p className="font-bold text-[var(--color-text-secondary)]">{eventData?.eventTitle || 'Event'} • Main Stage</p>
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
                                {row.seats.map((seat, index) => {
                                    const isSelected = selectedSeats.find(s => s.id === seat.id);

                                    // Aisle
                                    if (seat.status === 'aisle') {
                                        return <div key={index} className="w-8 h-8 md:w-10"></div>; // Invisible gap
                                    }

                                    // Blocked / Sold
                                    if (seat.status === 'blocked' || seat.status === 'sold') {
                                        return (
                                            <div key={index} className="w-8 h-8 md:w-10 md:h-10 rounded-t-lg bg-[var(--color-text-secondary)] opacity-30 border-2 border-transparent cursor-not-allowed flex items-center justify-center">
                                                <span className="text-[10px]">✕</span>
                                            </div>
                                        );
                                    }

                                    // Available Seat
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => toggleSeat(seat)}
                                            style={!isSelected && seat.color ? { backgroundColor: seat.color + '40' /* 25% opacity */, borderColor: seat.color } : {}}
                                            className={`w-8 h-8 md:w-10 md:h-10 rounded-t-lg border-2 border-[var(--color-text-primary)] transition-all font-black text-[10px] md:text-xs flex items-center justify-center
                                            ${isSelected
                                                    ? 'bg-[var(--color-accent-primary)] text-white translate-y-[-4px] shadow-[0_4px_0_var(--color-text-primary)] !bg-[var(--color-accent-primary)] !border-black'
                                                    : 'bg-white hover:bg-gray-100'
                                                }`}
                                            title={`${seat.ticketName} - ₹${seat.price} (${seat.label || seat.id})`}
                                        >
                                            {seat.status === 'available' ? (seat.label || seat.id) : ''}
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
                            {selectedSeats.length > 0 ? selectedSeats.map(s => s.label || s.id).join(', ') : 'None'}
                        </p>
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="text-right flex-1 md:flex-none">
                            <p className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Total Amount</p>
                            <p className="text-3xl font-black text-[var(--color-text-primary)]">₹{totalPrice}</p>
                        </div>
                        <button
                            onClick={handleConfirmBooking}
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
