import React from 'react';
import { Link } from 'react-router-dom';

const AdminSettlements = () => {
    // Mock Settlements
    const requests = [
        { id: 'REQ-102', organizer: 'Electric Dreams Co.', amount: '$12,450.00', date: 'Dec 08, 2025', status: 'pending', method: 'Bank Transfer' },
        { id: 'REQ-101', organizer: 'Innovate Hub', amount: '$4,200.00', date: 'Dec 07, 2025', status: 'processing', method: 'PayPal' },
        { id: 'REQ-099', organizer: 'Art Collective', amount: '$850.00', date: 'Dec 05, 2025', status: 'completed', method: 'Bank Transfer' },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-200 text-yellow-900 border-yellow-900';
            case 'processing': return 'bg-blue-200 text-blue-900 border-blue-900';
            case 'completed': return 'bg-green-200 text-green-900 border-green-900';
            default: return 'bg-gray-200 text-black border-black';
        }
    };

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
                        <p className="text-2xl font-black">$16,650.00</p>
                    </div>
                    <div className="flex-1 bg-white border-2 border-black p-4 shadow-[4px_4px_0_black]">
                        <p className="text-xs font-bold uppercase text-gray-500">Processed Today</p>
                        <p className="text-2xl font-black text-green-600">$8,200.00</p>
                    </div>
                </div>

                <div className="bg-white border-4 border-black shadow-[8px_8px_0_gray] overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-200 border-b-2 border-black text-xs uppercase">
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
                            {requests.map((req, i) => (
                                <tr key={req.id} className="border-b border-gray-300 hover:bg-yellow-50 font-bold">
                                    <td className="p-4 border-r border-gray-300 font-black">{req.id}</td>
                                    <td className="p-4 border-r border-gray-300">{req.organizer}</td>
                                    <td className="p-4 border-r border-gray-300 text-xs">
                                        <span className="block">{req.date}</span>
                                        <span className="text-gray-500">{req.method}</span>
                                    </td>
                                    <td className="p-4 border-r border-gray-300 text-lg font-black">{req.amount}</td>
                                    <td className="p-4 border-r border-gray-300">
                                        <span className={`px-2 py-1 text-xs border uppercase ${getStatusStyle(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {req.status === 'pending' && (
                                            <button className="bg-blue-600 text-white px-3 py-1 font-black uppercase text-xs border border-black hover:bg-blue-500 shadow-[2px_2px_0_black]">
                                                Process
                                            </button>
                                        )}
                                        {req.status === 'processing' && (
                                            <button className="bg-green-600 text-white px-3 py-1 font-black uppercase text-xs border border-black hover:bg-green-500 shadow-[2px_2px_0_black]">
                                                Mark Done
                                            </button>
                                        )}
                                        {req.status === 'completed' && (
                                            <span className="text-gray-400 text-xs uppercase font-bold">Archived</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminSettlements;
