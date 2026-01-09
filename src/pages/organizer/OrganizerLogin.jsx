import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const OrganizerLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, logout } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.type]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(formData.email, formData.password);

            // Verify if user is an organizer and check status
            const orgDocRef = doc(db, 'organizers', user.uid);
            const orgDoc = await getDoc(orgDocRef);

            if (orgDoc.exists()) {
                const orgData = orgDoc.data();

                if (orgData.status === 'pending') {
                    await logout();
                    setError('Your account is pending approval. You will be notified via email once approved.');
                    setLoading(false);
                    return;
                }

                if (orgData.status === 'suspended') {
                    await logout();
                    setError('Your account has been suspended. Please contact support.');
                    setLoading(false);
                    return;
                }

                // Login successful
                navigate('/organizer/dashboard'); // Or wherever the dashboard is
            } else {
                // Check if they are a regular user trying to login as organizer
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    await logout();
                    setError('This account is registered as a User, not an Organizer.');
                } else {
                    await logout();
                    setError('Organizer account not found.');
                }
            }
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else {
                setError('Failed to login. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden transition-colors duration-300">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-20 w-64 h-64 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-block hover:rotate-6 transition-transform">
                        <div className="w-20 h-20 border-4 border-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-text-primary)] font-black text-4xl shadow-[8px_8px_0_var(--color-text-primary)] mb-6 mx-auto">
                            O
                        </div>
                    </Link>
                    <h1 className="text-5xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter mb-2">Organizer<br />Portal</h1>
                    <p className="text-[var(--color-text-secondary)] font-bold text-lg">Manage your empire.</p>
                </div>

                <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-text-primary)] shadow-[12px_12px_0_var(--color-text-primary)] relative">
                    {/* Decorative Corner */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-purple-500 border-2 border-[var(--color-text-primary)] rotate-45"></div>
                    <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-yellow-500 border-2 border-[var(--color-text-primary)] rotate-12"></div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)] tracking-widest">Organizer Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="organizer@tickify.com"
                                className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)] rounded-none px-4 py-4 font-bold focus:border-purple-500 focus:shadow-[4px_4px_0_#a855f7] focus:outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-xs font-black uppercase text-[var(--color-text-secondary)] tracking-widest">Password</label>
                                <Link to="/organizer/forgot-password" title='Forgot Password' className="text-xs font-black uppercase text-[var(--color-accent-primary)] hover:underline">Forgot?</Link>
                            </div>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••••••"
                                className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)] rounded-none px-4 py-4 font-bold focus:border-purple-500 focus:shadow-[4px_4px_0_#a855f7] focus:outline-none transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="neo-btn w-full bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-black text-xl py-4 border-2 border-[var(--color-text-primary)] hover:bg-purple-500 hover:text-white hover:border-white transition-all shadow-[6px_6px_0_var(--color-text-secondary)] hover:shadow-[8px_8px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] uppercase tracking-wider disabled:opacity-50"
                        >
                            {loading ? 'Logging In...' : 'Enter Dashboard'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t-2 border-dashed border-[var(--color-text-muted)] text-center">
                        <p className="font-bold text-[var(--color-text-secondary)]">
                            Want to host events? <Link to="/organizer/register" className="text-[var(--color-text-primary)] hover:text-purple-500 underline decoration-2 decoration-purple-500">Register Here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerLogin;
