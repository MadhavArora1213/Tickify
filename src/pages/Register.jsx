import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendOTPSMS, verifyOTP as verifyPhoneOTP, clearOTP as clearPhoneOTP } from '../services/messageCentralOTPService';
import { sendOTPEmail, verifyOTP as verifyEmailOTP, clearOTP as clearEmailOTP } from '../services/brevoService';

const Register = () => {
    const [step, setStep] = useState(1); // 1: Info, 2: Email Verify, 3: Phone Input, 4: Phone Verify
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // For input display
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [termsAccepted, setTermsAccepted] = useState(false);

    // New state to track which OTP we are verifying
    const [verificationType, setVerificationType] = useState(null); // 'email' or 'phone'


    const { signup, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);

        try {
            await signInWithGoogle();
            navigate('/');
        } catch (err) {
            console.error('Google sign-in error:', err);
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

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);
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

    const validateStep1 = () => {
        if (!formData.fullName.trim()) {
            setError('Please enter your full name.');
            return false;
        }
        if (!formData.email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
            setError('Please enter a valid email address.');
            return false;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return false;
        }
        if (!/[A-Z]/.test(formData.password)) {
            setError('Password must contain at least one uppercase letter.');
            return false;
        }
        if (!/[0-9]/.test(formData.password)) {
            setError('Password must contain at least one number.');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }
        if (!termsAccepted) {
            setError('Please accept the Terms of Service and Privacy Policy to continue.');
            return false;
        }
        return true;
    };

    // Step 1 -> 2: Send Email OTP
    const handleSendEmailOTP = async () => {
        setError('');
        setSuccess('');

        if (!validateStep1()) return;

        setLoading(true);
        try {
            const result = await sendOTPEmail(formData.email, formData.fullName);
            if (result.success) {
                setStep(2);
                setVerificationType('email');
                setOtp(['', '', '', '', '', '']); // Clear OTP input
                setSuccess('Verification code sent to your email!');
                startResendTimer();
                if (result.otp) {
                    console.log('� DEV EMAIL OTP:', result.otp);
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to send email verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2 -> 3: Verify Email OTP
    const handleVerifyEmailOTP = () => {
        setError('');
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit code.');
            return;
        }

        const verifyResult = verifyEmailOTP(formData.email, otpString);
        if (verifyResult.success) {
            setSuccess('Email verified! Now please enter your phone number.');
            setStep(3); // Move to Phone Input
            setVerificationType(null);
            setOtp(['', '', '', '', '', '']); // Clear for next step
        } else {
            setError(verifyResult.message);
        }
    };

    // Step 3 -> 4: Send Phone OTP
    const handleSendPhoneOTP = async () => {
        setError('');
        setSuccess('');

        if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
            setError('Please enter a valid phone number.');
            return;
        }

        setLoading(true);
        try {
            const result = await sendOTPSMS(formData.phoneNumber);
            if (result.success) {
                setStep(4);
                setVerificationType('phone');
                setOtp(['', '', '', '']); // 4 digit OTP for phone
                setSuccess('Verification code sent to your phone!');
                startResendTimer();
                if (result.otp) console.log('📱 DEV PHONE OTP:', result.otp);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to send phone verification code.');
        } finally {
            setLoading(false);
        }
    };

    // Step 4: Verify Phone and Register
    const handleVerifyPhoneAndRegister = async () => {
        setError('');
        const otpString = otp.join('');
        if (otpString.length !== 4) {
            setError('Please enter the complete 4-digit code.');
            return;
        }

        setLoading(true);
        try {
            // Verify Phone OTP
            const verifyResult = await verifyPhoneOTP(formData.phoneNumber, otpString);
            if (!verifyResult.success) {
                setError(verifyResult.message);
                return;
            }

            // All Verified - Create Account
            await signup(formData.email, formData.password, formData.fullName, formData.phoneNumber);

            setSuccess('Account created successfully! Redirecting...');
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            console.error('Registration error:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists.');
            } else {
                setError('Failed to create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;
        setError('');
        setLoading(true);

        try {
            if (verificationType === 'email') {
                clearEmailOTP(formData.email);
                const result = await sendOTPEmail(formData.email, formData.fullName);
                if (result.success) {
                    setSuccess('New email code sent!');
                    startResendTimer();
                    if (result.otp) console.log('📧 DEV EMAIL OTP:', result.otp);
                } else setError(result.message);
            } else if (verificationType === 'phone') {
                clearPhoneOTP(formData.phoneNumber);
                const result = await sendOTPSMS(formData.phoneNumber);
                if (result.success) {
                    setSuccess('New phone code sent!');
                    setOtp(['', '', '', '']); // Reset to 4
                    startResendTimer();
                    if (result.otp) console.log('📱 DEV PHONE OTP:', result.otp);
                } else setError(result.message);
            }
        } catch (err) {
            setError('Failed to resend code.');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = () => {
        const password = formData.password;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

    const getStepTitle = () => {
        switch (step) {
            case 1: return 'Create Account';
            case 2: return 'Verify Email';
            case 3: return 'Add Phone';
            case 4: return 'Verify Phone';
            default: return 'Create Account';
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 1: return 'Join the Tickify community today.';
            case 2: return `Enter code sent to ${formData.email}`;
            case 3: return 'Secure your account with phone verification.';
            case 4: return `Enter code sent to ${formData.phoneNumber}`;
            default: return '';
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center py-12 px-4 relative overflow-hidden transition-colors duration-300">
            {/* Background Decorations */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-[var(--color-accent-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-[var(--color-accent-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1.5s' }}></div>

            <div className="max-w-md w-full relative z-10">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block hover:rotate-6 transition-transform duration-300">
                        <div className="w-20 h-20 border-4 border-[var(--color-text-primary)] bg-[var(--color-accent-secondary)] flex items-center justify-center text-white font-black text-4xl shadow-[8px_8px_0_var(--color-text-primary)] mb-6 mx-auto transform hover:shadow-[12px_12px_0_var(--color-text-primary)] transition-all">
                            T
                        </div>
                    </Link>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter mb-2">
                        {getStepTitle()}
                    </h1>
                    <p className="text-[var(--color-text-secondary)] font-bold">
                        {getStepDescription()}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3, 4].map((s) => (
                        <React.Fragment key={s}>
                            <div className={`w-8 h-8 border-2 font-black flex items-center justify-center text-sm transition-all ${step >= s ? 'bg-[var(--color-accent-primary)] text-white border-[var(--color-text-primary)]' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border-[var(--color-text-muted)]'}`}>
                                {step > s ? '✓' : s}
                            </div>
                            {s < 4 && <div className={`w-4 h-0.5 ${step > s ? 'bg-[var(--color-accent-primary)]' : 'bg-[var(--color-text-muted)] opacity-30'}`}></div>}
                        </React.Fragment>
                    ))}
                </div>

                {/* Registration Card */}
                <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-text-primary)] shadow-[12px_12px_0_var(--color-text-primary)] relative">
                    {/* Decorative Elements */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-[var(--color-success)] border-2 border-[var(--color-text-primary)] rotate-45"></div>
                    <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-[var(--color-accent-secondary)] border-2 border-[var(--color-text-primary)] -rotate-12"></div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-2 border-[var(--color-error)] text-[var(--color-error)] font-bold text-sm">
                            <span className="mr-2">⚠️</span>{error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border-2 border-[var(--color-success)] text-[var(--color-success)] font-bold text-sm">
                            <span className="mr-2">✅</span>{success}
                        </div>
                    )}

                    {step === 1 && (
                        /* Step 1: User Information (No Phone) */
                        <div className="space-y-5">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-[var(--color-text-secondary)] tracking-widest">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)] rounded-none px-4 py-3 font-bold focus:border-[var(--color-accent-primary)] focus:shadow-[4px_4px_0_var(--color-accent-primary)] focus:outline-none transition-all placeholder-[var(--color-text-muted)]"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-[var(--color-text-secondary)] tracking-widest">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)] rounded-none px-4 py-3 font-bold focus:border-[var(--color-accent-primary)] focus:shadow-[4px_4px_0_var(--color-accent-primary)] focus:outline-none transition-all placeholder-[var(--color-text-muted)]"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-[var(--color-text-secondary)] tracking-widest">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="••••••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)] rounded-none px-4 py-3 pr-12 font-bold focus:border-[var(--color-accent-primary)] focus:shadow-[4px_4px_0_var(--color-accent-primary)] focus:outline-none transition-all placeholder-[var(--color-text-muted)]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-xl"
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {/* Password Strength */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[0, 1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1.5 flex-1 transition-all ${i < getPasswordStrength() ? strengthColors[getPasswordStrength() - 1] : 'bg-[var(--color-text-muted)] opacity-20'}`}
                                                ></div>
                                            ))}
                                        </div>
                                        <p className="text-xs font-bold text-[var(--color-text-muted)]">
                                            Strength: {formData.password ? strengthLabels[getPasswordStrength() - 1] || 'Very Weak' : ''}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-[var(--color-text-secondary)] tracking-widest">
                                    Confirm Password
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="••••••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)] rounded-none px-4 py-3 font-bold focus:border-[var(--color-accent-primary)] focus:shadow-[4px_4px_0_var(--color-accent-primary)] focus:outline-none transition-all placeholder-[var(--color-text-muted)]"
                                />
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="text-xs font-bold text-[var(--color-error)]">Passwords don't match</p>
                                )}
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="w-5 h-5 border-2 border-[var(--color-text-primary)] rounded-none accent-[var(--color-accent-primary)] mt-0.5 cursor-pointer"
                                />
                                <label htmlFor="terms" className="text-sm font-bold text-[var(--color-text-secondary)] cursor-pointer">
                                    I agree to the{' '}
                                    <Link to="/terms" className="text-[var(--color-accent-primary)] hover:underline">Terms of Service</Link>
                                    {' '}and{' '}
                                    <Link to="/privacy" className="text-[var(--color-accent-primary)] hover:underline">Privacy Policy</Link>
                                    <span className="text-[var(--color-error)]"> *</span>
                                </label>
                            </div>
                            {!termsAccepted && (
                                <p className="text-xs font-bold text-[var(--color-text-muted)] -mt-2">
                                    You must accept the terms to continue
                                </p>
                            )}

                            {/* Continue Button */}
                            <button
                                onClick={handleSendEmailOTP}
                                disabled={loading}
                                className="neo-btn w-full bg-[var(--color-accent-secondary)] text-white font-black text-xl py-4 border-2 border-[var(--color-text-primary)] hover:bg-[var(--color-accent-primary)] transition-all shadow-[6px_6px_0_var(--color-text-primary)] hover:shadow-[8px_8px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        Sending Code...
                                    </>
                                ) : (
                                    <>
                                        Verify Email
                                        <span>→</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {(step === 2 || step === 4) && (
                        /* OTP Verification (Shared for Email and Phone) */
                        <div className="space-y-6">
                            {/* OTP Illustration */}
                            <div className="text-center">
                                <div className="text-6xl mb-4">{step === 2 ? '📧' : '📱'}</div>
                                <p className="text-sm text-[var(--color-text-muted)] font-medium">
                                    We sent a {step === 2 ? '6' : '4'}-digit code to<br />
                                    <span className="font-black text-[var(--color-text-primary)]">
                                        {step === 2 ? formData.email : formData.phoneNumber}
                                    </span>
                                </p>
                            </div>

                            {/* OTP Input */}
                            <div className="flex justify-center gap-2" onPaste={handlePaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-black border-3 border-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:shadow-[3px_3px_0_var(--color-accent-primary)] focus:outline-none transition-all"
                                    />
                                ))}
                            </div>

                            {/* Resend Link */}
                            <div className="text-center">
                                {resendTimer > 0 ? (
                                    <p className="text-sm font-bold text-[var(--color-text-muted)]">
                                        Resend code in <span className="text-[var(--color-accent-primary)]">{resendTimer}s</span>
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleResendOTP}
                                        disabled={loading}
                                        className="text-sm font-black text-[var(--color-accent-primary)] hover:underline uppercase disabled:opacity-50"
                                    >
                                        Resend Code
                                    </button>
                                )}
                            </div>

                            {/* Verify Button */}
                            <button
                                onClick={step === 2 ? handleVerifyEmailOTP : handleVerifyPhoneAndRegister}
                                disabled={loading || otp.join('').length !== (step === 2 ? 6 : 4)}
                                className="neo-btn w-full bg-[var(--color-success)] text-white font-black text-xl py-4 border-2 border-[var(--color-text-primary)] hover:brightness-110 transition-all shadow-[6px_6px_0_var(--color-text-primary)] hover:shadow-[8px_8px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        {step === 4 ? 'Creating Account...' : 'Verifying...'}
                                    </>
                                ) : (
                                    <>
                                        {step === 4 ? 'Complete Registration' : 'Verify & Continue'}
                                        <span>✓</span>
                                    </>
                                )}
                            </button>

                            {/* Back Button */}
                            <button
                                onClick={() => {
                                    if (step === 2) setStep(1);
                                    if (step === 4) setStep(3);
                                    setError('');
                                }}
                                disabled={loading}
                                className="w-full py-2 text-sm font-black text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] uppercase transition-colors disabled:opacity-50"
                            >
                                ← Back
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        /* Step 3: Phone Input (After Email Verification) */
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-[var(--color-text-secondary)] tracking-widest">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    placeholder="9999999999"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    maxLength="10"
                                    className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)] rounded-none px-4 py-3 font-bold focus:border-[var(--color-accent-primary)] focus:shadow-[4px_4px_0_var(--color-accent-primary)] focus:outline-none transition-all placeholder-[var(--color-text-muted)]"
                                />
                                <p className="text-xs text-[var(--color-text-muted)] font-bold">
                                    We need your phone number for secure account recovery and ticketing.
                                </p>
                            </div>

                            {/* Continue Button */}
                            <button
                                onClick={handleSendPhoneOTP}
                                disabled={loading}
                                className="neo-btn w-full bg-[var(--color-accent-secondary)] text-white font-black text-xl py-4 border-2 border-[var(--color-text-primary)] hover:bg-[var(--color-accent-primary)] transition-all shadow-[6px_6px_0_var(--color-text-primary)] hover:shadow-[8px_8px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        Sending Code...
                                    </>
                                ) : (
                                    <>
                                        Verify Phone
                                        <span>→</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Divider */}
                    {step === 1 && (
                        <>
                            <div className="my-6 flex items-center gap-4">
                                <div className="flex-1 h-0.5 bg-[var(--color-text-muted)] opacity-30"></div>
                                <span className="text-xs font-black uppercase text-[var(--color-text-muted)]">or</span>
                                <div className="flex-1 h-0.5 bg-[var(--color-text-muted)] opacity-30"></div>
                            </div>

                            {/* Google Sign Up */}
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
                        </>
                    )}

                    {/* Login Link */}
                    <div className="mt-8 pt-6 border-t-2 border-dashed border-[var(--color-text-muted)] text-center">
                        <p className="font-bold text-[var(--color-text-secondary)]">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)] underline decoration-2 decoration-[var(--color-accent-primary)]">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
