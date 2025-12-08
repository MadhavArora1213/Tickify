import React from 'react';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-black uppercase text-[var(--color-text-primary)] mb-8 border-b-4 border-[var(--color-text-primary)] pb-4">
                    Privacy Policy
                </h1>

                <div className="space-y-8 font-medium text-lg text-[var(--color-text-secondary)]">
                    <p>Effective Date: Dec 09, 2025</p>

                    <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">1. Data Collection</h2>
                        <p>We collect several different types of information for various purposes to provide and improve our Service to you. Types of Data Collected include Personal Data and Usage Data.</p>
                    </section>

                    <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">2. Use of Data</h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li>To provide and maintain the Service</li>
                            <li>To notify you about changes to our Service</li>
                            <li>To allow you to participate in interactive features</li>
                            <li>To provide customer care and support</li>
                        </ul>
                    </section>

                    <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">3. Security</h2>
                        <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
