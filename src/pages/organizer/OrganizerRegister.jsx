import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import { sendOTPSMS, verifyOTP as verifyPhoneOTP, clearOTP as clearPhoneOTP } from '../../services/messageCentralOTPService';
import { sendOTPEmail, verifyOTP as verifyEmailOTP, clearOTP as clearEmailOTP, sendRegistrationReceivedEmail } from '../../services/brevoService';
import { indianLocations } from '../../data/indianLocations';

const OrganizerRegister = () => {
    const [step, setStep] = useState(1); // 1: Info, 2: Email Verify, 3: Phone Verify
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        organizerType: 'Individual', // Individual, Company, Organization
        organizationName: '',
        city: '',
        state: '',
        country: 'India',
        termsAccepted: false
    });

    // OTP State
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [verificationType, setVerificationType] = useState(null); // 'email' or 'phone'
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    const { registerOrganizer } = useAuth();
    const navigate = useNavigate();

    // Derived lists
    const states = Object.keys(indianLocations).sort();
    const cities = formData.state ? indianLocations[formData.state].sort() : [];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Reset city if state changes
        if (name === 'state') {
            setFormData(prev => ({ ...prev, city: '', [name]: value }));
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next
        if (value && index < otp.length - 1) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const startResendTimer = () => {
        setResendTimer(60);
        const interval = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Validation
    const validateStep1 = () => {
        if (!formData.fullName.trim()) return setError('Full Name is required');
        if (!formData.email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) return setError('Invalid Email');
        if (!formData.phoneNumber || formData.phoneNumber.length !== 10) return setError('Valid 10-digit Phone Number required');
        if (formData.password.length < 8) return setError('Password must be at least 8 characters');
        if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
        if (formData.organizerType !== 'Individual' && !formData.organizationName.trim()) return setError('Organization Name is required');
        if (!formData.state) return setError('State is required');
        if (!formData.city) return setError('City is required');
        if (!formData.termsAccepted) return setError('You must accept Terms & Conditions');

        return true;
    };

    // Step 1 -> 2: Send Email OTP
    const handleRegisterStart = async () => {
        setError(''); setSuccess('');
        if (!validateStep1()) return;

        setLoading(true);
        try {
            const result = await sendOTPEmail(formData.email, formData.fullName);
            if (result.success) {
                setStep(2);
                setVerificationType('email');
                setOtp(['', '', '', '', '', '']); // 6 digits for email
                setSuccess('OTP sent to your email!');
                startResendTimer();
            } else {
                setError(result.message);
            }
        } catch (err) {
            toast.error('Failed to initiate registration.');
            setError('Failed to initiate registration.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2 -> 3: Verify Email & Send Phone OTP
    const handleVerifyEmail = async () => {
        setError('');
        const otpString = otp.join('');
        if (otpString.length !== 6) return setError('Enter 6-digit code');

        const verifyResult = verifyEmailOTP(formData.email, otpString);
        if (!verifyResult.success) return setError(verifyResult.message);

        // Email verified, now send Phone OTP
        setLoading(true);
        try {
            const result = await sendOTPSMS(formData.phoneNumber);
            if (result.success) {
                setStep(3);
                setVerificationType('phone');
                setOtp(['', '', '', '']); // 4 digits for phone
                setSuccess('Email Verified! OPT sent to mobile.');
                startResendTimer();
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to send phone OTP.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3 -> Finish: Verify Phone & Create Account
    const handleVerifyPhoneAndCreate = async () => {
        setError('');
        const otpString = otp.join('');
        if (otpString.length !== 4) return setError('Enter 4-digit code');

        setLoading(true);
        try {
            const verifyResult = await verifyPhoneOTP(formData.phoneNumber, otpString);
            if (!verifyResult.success) {
                setError(verifyResult.message);
                setLoading(false);
                return;
            }

            // All verified, create account
            const organizerDetails = {
                organizerType: formData.organizerType,
                organizationName: formData.organizerType === 'Individual' ? '' : formData.organizationName,
                city: formData.city,
                state: formData.state,
                country: formData.country
            };



            await registerOrganizer(
                formData.email,
                formData.password,
                formData.fullName,
                formData.phoneNumber,
                organizerDetails
            );

            // Send confirmation email
            await sendRegistrationReceivedEmail(formData.email, formData.fullName);

            setSuccess('Registration Successful! You will be informed via email once your account is approved. Redirecting...');
            setTimeout(() => navigate('/organizer/login'), 4000);
        } catch (err) {
            toast.error(err.message || 'Registration failed');
            if (err.message.includes('Organizer account') || err.message.includes('Account with this email exists')) {
                setError(err.message);
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Email exists. Please login to your existing account.');
            } else {
                setError(err.message || 'Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        try {
            if (verificationType === 'email') {
                await sendOTPEmail(formData.email, formData.fullName);
                setSuccess('Email OTP resent!');
            } else {
                await sendOTPSMS(formData.phoneNumber);
                setSuccess('Phone OTP resent!');
            }
            startResendTimer();
        } catch (err) {
            setError('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center py-12 px-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

            <div className="max-w-3xl w-full relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter mb-2">
                        {step === 1 ? 'Organizer Registration' : 'Verification'}
                    </h1>
                    <p className="text-[var(--color-text-secondary)] font-bold">
                        {step === 1 ? 'Join the Tickify Organizer Network' : 'Verify your contact details'}
                    </p>
                </div>

                <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-text-primary)] shadow-[12px_12px_0_var(--color-text-primary)] relative">

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border-2 border-[var(--color-error)] text-[var(--color-error)] font-bold text-sm">
                            ⚠️ {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-green-100 border-2 border-[var(--color-success)] text-[var(--color-success)] font-bold text-sm">
                            ✅ {success}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6">
                            {/* Section 1: Account & Identity */}
                            <div>
                                <h3 className="text-xl font-black uppercase border-b-2 border-dashed border-[var(--color-text-muted)] pb-2 mb-4">Account & Identity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Full Name (Contact Person)</label>
                                        <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe"
                                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black p-3 font-bold text-sm focus:shadow-[4px_4px_0_var(--color-accent-primary)] transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Email Address</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="details@example.com"
                                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black p-3 font-bold text-sm focus:shadow-[4px_4px_0_var(--color-accent-primary)] transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Mobile Number</label>
                                        <div className="flex">
                                            <span className="bg-[var(--color-bg-secondary)] border-2 border-r-0 border-black p-3 font-bold text-sm flex items-center text-[var(--color-text-muted)]">+91</span>
                                            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="9876543210" maxLength="10"
                                                className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black p-3 font-bold text-sm focus:shadow-[4px_4px_0_var(--color-accent-primary)] transition-all" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Password</label>
                                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••"
                                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black p-3 font-bold text-sm focus:shadow-[4px_4px_0_var(--color-accent-primary)] transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Confirm Password</label>
                                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••"
                                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black p-3 font-bold text-sm focus:shadow-[4px_4px_0_var(--color-accent-primary)] transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Organizer Info */}
                            <div>
                                <h3 className="text-xl font-black uppercase border-b-2 border-dashed border-[var(--color-text-muted)] pb-2 mb-4">Organizer Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Organizer Type</label>
                                        <select name="organizerType" value={formData.organizerType} onChange={handleInputChange}
                                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black p-3 font-bold text-sm focus:shadow-[4px_4px_0_var(--color-accent-primary)] transition-all">
                                            <option value="Individual">Individual</option>
                                            <option value="Company">Company</option>
                                            <option value="Organization">Organization</option>
                                        </select>
                                    </div>
                                    {formData.organizerType !== 'Individual' && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Organization / Brand Name</label>
                                            <input type="text" name="organizationName" value={formData.organizationName} onChange={handleInputChange} placeholder="Acme Events"
                                                className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black p-3 font-bold text-sm focus:shadow-[4px_4px_0_var(--color-accent-primary)] transition-all" />
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Country</label>
                                        <input type="text" value="India" disabled
                                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black p-3 font-bold text-sm text-[var(--color-text-muted)] cursor-not-allowed" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">State</label>
                                        <select name="state" value={formData.state} onChange={handleInputChange}
                                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black p-3 font-bold text-sm focus:shadow-[4px_4px_0_var(--color-accent-primary)] transition-all">
                                            <option value="">Select State</option>
                                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">City</label>
                                        <select name="city" value={formData.city} onChange={handleInputChange} disabled={!formData.state}
                                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black p-3 font-bold text-sm focus:shadow-[4px_4px_0_var(--color-accent-primary)] transition-all disabled:opacity-50">
                                            <option value="">Select City</option>
                                            {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-3 mt-4">
                                <input type="checkbox" id="terms" name="termsAccepted" checked={formData.termsAccepted} onChange={handleInputChange}
                                    className="w-5 h-5 border-2 border-black mt-0.5 accent-[var(--color-accent-primary)] cursor-pointer" />
                                <label htmlFor="terms" className="text-sm font-bold text-[var(--color-text-secondary)]">
                                    I accept the Terms & Conditions and Privacy Policy
                                </label>
                            </div>

                            <button onClick={handleRegisterStart} disabled={loading}
                                className="neo-btn w-full bg-[var(--color-accent-secondary)] text-white font-black text-xl py-4 border-2 border-[var(--color-text-primary)] hover:bg-[var(--color-accent-primary)] transition-all shadow-[6px_6px_0_var(--color-text-primary)] hover:shadow-[8px_8px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] uppercase tracking-wider disabled:opacity-50">
                                {loading ? 'Processing...' : 'Register as Organizer →'}
                            </button>

                            <div className="text-center mt-4">
                                <Link to="/organizer/login" className="text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)]">
                                    Already have an account? Login
                                </Link>
                            </div>
                        </div>
                    )}

                    {(step === 2 || step === 3) && (
                        <div className="space-y-6 text-center">
                            <div className="text-6xl mb-4">{step === 2 ? '📧' : '📱'}</div>
                            <p className="text-sm text-[var(--color-text-muted)] font-bold">
                                Enter the {step === 2 ? '6' : '4'}-digit code sent to<br />
                                <span className="text-[var(--color-text-primary)] font-black text-lg">
                                    {step === 2 ? formData.email : `+91 ${formData.phoneNumber}`}
                                </span>
                            </p>

                            <div className="flex justify-center gap-2">
                                {otp.map((d, i) => (
                                    <input key={i} id={`otp-${i}`} type="text" maxLength="1" value={d}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        className="w-12 h-14 text-center text-2xl font-black border-2 border-black bg-[var(--color-bg-secondary)] focus:shadow-[4px_4px_0_var(--color-accent-primary)] focus:outline-none transition-all" />
                                ))}
                            </div>

                            <button onClick={step === 2 ? handleVerifyEmail : handleVerifyPhoneAndCreate} disabled={loading || otp.join('').length !== (step === 2 ? 6 : 4)}
                                className="neo-btn w-full bg-[var(--color-success)] text-white font-black text-xl py-4 border-2 border-black hover:brightness-110 transition-all shadow-[6px_6px_0_black] disabled:opacity-50">
                                {loading ? 'Verifying...' : (step === 2 ? 'Verify Email & Continue' : 'Verify Phone & Create Account')}
                            </button>

                            <div className="text-right">
                                {resendTimer > 0 ? (
                                    <span className="text-sm font-bold text-[var(--color-text-muted)]">Resend in {resendTimer}s</span>
                                ) : (
                                    <button onClick={handleResend} className="text-sm font-black text-[var(--color-accent-primary)] hover:underline uppercase">Resend OTP</button>
                                )}
                            </div>
                            <div className="text-left mt-4">
                                <button onClick={() => { setStep(1); setError(''); }} className="text-sm font-bold text-[var(--color-text-muted)] hover:text-black">← Back to Edit Details</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrganizerRegister;
