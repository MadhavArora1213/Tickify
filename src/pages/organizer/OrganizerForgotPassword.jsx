import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import toast from 'react-hot-toast';

const OrganizerForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
            setMessage({ type: 'error', text: 'Please enter a valid email address.' });
            return;
        }

        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email, {
                url: window.location.origin + '/organizer/login', // Redirect URL after password reset
                handleCodeInApp: false
            });
            setEmailSent(true);
            setMessage({
                type: 'success',
                text: 'Password reset email sent! Check your inbox.'
            });
            toast.success('Password reset email sent!');
        } catch (error) {
            toast.error('Failed to send reset email');

            switch (error.code) {
                case 'auth/user-not-found':
                    setMessage({ type: 'error', text: 'No account found with this email address.' });
                    break;
                case 'auth/invalid-email':
                    setMessage({ type: 'error', text: 'Invalid email address.' });
                    break;
                case 'auth/too-many-requests':
                    setMessage({ type: 'error', text: 'Too many requests. Please try again later.' });
                    break;
                default:
                    setMessage({ type: 'error', text: 'Failed to send reset email. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => {
        setEmailSent(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden transition-colors duration-300">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute -bottom-32 left-20 w-64 h-64 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-md w-full relative z-10">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block hover:rotate-6 transition-transform duration-300">
                        <div className="w-20 h-20 border-4 border-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-text-primary)] font-black text-4xl shadow-[8px_8px_0_var(--color-text-primary)] mb-6 mx-auto transform hover:shadow-[12px_12px_0_var(--color-text-primary)] transition-all">
                            O
                        </div>
                    </Link>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter mb-2">
                        {emailSent ? 'Check Your Email' : 'Reset Password'}
                    </h1>
                    <p className="text-[var(--color-text-secondary)] font-bold">
                        {emailSent
                            ? "We've sent you a password reset link."
                            : "Organizer, we'll help you get back to your dashboard."
                        }
                    </p>
                </div>

                {/* Main Card */}
                <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-text-primary)] shadow-[12px_12px_0_var(--color-text-primary)] relative">
                    {/* Decorative Elements */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-purple-500 border-2 border-[var(--color-text-primary)] rotate-45"></div>
                    <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-yellow-500 border-2 border-[var(--color-text-primary)] -rotate-12"></div>

                    {/* Messages */}
                    {message.text && (
                        <div className={`mb-6 p-4 border-2 font-bold text-sm ${message.type === 'success'
                            ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700'
                            : 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700'
                            }`}>
                            <span className="mr-2">{message.type === 'success' ? '✅' : '⚠️'}</span>
                            {message.text}
                        </div>
                    )}

                    {!emailSent ? (
                        /* Email Input Form */
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Illustration */}
                            <div className="text-center py-4">
                                <div className="text-6xl mb-2">🔑</div>
                            </div>

                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-[var(--color-text-secondary)] tracking-widest">
                                    Organizer Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="organizer@tickify.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)] rounded-none px-4 py-3 font-bold focus:border-purple-500 focus:shadow-[4px_4px_0_#a855f7] focus:outline-none transition-all placeholder-[var(--color-text-muted)]"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="neo-btn w-full bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-black text-xl py-4 border-2 border-[var(--color-text-primary)] hover:bg-purple-500 hover:text-white hover:border-white transition-all shadow-[6px_6px_0_var(--color-text-secondary)] hover:shadow-[8px_8px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Send Reset Link
                                        <span>📧</span>
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        /* Success State */
                        <div className="text-center space-y-6">
                            {/* Success Illustration */}
                            <div className="py-4">
                                <div className="text-7xl mb-4 animate-bounce">📬</div>
                                <p className="text-[var(--color-text-secondary)] font-bold">
                                    Reset link sent to:
                                </p>
                                <p className="font-black text-[var(--color-text-primary)] break-all">
                                    {email}
                                </p>
                            </div>

                            {/* Instructions */}
                            <div className="bg-[var(--color-bg-secondary)] border-2 border-dashed border-[var(--color-text-muted)] p-4 text-left">
                                <h4 className="font-black text-sm uppercase text-[var(--color-text-primary)] mb-2">What's Next?</h4>
                                <ol className="text-sm text-[var(--color-text-secondary)] font-bold space-y-1">
                                    <li>1. Check your email inbox</li>
                                    <li>2. Click the reset link</li>
                                    <li>3. Create a new password</li>
                                    <li>4. Return to Organizer Portal</li>
                                </ol>
                            </div>

                            {/* Didn't receive email */}
                            <div className="text-sm">
                                <p className="text-[var(--color-text-muted)] font-bold mb-2">
                                    Didn't receive the email?
                                </p>
                                <button
                                    onClick={handleResend}
                                    className="text-purple-500 font-black uppercase hover:underline"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Back to Login */}
                    <div className="mt-8 pt-6 border-t-2 border-dashed border-[var(--color-text-muted)] text-center">
                        <Link
                            to="/organizer/login"
                            className="inline-flex items-center gap-2 font-black text-[var(--color-text-primary)] hover:text-purple-500 uppercase transition-colors"
                        >
                            <span>←</span> Back to Organizer Login
                        </Link>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-[var(--color-text-muted)] font-bold">
                        🔒 Organizer Security: Password reset links expire after 1 hour.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrganizerForgotPassword;
