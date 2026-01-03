import React from 'react';

const CookiePolicy = () => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-black uppercase text-[var(--color-text-primary)] mb-8 border-b-4 border-[var(--color-text-primary)] pb-4">
                    Cookie Policy
                </h1>

                <div className="space-y-8 font-medium text-lg text-[var(--color-text-secondary)]">
                    <p>Last Updated: Dec 09, 2025</p>

                    <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">1. What Are Cookies</h2>
                        <p>Cookies are small pieces of text sent to your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.</p>
                    </section>

                    <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">2. How Tickify Uses Cookies</h2>
                        <ul className="list-disc list-inside space-y-2 mt-2">
                            <li>To enable certain functions of the Service</li>
                            <li>To provide analytics</li>
                            <li>To store your preferences</li>
                            <li>To enable advertisements delivery, including behavioral advertising</li>
                        </ul>
                    </section>

                    <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">3. Your Choices</h2>
                        <p>If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, you may not be able to store your preferences, and some of our pages might not display properly.</p>
                    </section>

                    <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">4. Contact Us</h2>
                        <p>If you have any questions about our Cookie Policy, please contact us at <a href="mailto:Contacttickify@gmail.com" className="hover:underline text-[var(--color-text-primary)]">Contacttickify@gmail.com</a></p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicy;
