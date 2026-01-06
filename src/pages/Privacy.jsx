import React from 'react';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-32 md:pt-40 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-black uppercase text-[var(--color-text-primary)] mb-8 border-b-4 border-[var(--color-text-primary)] pb-4">
                    Privacy Policy
                </h1>

                <div className="space-y-8 font-medium text-lg text-[var(--color-text-secondary)]">
                    <p>Effective Date: Dec 09, 2025</p>

                    <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">1. Data Collection</h2>
                        <p>We collect several different types of information for various purposes to provide and improve our Service to you. </p>
                        <h3 className="font-bold mt-4 mb-2">Types of Data Collected:</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li><span className="font-bold">Personal Data:</span> Email address, First name and last name, Phone number, Cookies and Usage Data.</li>
                            <li><span className="font-bold">Usage Data:</span> Information on how the Service is accessed and used (e.g., page visits, duration, device info).</li>
                        </ul>
                    </section>

                    <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">2. Use of Data</h2>
                        <p>Tickify uses the collected data for various purposes:</p>
                        <ul className="list-disc list-inside space-y-2 mt-2">
                            <li>To provide and maintain the Service</li>
                            <li>To notify you about changes to our Service</li>
                            <li>To allow you to participate in interactive features when you choose to do so</li>
                            <li>To provide customer care and support</li>
                            <li>To provide analysis or valuable information so that we can improve the Service</li>
                            <li>To monitor the usage of the Service</li>
                            <li>To detect, prevent and address technical issues</li>
                        </ul>
                    </section>

                    <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">3. Data Transfer</h2>
                        <p>Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.</p>
                        <p className="mt-4">If you are located outside India and choose to provide information to us, please note that we transfer the data, including Personal Data, to India and process it there.</p>
                    </section>

                    <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">4. Disclosure of Data</h2>
                        <p>Tickify may disclose your Personal Data in the good faith belief that such action is necessary to:</p>
                        <ul className="list-disc list-inside space-y-2 mt-2">
                            <li>To comply with a legal obligation</li>
                            <li>To protect and defend the rights or property of Tickify</li>
                            <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
                            <li>To protect the personal safety of users of the Service or the public</li>
                            <li>To protect against legal liability</li>
                        </ul>
                    </section>

                    <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">5. Security</h2>
                        <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
                    </section>

                    <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">6. Service Providers</h2>
                        <p>We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>
                    </section>

                    <section className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)] mb-4">7. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us by email: <a href="mailto:Contacttickify@gmail.com" className="hover:underline text-[var(--color-text-primary)] font-bold">Contacttickify@gmail.com</a></p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
