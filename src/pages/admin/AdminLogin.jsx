import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Creds, 2: 2FA

    const handleLogin = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handleVerify = (e) => {
        e.preventDefault();
        navigate('/admin/dashboard');
    };

    return (
        <div className="min-h-screen bg-[#000080] flex items-center justify-center p-4 font-mono">
            {/* BSOD / Terminal Style Background */}
            <div className="max-w-md w-full bg-gray-200 border-4 border-white shadow-[8px_8px_0_black] p-1">
                <div className="bg-blue-800 text-white px-2 py-1 flex justify-between items-center mb-1">
                    <span className="font-bold uppercase">System_Admin_Access.exe</span>
                    <button className="w-4 h-4 bg-gray-300 border border-black text-black flex items-center justify-center text-xs">x</button>
                </div>

                <div className="p-6 border-2 border-white bg-gray-100">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-red-600 text-white mx-auto flex items-center justify-center text-3xl font-black border-4 border-black mb-4">
                            !
                        </div>
                        <h1 className="text-2xl font-black uppercase text-black">Restricted Area</h1>
                        <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Authorized Personnel Only</p>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase mb-1 text-black">Admin ID</label>
                                <input type="text" className="w-full bg-white border-2 border-black p-2 font-bold focus:bg-yellow-200 focus:outline-none transition-colors" placeholder="root" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase mb-1 text-black">Password</label>
                                <input type="password" className="w-full bg-white border-2 border-black p-2 font-bold focus:bg-yellow-200 focus:outline-none transition-colors" placeholder="••••••••" />
                            </div>
                            <button className="w-full bg-black text-white py-3 font-black uppercase border-2 border-transparent hover:bg-white hover:text-black hover:border-black shadow-[4px_4px_0_gray] transition-all">
                                Authenticate
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-4 animate-fade-in-up">
                            <div className="bg-yellow-100 border-2 border-black p-3 text-xs font-bold mb-4 text-black">
                                ⚠ 2FA Protocol Initiated. Enter temporary token.
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase mb-1 text-black">Security Token</label>
                                <input type="text" className="w-full bg-white border-2 border-black p-2 font-bold text-center tracking-[.5em] text-xl focus:bg-yellow-200 focus:outline-none" placeholder="000000" autoFocus />
                            </div>
                            <button className="w-full bg-red-600 text-white py-3 font-black uppercase border-2 border-transparent hover:bg-white hover:text-red-600 hover:border-red-600 shadow-[4px_4px_0_gray] transition-all">
                                Verify Access
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
