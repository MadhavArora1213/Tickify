import React from 'react';

const Terms = () => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-black uppercase text-[var(--color-text-primary)] mb-8 border-b-4 border-[var(--color-text-primary)] pb-4">
                    Terms & Conditions
                </h1>

                <div className="space-y-8 font-medium text-lg text-[var(--color-text-secondary)]">
                    <p>Last Updated: Dec 09, 2025</p>

                    <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">1. Introduction</h2>
                        <p>Welcome to Tickify. By accessing our platform, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.</p>
                    </section>

                    <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">2. Purchases</h2>
                        <p>If you wish to purchase any product or service available through the Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, and your billing address.</p>
                    </section>

                    <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">3. Content</h2>
                        <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;
