import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const AdminSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        commissionPercent: 5.0,
        fixedFee: 50,
        taxRate: 8.0,
        payoutDelay: 3,
        maintenanceMode: false
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const docRef = doc(db, 'system_config', 'platform_settings');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setConfig(docSnap.data());
                }
            } catch (error) {
                toast.error("Error fetching configuration");
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const docRef = doc(db, 'system_config', 'platform_settings');
            await setDoc(docRef, {
                ...config,
                updatedAt: serverTimestamp()
            });
            toast.success("Configuration saved successfully! ✅");
        } catch (error) {
            toast.error("Failed to save configuration.");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : parseFloat(value) || value
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center font-mono">
                <div className="text-center">
                    <div className="text-4xl animate-spin mb-4">⚙️</div>
                    <p className="font-black uppercase">Loading Config...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 font-mono text-sm text-black">
            {/* Header */}
            <div className="bg-black text-white p-4 border-b-4 border-gray-400 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/admin/dashboard" className="w-8 h-8 bg-gray-700 flex items-center justify-center font-black text-white border border-gray-500 hover:bg-red-600 transition-colors">&larr;</Link>
                    <span className="font-bold uppercase tracking-widest">System Configuration</span>
                </div>
                {saving && <span className="text-[10px] font-black uppercase text-yellow-400 animate-pulse">Saving Changes...</span>}
            </div>

            <div className="p-6 max-w-4xl mx-auto space-y-8">

                {/* Financial Config */}
                <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_gray]">
                    <h3 className="text-xl font-black uppercase mb-6 border-b-2 border-black pb-2">Financial Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black uppercase mb-1">Platform Commission (%)</label>
                            <input
                                type="number"
                                name="commissionPercent"
                                value={config.commissionPercent}
                                onChange={handleChange}
                                className="w-full border-2 border-black p-2 font-bold focus:bg-yellow-100 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase mb-1">Fixed Fee Per Ticket (₹)</label>
                            <input
                                type="number"
                                name="fixedFee"
                                value={config.fixedFee}
                                onChange={handleChange}
                                className="w-full border-2 border-black p-2 font-bold focus:bg-yellow-100 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase mb-1">Tax Rate (%)</label>
                            <input
                                type="number"
                                name="taxRate"
                                value={config.taxRate}
                                onChange={handleChange}
                                className="w-full border-2 border-black p-2 font-bold focus:bg-yellow-100 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase mb-1">Payout Delay (Days)</label>
                            <input
                                type="number"
                                name="payoutDelay"
                                value={config.payoutDelay}
                                onChange={handleChange}
                                className="w-full border-2 border-black p-2 font-bold focus:bg-yellow-100 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* System Control */}
                <div className="bg-red-50 border-4 border-red-600 p-6 shadow-[8px_8px_0_red]">
                    <h3 className="text-xl font-black uppercase mb-6 border-b-2 border-red-600 pb-2 text-red-600">Danger Zone</h3>

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="font-bold uppercase">Maintenance Mode</h4>
                            <p className="text-xs text-red-800">Disable all user access immediately.</p>
                        </div>
                        <button
                            onClick={() => setConfig(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))}
                            className={`w-12 h-6 rounded-full border-2 border-black p-0.5 transition-colors ${config.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full border border-black shadow-sm transform transition-transform ${config.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold uppercase">Cache Flush</h4>
                            <p className="text-xs text-red-800">Clear all server-side caches.</p>
                        </div>
                        <button className="px-4 py-2 bg-white text-red-600 font-black uppercase text-xs border-2 border-red-600 hover:bg-red-600 hover:text-white transition-colors">
                            Execute Flush
                        </button>
                    </div>
                </div>

                {/* Save */}
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-black text-white font-black uppercase text-lg border-2 border-gray-500 hover:bg-green-600 hover:border-green-800 shadow-[6px_6px_0_gray] transition-all transform hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AdminSettings;
