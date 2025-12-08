import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminUsers = () => {
    // Mock Users
    const [users] = useState([
        { id: 101, name: 'Alice Cooper', email: 'alice@example.com', role: 'user', status: 'active', joined: '2025-01-10' },
        { id: 102, name: 'Bob Dylan', email: 'bob@music.com', role: 'organizer', status: 'active', joined: '2025-02-14' },
        { id: 103, name: 'Charlie Puth', email: 'charlie@pop.com', role: 'user', status: 'suspended', joined: '2025-03-01' },
        { id: 104, name: 'Eleanor Rigby', email: 'all@lonely.com', role: 'admin', status: 'active', joined: '2024-12-25' },
    ]);

    return (
        <div className="min-h-screen bg-gray-100 font-mono text-sm text-black">
            {/* Header */}
            <div className="bg-black text-white p-4 border-b-4 border-gray-400 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/admin/dashboard" className="w-8 h-8 bg-gray-700 flex items-center justify-center font-black text-white border border-gray-500 hover:bg-red-600 transition-colors">&larr;</Link>
                    <span className="font-bold uppercase tracking-widest">User Management</span>
                </div>
                <div className="w-64 relative text-black">
                    <input type="text" placeholder="Search User DB..." className="w-full bg-white border border-gray-500 px-3 py-1 font-bold focus:bg-yellow-100 outline-none" />
                </div>
            </div>

            <div className="p-6 max-w-7xl mx-auto">
                <div className="bg-white border-4 border-black shadow-[8px_8px_0_gray] p-4">

                    {/* Toolbar */}
                    <div className="flex gap-4 mb-4 border-b-2 border-dashed border-gray-300 pb-4">
                        <button className="px-3 py-1 bg-black text-white font-black uppercase text-xs border hover:opacity-80">All Users</button>
                        <button className="px-3 py-1 bg-white text-black font-black uppercase text-xs border-2 border-black hover:bg-gray-100">Organizers Only</button>
                        <button className="px-3 py-1 bg-white text-black font-black uppercase text-xs border-2 border-black hover:bg-gray-100">Suspended</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-200 text-xs uppercase">
                                    <th className="border border-gray-400 p-2">ID</th>
                                    <th className="border border-gray-400 p-2">Name</th>
                                    <th className="border border-gray-400 p-2">Role</th>
                                    <th className="border border-gray-400 p-2">Status</th>
                                    <th className="border border-gray-400 p-2">Join Date</th>
                                    <th className="border border-gray-400 p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-blue-50">
                                        <td className="border border-gray-400 p-2 font-mono text-gray-500">#{u.id}</td>
                                        <td className="border border-gray-400 p-2 font-bold">
                                            {u.name} <br />
                                            <span className="text-xs font-normal text-gray-500">{u.email}</span>
                                        </td>
                                        <td className="border border-gray-400 p-2 uppercase text-xs font-bold">{u.role}</td>
                                        <td className="border border-gray-400 p-2">
                                            {u.status === 'active' ? (
                                                <span className="bg-green-200 text-green-900 border border-green-800 px-1 text-[10px] uppercase font-bold">Active</span>
                                            ) : (
                                                <span className="bg-red-200 text-red-900 border border-red-800 px-1 text-[10px] uppercase font-bold">Suspended</span>
                                            )}
                                        </td>
                                        <td className="border border-gray-400 p-2 text-xs">{u.joined}</td>
                                        <td className="border border-gray-400 p-2">
                                            <button className="text-[10px] font-black uppercase underline mr-2 hover:text-blue-600">Edit</button>
                                            <button className="text-[10px] font-black uppercase underline hover:text-red-600">Suspend</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
