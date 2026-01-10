import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, query, getDocs, doc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';

const AdminSettlements = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchSettlements();
    }, []);

    const fetchSettlements = async () => {
        setLoading(true);
        try {
            const settlementsRef = collection(db, 'settlements');
            const q = query(settlementsRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRequests(data);
        } catch (error) {
            console.error("Error fetching settlements:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (requestId, newStatus) => {
        if (!window.confirm(`Mark this settlement as ${newStatus}?`)) return;
        setActionLoading(true);
        try {
            const docRef = doc(db, 'settlements', requestId);
            await updateDoc(docRef, {
                status: newStatus,
                updatedAt: serverTimestamp(),
                processedAt: newStatus === 'completed' ? serverTimestamp() : null
            });
            await fetchSettlements();
            alert(`Settlement updated to ${newStatus}`);
        } catch (error) {
            console.error("Error updating settlement:", error);
            alert("Failed to update settlement.");
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-200 text-yellow-900 border-yellow-900';
            case 'processing': return 'bg-blue-200 text-blue-900 border-blue-900';
            case 'completed': return 'bg-green-200 text-green-900 border-green-900';
            default: return 'bg-gray-200 text-black border-black';
        }
    };

    const pendingAmount = requests
        .filter(r => r.status === 'pending' || r.status === 'processing')
        .reduce((sum, r) => sum + (r.amount || 0), 0);

    const processedToday = requests
        .filter(r => r.status === 'completed') // Ideally filter by today's date too if needed
        .reduce((sum, r) => sum + (r.amount || 0), 0);

    return (
        <div className="min-h-screen bg-gray-100 font-mono text-sm text-black">
            {/* Header */}
            <div className="bg-black text-white p-4 border-b-4 border-gray-400 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/admin/dashboard" className="w-8 h-8 bg-gray-700 flex items-center justify-center font-black text-white border border-gray-500 hover:bg-red-600 transition-colors">&larr;</Link>
                    <span className="font-bold uppercase tracking-widest">Settlement Processing</span>
                </div>
            </div>

            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex gap-6 mb-8">
                    <div className="flex-1 bg-white border-2 border-black p-4 shadow-[4px_4px_0_black]">
                        <p className="text-xs font-bold uppercase text-gray-500">Pending Payouts</p>
                        <p className="text-2xl font-black">₹{pendingAmount.toLocaleString()}</p>
                    </div>
                    <div className="flex-1 bg-white border-2 border-black p-4 shadow-[4px_4px_0_black]">
                        <p className="text-xs font-bold uppercase text-gray-500">Total Processed</p>
                        <p className="text-2xl font-black text-green-600">₹{processedToday.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white border-4 border-black shadow-[8px_8px_0_gray] overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="text-4xl animate-spin mb-4">⚙️</div>
                            <p className="font-black uppercase text-gray-500">Loading settlements...</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 font-bold uppercase">No settlement requests found.</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-200 border-b-2 border-black text-[10px] uppercase">
                                <tr>
                                    <th className="p-4 border-r border-gray-400">Request ID</th>
                                    <th className="p-4 border-r border-gray-400">Organizer</th>
                                    <th className="p-4 border-r border-gray-400">Details</th>
                                    <th className="p-4 border-r border-gray-400">Amount</th>
                                    <th className="p-4 border-r border-gray-400">Status</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req) => (
                                    <tr key={req.id} className="border-b border-gray-300 hover:bg-yellow-50 font-bold">
                                        <td className="p-4 border-r border-gray-300 font-black text-xs">{req.id.slice(0, 8)}...</td>
                                        <td className="p-4 border-r border-gray-300">
                                            <p>{req.organizerName || 'Unknown Organizer'}</p>
                                            <p className="text-[10px] text-gray-500 font-medium">{req.organizerEmail}</p>
                                        </td>
                                        <td className="p-4 border-r border-gray-300 text-[10px]">
                                            <span className="block">{req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : 'N/A'}</span>
                                            <span className="text-gray-500">{req.bankName || req.method || 'Bank Transfer'}</span>
                                        </td>
                                        <td className="p-4 border-r border-gray-300 text-lg font-black">₹{req.amount?.toLocaleString()}</td>
                                        <td className="p-4 border-r border-gray-300">
                                            <span className={`px-2 py-1 text-[10px] border-2 uppercase ${getStatusStyle(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                {req.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'processing')}
                                                        disabled={actionLoading}
                                                        className="bg-blue-600 text-white px-3 py-1 font-black uppercase text-[10px] border-2 border-black hover:bg-blue-500 shadow-[2px_2px_0_black] disabled:opacity-50"
                                                    >
                                                        Process
                                                    </button>
                                                )}
                                                {(req.status === 'pending' || req.status === 'processing') && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'completed')}
                                                        disabled={actionLoading}
                                                        className="bg-green-600 text-white px-3 py-1 font-black uppercase text-[10px] border-2 border-black hover:bg-green-500 shadow-[2px_2px_0_black] disabled:opacity-50"
                                                    >
                                                        Mark Done
                                                    </button>
                                                )}
                                                {req.status === 'completed' && (
                                                    <span className="text-gray-400 text-[10px] uppercase font-bold">Processed ✅</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSettlements;
