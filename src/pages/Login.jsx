import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(email, password);

            // Check if user is an admin - they should use admin login
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            if (adminDoc.exists()) {
                // Sign out and redirect to admin login
                await signOut(auth);
                setError('Admin accounts must use the Admin Console to login.');
                setLoading(false);
                return;
            }

            navigate('/');
        } catch (err) {
            toast.error('Login failed');
            switch (err.code) {
                case 'auth/user-not-found':
                    setError('No account found with this email.');
                    break;
                case 'auth/wrong-password':
                    setError('Incorrect password. Please try again.');
                    break;
                case 'auth/invalid-email':
                    setError('Invalid email address format.');
                    break;
                case 'auth/too-many-requests':
                    setError('Too many failed attempts. Please try again later.');
                    break;
                default:
                    setError('Failed to sign in. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);

        try {
            await signInWithGoogle();
            navigate('/');
        } catch (err) {
            toast.error('Google sign-in failed');
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in cancelled. Please try again.');
            } else if (err.code === 'auth/popup-blocked') {
                setError('Pop-up blocked. Please allow pop-ups for this site.');
            } else {
                setError('Failed to sign in with Google. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SEOHead
                title="Login - Sign In to Tickify"
                description="Sign in to your Tickify account to access your event tickets, manage bookings, and discover amazing events near you."
                keywords={['tickify login', 'sign in', 'event tickets login', 'ticket account']}
                canonical="https://tickify.co.in/login"
                breadcrumbs={[
                    { name: 'Home', url: '/' },
                    { name: 'Login' }
                ]}
            />
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden transition-colors duration-300">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-[var(--color-accent-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--color-accent-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-[var(--color-success)] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="max-w-md w-full relative z-10">
                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <Link to="/" className="inline-block hover:rotate-6 transition-transform duration-300">
                            <div className="w-20 h-20 border-4 border-[var(--color-text-primary)] bg-[var(--color-accent-primary)] flex items-center justify-center text-white font-black text-4xl shadow-[8px_8px_0_var(--color-text-primary)] mb-6 mx-auto transform hover:shadow-[12px_12px_0_var(--color-text-primary)] transition-all">
                                T
                            </div>
                        </Link>
                        <h1 className="text-5xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter mb-2">
                            Welcome<br />Back
                        </h1>
                        <p className="text-[var(--color-text-secondary)] font-bold text-lg">
                            Sign in to continue your journey.
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-text-primary)] shadow-[12px_12px_0_var(--color-text-primary)] relative">
                        {/* Decorative Elements */}
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-[var(--color-accent-primary)] border-2 border-[var(--color-text-primary)] rotate-45"></div>
                        <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-[var(--color-warning)] border-2 border-[var(--color-text-primary)] rotate-12"></div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-2 border-[var(--color-error)] text-[var(--color-error)] font-bold text-sm animate-pulse">
                                <span className="mr-2">⚠️</span>{error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-[var(--color-text-secondary)] tracking-widest">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)] rounded-none px-4 py-4 font-bold focus:border-[var(--color-accent-primary)] focus:shadow-[4px_4px_0_var(--color-accent-primary)] focus:outline-none transition-all placeholder-[var(--color-text-muted)]"
                                />
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black uppercase text-[var(--color-text-secondary)] tracking-widest">
                                        Password
                                    </label>
                                    <Link to="/forgot-password" className="text-xs font-black uppercase text-[var(--color-accent-primary)] hover:underline">
                                        Forgot?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)] rounded-none px-4 py-4 pr-12 font-bold focus:border-[var(--color-accent-primary)] focus:shadow-[4px_4px_0_var(--color-accent-primary)] focus:outline-none transition-all placeholder-[var(--color-text-muted)]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-xl"
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="w-5 h-5 border-2 border-[var(--color-text-primary)] rounded-none accent-[var(--color-accent-primary)]"
                                />
                                <label htmlFor="remember" className="text-sm font-bold text-[var(--color-text-secondary)] cursor-pointer">
                                    Remember me on this device
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`neo-btn w-full bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-black text-xl py-4 border-2 border-[var(--color-text-primary)] hover:bg-[var(--color-accent-primary)] hover:text-white hover:border-[var(--color-accent-primary)] transition-all shadow-[6px_6px_0_var(--color-text-secondary)] hover:shadow-[8px_8px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3`}
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        Signing In...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-8 flex items-center gap-4">
                            <div className="flex-1 h-0.5 bg-[var(--color-text-muted)] opacity-30"></div>
                            <span className="text-xs font-black uppercase text-[var(--color-text-muted)]">or</span>
                            <div className="flex-1 h-0.5 bg-[var(--color-text-muted)] opacity-30"></div>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full py-3 border-2 border-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] font-bold uppercase text-sm hover:bg-[var(--color-bg-hover)] transition-all flex items-center justify-center gap-3 shadow-[3px_3px_0_var(--color-text-primary)] hover:shadow-[5px_5px_0_var(--color-text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </button>
                        </div>

                        {/* Register Link */}
                        <div className="mt-8 pt-6 border-t-2 border-dashed border-[var(--color-text-muted)] text-center">
                            <p className="font-bold text-[var(--color-text-secondary)]">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)] underline decoration-2 decoration-[var(--color-accent-primary)]">
                                    Create One
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Portal Links */}
                    <div className="mt-8 flex justify-center gap-6 text-xs font-black uppercase">
                        <Link to="/organizer/login" className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-secondary)] transition-colors">
                            Organizer Portal →
                        </Link>
                        <Link to="/scanner/login" className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] transition-colors">
                            Scanner Portal →
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
