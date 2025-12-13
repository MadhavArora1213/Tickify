import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // view, edit, create, delete
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        role: 'user',
        status: 'active',
        phone: ''
    });
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    const { getAllUsers, updateUser, deleteUser, createUser } = useAuth();

    // Mock data for initial display (replace with Firebase data)
    const mockUsers = [
        { id: '1', displayName: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', createdAt: { toDate: () => new Date('2024-01-15') }, phone: '+1234567890' },
        { id: '2', displayName: 'Jane Smith', email: 'jane@example.com', role: 'organizer', status: 'active', createdAt: { toDate: () => new Date('2024-02-20') }, phone: '+1234567891' },
        { id: '3', displayName: 'Bob Wilson', email: 'bob@example.com', role: 'user', status: 'suspended', createdAt: { toDate: () => new Date('2024-03-10') }, phone: '+1234567892' },
        { id: '4', displayName: 'Alice Brown', email: 'alice@example.com', role: 'admin', status: 'active', createdAt: { toDate: () => new Date('2023-12-01') }, phone: '+1234567893' },
        { id: '5', displayName: 'Charlie Davis', email: 'charlie@example.com', role: 'user', status: 'pending', createdAt: { toDate: () => new Date('2024-04-05') }, phone: '+1234567894' },
        { id: '6', displayName: 'Eva Martinez', email: 'eva@example.com', role: 'organizer', status: 'active', createdAt: { toDate: () => new Date('2024-01-28') }, phone: '+1234567895' },
        { id: '7', displayName: 'Frank Johnson', email: 'frank@example.com', role: 'user', status: 'active', createdAt: { toDate: () => new Date('2024-02-14') }, phone: '+1234567896' },
        { id: '8', displayName: 'Grace Lee', email: 'grace@example.com', role: 'user', status: 'suspended', createdAt: { toDate: () => new Date('2024-03-22') }, phone: '+1234567897' },
    ];

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const fetchedUsers = await getAllUsers();
            if (fetchedUsers.length > 0) {
                setUsers(fetchedUsers);
            } else {
                // Use mock data if no users in Firebase
                setUsers(mockUsers);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            setUsers(mockUsers);
        } finally {
            setLoading(false);
        }
    };

    // Filter users - Only show users with role 'user' (not admin, organizer, scanner)
    const filteredUsers = users.filter(user => {
        // Only include regular users
        if (user.role && user.role !== 'user') return false;

        const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    const openModal = (mode, user = null) => {
        setModalMode(mode);
        setSelectedUser(user);
        if (mode === 'edit' && user) {
            setFormData({
                displayName: user.displayName || '',
                email: user.email || '',
                password: '',
                role: user.role || 'user',
                status: user.status || 'active',
                phone: user.phone || ''
            });
        } else if (mode === 'create') {
            setFormData({
                displayName: '',
                email: '',
                password: '',
                role: 'user',
                status: 'active',
                phone: ''
            });
        }
        setShowModal(true);
        setMessage({ type: '', text: '' });
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setMessage({ type: '', text: '' });
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateUser = async () => {
        if (!formData.displayName || !formData.email || !formData.password) {
            setMessage({ type: 'error', text: 'Please fill in all required fields.' });
            return;
        }

        setActionLoading(true);
        try {
            const result = await createUser(formData);
            if (result.success) {
                setMessage({ type: 'success', text: 'User created successfully!' });
                await loadUsers();
                setTimeout(closeModal, 1500);
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to create user.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateUser = async () => {
        if (!formData.displayName || !formData.email) {
            setMessage({ type: 'error', text: 'Please fill in all required fields.' });
            return;
        }

        setActionLoading(true);
        try {
            const result = await updateUser(selectedUser.id, {
                displayName: formData.displayName,
                email: formData.email,
                role: formData.role,
                status: formData.status,
                phone: formData.phone
            });
            if (result.success) {
                setMessage({ type: 'success', text: 'User updated successfully!' });
                await loadUsers();
                setTimeout(closeModal, 1500);
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to update user.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        setActionLoading(true);
        try {
            const result = await deleteUser(selectedUser.id);
            if (result.success) {
                setMessage({ type: 'success', text: 'User deleted successfully!' });
                await loadUsers();
                setTimeout(closeModal, 1500);
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to delete user.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleQuickStatusChange = async (userId, newStatus) => {
        try {
            await updateUser(userId, { status: newStatus });
            await loadUsers();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getRoleBadge = (role) => {
        const styles = {
            admin: 'bg-red-600 text-white',
            organizer: 'bg-purple-600 text-white',
            user: 'bg-blue-600 text-white',
            scanner: 'bg-orange-600 text-white'
        };
        return styles[role] || styles.user;
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-800 border-green-500',
            suspended: 'bg-red-100 text-red-800 border-red-500',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-500'
        };
        return styles[status] || styles.pending;
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-100 font-mono text-sm text-black">
            {/* Header */}
            <div className="bg-black text-white p-4 border-b-4 border-blue-600 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/admin/dashboard" className="w-10 h-10 bg-gray-700 flex items-center justify-center font-black text-white border-2 border-gray-500 hover:bg-blue-600 transition-colors">
                        ←
                    </Link>
                    <div>
                        <span className="font-black uppercase tracking-widest text-lg">User Management</span>
                        <p className="text-xs text-gray-400">{filteredUsers.length} users found</p>
                    </div>
                </div>
                <button
                    onClick={() => openModal('create')}
                    className="px-4 py-2 bg-green-600 text-white font-black uppercase text-xs border-2 border-white hover:bg-green-500 transition-colors shadow-[3px_3px_0_white]"
                >
                    + Add User
                </button>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Filters */}
                <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0_gray]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black uppercase mb-1 text-gray-600">Search Users</label>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full border-2 border-black p-3 font-bold focus:bg-yellow-50 outline-none transition-colors"
                            />
                        </div>
                        {/* Status Filter */}
                        <div>
                            <label className="block text-xs font-black uppercase mb-1 text-gray-600">Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                                className="w-full border-2 border-black p-3 font-bold bg-white cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0_gray] overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="text-4xl animate-spin mb-4">⏳</div>
                            <p className="font-black uppercase text-gray-500">Loading users...</p>
                        </div>
                    ) : paginatedUsers.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-4xl mb-4">🔍</div>
                            <p className="font-black uppercase text-gray-500">No users found</p>
                            <p className="text-xs text-gray-400 mt-2">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-900 text-white">
                                    <tr>
                                        <th className="p-4 text-left font-black uppercase text-xs">User</th>
                                        <th className="p-4 text-left font-black uppercase text-xs">Status</th>
                                        <th className="p-4 text-left font-black uppercase text-xs hidden md:table-cell">Phone</th>
                                        <th className="p-4 text-left font-black uppercase text-xs hidden md:table-cell">Joined</th>
                                        <th className="p-4 text-right font-black uppercase text-xs">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-gray-200">
                                    {paginatedUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-200 border-2 border-black flex items-center justify-center font-black text-lg">
                                                        {user.displayName?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{user.displayName || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 text-xs font-bold uppercase border-2 ${getStatusBadge(user.status)}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="p-4 hidden md:table-cell">
                                                <span className="text-xs font-medium text-gray-600">{user.phone || 'N/A'}</span>
                                            </td>
                                            <td className="p-4 hidden md:table-cell">
                                                <span className="text-xs font-medium text-gray-600">{formatDate(user.createdAt)}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openModal('view', user)}
                                                        className="p-2 bg-blue-100 border border-blue-500 text-blue-700 hover:bg-blue-200 transition-colors"
                                                        title="View"
                                                    >
                                                        👁️
                                                    </button>
                                                    <button
                                                        onClick={() => openModal('edit', user)}
                                                        className="p-2 bg-yellow-100 border border-yellow-500 text-yellow-700 hover:bg-yellow-200 transition-colors"
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => openModal('delete', user)}
                                                        className="p-2 bg-red-100 border border-red-500 text-red-700 hover:bg-red-200 transition-colors"
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-gray-100 p-4 border-t-2 border-black flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-600">
                                Showing {((currentPage - 1) * usersPerPage) + 1} - {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 bg-white border-2 border-black font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                                >
                                    ←
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`px-3 py-1 border-2 border-black font-bold transition-colors ${currentPage === i + 1
                                            ? 'bg-black text-white'
                                            : 'bg-white hover:bg-gray-200'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 bg-white border-2 border-black font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-blue-100 border-4 border-blue-600 p-4">
                        <span className="text-2xl font-black text-blue-700">{filteredUsers.length}</span>
                        <p className="text-xs font-bold uppercase text-blue-600">Total Users</p>
                    </div>
                    <div className="bg-green-100 border-4 border-green-600 p-4">
                        <span className="text-2xl font-black text-green-700">{filteredUsers.filter(u => u.status === 'active').length}</span>
                        <p className="text-xs font-bold uppercase text-green-600">Active</p>
                    </div>
                    <div className="bg-red-100 border-4 border-red-600 p-4">
                        <span className="text-2xl font-black text-red-700">{filteredUsers.filter(u => u.status === 'suspended').length}</span>
                        <p className="text-xs font-bold uppercase text-red-600">Suspended</p>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black shadow-[12px_12px_0_black] max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0">
                            <span className="font-black uppercase tracking-wider">
                                {modalMode === 'view' && '👁️ User Details'}
                                {modalMode === 'edit' && '✏️ Edit User'}
                                {modalMode === 'create' && '➕ Create User'}
                                {modalMode === 'delete' && '🗑️ Delete User'}
                            </span>
                            <button onClick={closeModal} className="text-2xl hover:text-red-400 transition-colors">×</button>
                        </div>

                        <div className="p-6">
                            {/* Messages */}
                            {message.text && (
                                <div className={`mb-4 p-3 border-2 font-bold text-sm ${message.type === 'success'
                                    ? 'bg-green-100 border-green-500 text-green-700'
                                    : 'bg-red-100 border-red-500 text-red-700'
                                    }`}>
                                    {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                                </div>
                            )}

                            {/* View Mode */}
                            {modalMode === 'view' && selectedUser && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-gray-200 border-4 border-black flex items-center justify-center font-black text-3xl">
                                            {selectedUser.displayName?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black">{selectedUser.displayName}</h3>
                                            <p className="text-gray-600">{selectedUser.email}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 border-2 border-gray-300">
                                            <span className="text-xs font-bold uppercase text-gray-500">Role</span>
                                            <p className="font-black uppercase">{selectedUser.role}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 border-2 border-gray-300">
                                            <span className="text-xs font-bold uppercase text-gray-500">Status</span>
                                            <p className="font-black uppercase">{selectedUser.status}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 border-2 border-gray-300">
                                            <span className="text-xs font-bold uppercase text-gray-500">Phone</span>
                                            <p className="font-bold">{selectedUser.phone || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 border-2 border-gray-300">
                                            <span className="text-xs font-bold uppercase text-gray-500">Joined</span>
                                            <p className="font-bold">{formatDate(selectedUser.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <button
                                            onClick={() => openModal('edit', selectedUser)}
                                            className="flex-1 py-3 bg-yellow-500 text-white font-black uppercase border-2 border-black hover:bg-yellow-400"
                                        >
                                            Edit User
                                        </button>
                                        <button
                                            onClick={closeModal}
                                            className="flex-1 py-3 bg-gray-200 text-black font-black uppercase border-2 border-black hover:bg-gray-300"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Edit/Create Mode */}
                            {(modalMode === 'edit' || modalMode === 'create') && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            name="displayName"
                                            value={formData.displayName}
                                            onChange={handleInputChange}
                                            className="w-full border-2 border-black p-3 font-bold focus:bg-yellow-50 outline-none"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase mb-1">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={modalMode === 'edit'}
                                            className="w-full border-2 border-black p-3 font-bold focus:bg-yellow-50 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                            placeholder="user@example.com"
                                        />
                                    </div>
                                    {modalMode === 'create' && (
                                        <div>
                                            <label className="block text-xs font-black uppercase mb-1">Password *</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="w-full border-2 border-black p-3 font-bold focus:bg-yellow-50 outline-none"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-black uppercase mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full border-2 border-black p-3 font-bold focus:bg-yellow-50 outline-none"
                                            placeholder="+1234567890"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase mb-1">Status *</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full border-2 border-black p-3 font-bold bg-white cursor-pointer"
                                        >
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <button
                                            onClick={modalMode === 'create' ? handleCreateUser : handleUpdateUser}
                                            disabled={actionLoading}
                                            className="flex-1 py-3 bg-green-600 text-white font-black uppercase border-2 border-black hover:bg-green-500 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {actionLoading ? (
                                                <>⏳ Saving...</>
                                            ) : (
                                                <>{modalMode === 'create' ? 'Create User' : 'Save Changes'}</>
                                            )}
                                        </button>
                                        <button
                                            onClick={closeModal}
                                            disabled={actionLoading}
                                            className="flex-1 py-3 bg-gray-200 text-black font-black uppercase border-2 border-black hover:bg-gray-300 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Delete Mode */}
                            {modalMode === 'delete' && selectedUser && (
                                <div className="text-center space-y-6">
                                    <div className="w-20 h-20 bg-red-100 border-4 border-red-600 mx-auto flex items-center justify-center text-4xl">
                                        ⚠️
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase text-red-600 mb-2">Confirm Deletion</h3>
                                        <p className="text-gray-600">
                                            Are you sure you want to delete user <strong>{selectedUser.displayName}</strong>?
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">This action cannot be undone.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDeleteUser}
                                            disabled={actionLoading}
                                            className="flex-1 py-3 bg-red-600 text-white font-black uppercase border-2 border-black hover:bg-red-500 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {actionLoading ? '⏳ Deleting...' : '🗑️ Delete User'}
                                        </button>
                                        <button
                                            onClick={closeModal}
                                            disabled={actionLoading}
                                            className="flex-1 py-3 bg-gray-200 text-black font-black uppercase border-2 border-black hover:bg-gray-300 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
