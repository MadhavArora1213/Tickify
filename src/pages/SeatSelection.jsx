import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const SeatSelection = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [selectedSeats, setSelectedSeats] = useState([]);

    // Mock Seat Configuration
    // 0: Sold, 1: Available (Standard), 2: Available (VIP)
    const rows = [
        { id: 'A', type: 'VIP', price: 150, seats: [2, 2, 2, 0, 0, 2, 2, 2] },
        { id: 'B', type: 'VIP', price: 150, seats: [2, 2, 0, 0, 2, 2, 2, 2] },
        { id: 'C', type: 'STD', price: 80, seats: [1, 1, 1, 1, 1, 1, 1, 1] },
        { id: 'D', type: 'STD', price: 80, seats: [1, 1, 0, 0, 0, 1, 1, 1] },
        { id: 'E', type: 'STD', price: 80, seats: [1, 1, 1, 1, 1, 1, 1, 1] },
        { id: 'F', type: 'ECO', price: 45, seats: [1, 1, 1, 1, 1, 1, 1, 1] },
    ];

    const toggleSeat = (rowId, seatIndex, price, type) => {
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
            setSelectedSeats([...selectedSeats, { id: seatId, price, type }]);
        }
    };

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-32 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-5xl font-black uppercase text-[var(--color-text-primary)]">Select Your Seats</h1>
                    <p className="font-bold text-[var(--color-text-secondary)]">Neon Nights Festival • Main Stage</p>
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
                        <span className="text-xs font-black uppercase">VIP ($150)</span>
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
                                            onClick={() => toggleSeat(row.id, index, row.price, row.type)}
                                            className={`w-8 h-8 md:w-10 md:h-10 rounded-t-lg border-2 border-[var(--color-text-primary)] transition-all font-black text-[10px] md:text-xs flex items-center justify-center
                                            ${isSelected
                                                    ? 'bg-[var(--color-accent-primary)] text-white translate-y-[-4px] shadow-[0_4px_0_var(--color-text-primary)]'
                                                    : row.type === 'VIP'
                                                        ? 'bg-yellow-300 hover:bg-yellow-200'
                                                        : 'bg-white hover:bg-gray-100'
                                                }`}
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
                            <p className="text-3xl font-black text-[var(--color-text-primary)]">${totalPrice}</p>
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
