import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

const Cart = () => {
    // Dummy Cart Data
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            title: "Neon Nights Music Festival",
            type: "General Admission",
            price: 120,
            quantity: 2,
            image: "https://images.unsplash.com/photo-1470229722913-7ea2d9865154?q=80&w=2070&auto=format&fit=crop"
        },
        {
            id: 2,
            title: "Future Tech Summit 2025",
            type: "VIP Pass",
            price: 450,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070&auto=format&fit=crop"
        }
    ]);

    const updateQuantity = (id, change) => {
        setCartItems(cartItems.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + change);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeItem = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    return (
        <>
            <SEOHead
                title="Your Cart"
                description="Review your selected event tickets before checkout."
                noIndex={true}
                noFollow={true}
            />
            <div className="pt-36 pb-24 min-h-screen bg-[var(--color-bg-primary)]">
                <div className="container mx-auto px-4">
                    {/* Heading */}
                    <h1 className="text-4xl md:text-6xl font-black mb-12 uppercase text-center text-[var(--color-text-primary)]">
                        <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>Your Cart</span>
                        <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-primary)]">Your Cart</span>
                    </h1>

                    {cartItems.length === 0 ? (
                        <div className="text-center py-20 neo-card bg-[var(--color-bg-surface)]">
                            <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-4">YOUR CART IS EMPTY</h2>
                            <Link to="/events" className="neo-btn inline-block bg-[var(--color-accent-primary)] text-white px-8 py-3">START BROWSING</Link>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Cart Items List */}
                            <div className="w-full lg:w-2/3 space-y-6">
                                {cartItems.map(item => (
                                    <div key={item.id} className="neo-card bg-[var(--color-bg-surface)] p-4 flex flex-col md:flex-row gap-6 relative group border-4 border-black shadow-[8px_8px_0_black]">
                                        {/* Image */}
                                        <div className="w-full md:w-32 h-32 bg-gray-200 border-2 border-black rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-xl font-black text-[var(--color-text-primary)] uppercase leading-tight line-clamp-1">{item.title}</h3>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-[var(--color-error)] hover:text-red-700 font-black p-1 transition-transform hover:scale-110"
                                                    >
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                    </button>
                                                </div>
                                                <p className="text-[var(--color-text-secondary)] font-bold text-sm uppercase mt-1">{item.type}</p>
                                            </div>

                                            <div className="flex flex-wrap justify-between items-end mt-4 gap-4">
                                                <div className="text-2xl font-black text-[var(--color-text-primary)]">${item.price * item.quantity}</div>

                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg shadow-[2px_2px_0_black]">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="w-8 h-8 flex items-center justify-center font-black hover:bg-black hover:text-white transition-colors rounded-l-md"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center font-black text-[var(--color-text-primary)]">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="w-8 h-8 flex items-center justify-center font-black hover:bg-black hover:text-white transition-colors rounded-r-md"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="text-left">
                                    <Link to="/events" className="inline-flex items-center font-black text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)] hover:underline decoration-4">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                                        CONTINUE SHOPPING
                                    </Link>
                                </div>
                            </div>

                            {/* Summary Sidebar */}
                            <div className="w-full lg:w-1/3">
                                <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-black shadow-[8px_8px_0_black] sticky top-32">
                                    <h3 className="text-2xl font-black text-[var(--color-text-primary)] mb-6 uppercase border-b-4 border-black pb-4">Order Summary</h3>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between font-bold text-[var(--color-text-secondary)]">
                                            <span>Subtotal</span>
                                            <span>${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-[var(--color-text-secondary)]">
                                            <span>Tax (10%)</span>
                                            <span>${tax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-black text-2xl text-[var(--color-text-primary)] pt-4 border-t-2 border-dashed border-[var(--color-text-muted)]">
                                            <span>Total</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Promo Code */}
                                    <div className="mb-8">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="PROMO CODE"
                                                className="flex-1 neo-input text-sm uppercase bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-3 py-2"
                                            />
                                            <button className="neo-btn bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] px-4 py-2 text-sm">APPLY</button>
                                        </div>
                                    </div>

                                    <Link
                                        to="/checkout"
                                        className="neo-btn block w-full bg-[var(--color-accent-primary)] text-white text-center py-4 text-xl shadow-[6px_6px_0_black] hover:shadow-[8px_8px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                                    >
                                        PROCEED TO CHECKOUT
                                    </Link>

                                    <p className="text-center text-xs font-bold text-[var(--color-text-muted)] mt-4 uppercase">
                                        Secure Checkout • 100% Refund Guarantee
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Cart;
