import React from 'react';
import SEOHead from '../components/SEOHead';

const Terms = () => {
    return (
        <>
            <SEOHead
                title="Terms & Conditions"
                description="Tickify Terms of Service. Read our terms and conditions for using the Tickify event ticketing platform. Includes information on purchases, refunds, and user responsibilities."
                keywords={['tickify terms', 'terms of service', 'terms and conditions', 'user agreement', 'tickify policies']}
                canonical="https://tickify.com/terms"
                noIndex={false}
                breadcrumbs={[
                    { name: 'Home', url: '/' },
                    { name: 'Terms & Conditions' }
                ]}
            />
            <div className="min-h-screen bg-[var(--color-bg-primary)] pt-32 md:pt-40 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-black uppercase text-[var(--color-text-primary)] mb-8 border-b-4 border-[var(--color-text-primary)] pb-4">
                        Terms & Conditions
                    </h1>

                    <div className="space-y-8 font-medium text-lg text-[var(--color-text-secondary)]">
                        <p>Last Updated: Dec 09, 2025</p>

                        <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                            <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">1. Introduction</h2>
                            <p>Welcome to Tickify. By accessing our platform, you agree to be bound by these Terms of Service ("Terms"). These Terms apply to all visitors, users, and others who access or use the Service.</p>
                            <p className="mt-4">By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>
                        </section>

                        <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                            <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">2. Accounts</h2>
                            <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                            <p className="mt-4">You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>
                        </section>

                        <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                            <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">3. Purchases & Refunds</h2>
                            <p>If you wish to purchase any product or service available through the Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, your billing address, and your shipping information.</p>
                            <p className="mt-4 font-bold">Refund Policy:</p>
                            <p>Tickify acts as an agent for those who are promoting or otherwise providing the events (the "Organizer"). The Organizer is responsible for their own refund policy. Tickify will facilitate refunds only as authorized by the Organizer or as required by law. Please check the specific event page for refund details before purchasing.</p>
                        </section>

                        <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                            <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">4. Content</h2>
                            <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.</p>
                        </section>

                        <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                            <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">5. Intellectual Property</h2>
                            <p>The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of Tickify and its licensors. The Service is protected by copyright, trademark, and other laws of both India and foreign countries.</p>
                        </section>

                        <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                            <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">6. Termination</h2>
                            <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                        </section>

                        <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                            <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">7. Governing Law</h2>
                            <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
                        </section>

                        <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                            <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">8. Contact Us</h2>
                            <p>If you have any questions about these Terms, please contact us at <a href="mailto:Contacttickify@gmail.com" className="hover:underline text-[var(--color-text-primary)] font-bold">Contacttickify@gmail.com</a></p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Terms;
