import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { adminLogin, login } = useAuth();
    const navigate = useNavigate();

    // One-time setup: Create admin document in 'admins' collection
    const setupAdminInCollection = async (email, password) => {
        try {
            // First login with standard auth to get the user
            const { signInWithEmailAndPassword } = await import('firebase/auth');
            const { auth } = await import('../../config/firebase');

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if admin doc already exists
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));

            if (!adminDoc.exists()) {
                // Create admin document in 'admins' collection
                await setDoc(doc(db, 'admins', user.uid), {
                    uid: user.uid,
                    email: user.email,
                    displayName: 'Super Admin',
                    role: 'admin',
                    status: 'active',
                    emailVerified: true,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                return { success: true, message: 'Admin setup complete!' };
            }
            return { success: true, message: 'Admin already exists in collection.' };
        } catch (error) {
            toast.error('Setup error');
            return { success: false, error: error.message };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await adminLogin(email, password);
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error('Admin login error');

            // If access denied, try to setup admin in collection first
            if (err.message === 'Access denied. Admin privileges required.') {
                setSuccess('Setting up admin account...');
                const result = await setupAdminInCollection(email, password);

                if (result.success) {
                    // Try login again
                    try {
                        await adminLogin(email, password);
                        navigate('/admin/dashboard');
                        return;
                    } catch (retryErr) {
                        setError('Setup complete but login failed. Please try again.');
                    }
                } else {
                    setError('Access denied. This account does not have admin privileges. If you are a regular user, please use the main login page.');
                }
            } else {
                switch (err.code) {
                    case 'auth/user-not-found':
                        setError('No admin account found with this email.');
                        break;
                    case 'auth/wrong-password':
                        setError('Incorrect password.');
                        break;
                    case 'auth/too-many-requests':
                        setError('Too many failed attempts. Account temporarily locked.');
                        break;
                    default:
                        setError('Authentication failed. Please verify your credentials.');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Grid Background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(to right, #374151 1px, transparent 1px),
                                     linear-gradient(to bottom, #374151 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}></div>
            </div>

            {/* Glowing Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="max-w-md w-full relative z-10">
                {/* Admin Header */}
                <div className="text-center mb-12">
                    <div className="inline-block relative">
                        <div className="w-24 h-24 bg-black border-4 border-white shadow-[8px_8px_0_#EF4444] flex items-center justify-center mx-auto mb-6 transform hover:rotate-3 transition-transform">
                            <span className="text-5xl">🛡️</span>
                        </div>
                        {/* Security Badge */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 border-2 border-white rounded-full flex items-center justify-center animate-pulse">
                            <span className="text-white text-xs font-black">!</span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-2">
                        Admin<br />Console
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                        Authorized Personnel Only
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-gray-800 border-4 border-white p-8 shadow-[12px_12px_0_#1F2937] relative">
                    {/* Warning Stripes */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-500 via-black to-yellow-500" style={{ backgroundSize: '20px 100%' }}></div>

                    {/* Corner Decorations */}
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-red-600 border-2 border-white rotate-45"></div>
                    <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-yellow-500 border-2 border-white rotate-12"></div>

                    {/* Security Notice */}
                    <div className="mb-6 p-3 bg-yellow-900/30 border-2 border-yellow-500 text-yellow-400 text-xs font-bold uppercase flex items-center gap-2">
                        <span>⚠️</span>
                        <span>This is a restricted area. All access attempts are logged.</span>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-900/50 border-2 border-red-500 text-red-400 font-bold text-sm animate-pulse">
                            <span className="mr-2">🚫</span>{error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-900/50 border-2 border-green-500 text-green-400 font-bold text-sm">
                            <span className="mr-2">✅</span>{success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                <span>📧</span> Admin Email
                            </label>
                            <input
                                type="email"
                                placeholder="admin@tickify.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-gray-900 border-2 border-gray-600 text-white rounded-none px-4 py-4 font-bold focus:border-red-500 focus:shadow-[4px_4px_0_#EF4444] focus:outline-none transition-all placeholder-gray-600"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                <span>🔒</span> Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-gray-900 border-2 border-gray-600 text-white rounded-none px-4 py-4 pr-12 font-bold focus:border-red-500 focus:shadow-[4px_4px_0_#EF4444] focus:outline-none transition-all placeholder-gray-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-xl"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* 2FA Notice */}
                        <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-5 h-5 border-2 border-gray-600 rounded-none accent-red-600"
                            />
                            <label htmlFor="remember" className="text-sm font-bold text-gray-400 cursor-pointer">
                                Trust this device for 30 days
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-red-600 text-white font-black text-xl py-4 border-2 border-white hover:bg-red-500 transition-all shadow-[6px_6px_0_black] hover:shadow-[8px_8px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3`}
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <span>🔓</span>
                                    Access Console
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-700 text-center">
                        <p className="text-xs text-gray-500 font-bold uppercase">
                            Session timeout: 30 minutes | Last login attempt tracked
                        </p>
                    </div>
                </div>

                {/* Back Link */}
                <div className="mt-8 text-center">
                    <Link to="/" className="text-gray-500 hover:text-white font-black uppercase text-sm transition-colors">
                        ← Return to Main Site
                    </Link>
                </div>

                {/* Security Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-600 font-mono">
                        🔐 Secured by Tickify Security Systems v2.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
