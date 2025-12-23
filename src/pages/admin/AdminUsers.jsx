import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sendOrganizerApprovalEmail } from '../../services/brevoService';

const AdminUsers = () => {
    // ... (existing state)
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterRole, setFilterRole] = useState('all');
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
        // ... (existing mock data)
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
                // Keep mock data only if absolutely no users returned (rare in prod)
                setUsers([]);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            // setUsers(mockUsers); // Don't fallback to mock data on error usually, but for dev it's ok
        } finally {
            setLoading(false);
        }
    };

    // Filter users - Show ALL users for Admin to manage (Users, Organizers, etc.)
    // Previous filter restricted to role !== 'user' -> changed to show everyone or add a role filter
    const filteredUsers = users.filter(user => {
        // Search
        const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        // Status Filter
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

        // Role Filter
        const matchesRole = filterRole === 'all' || user.role === filterRole;

        return matchesSearch && matchesStatus && matchesRole;
    });

    // ... (pagination logic)
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
                phone: user.phone || '' // Use phone or phoneNumber
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
            // Check if status is changing from pending to active for an organizer
            const isApproving = selectedUser.status === 'pending' && formData.status === 'active' && formData.role === 'organizer';

            const result = await updateUser(selectedUser.id, {
                displayName: formData.displayName,
                email: formData.email,
                role: formData.role,
                status: formData.status,
                phone: formData.phone
            });

            if (result.success) {
                setMessage({ type: 'success', text: 'User updated successfully!' });

                // Send approval email if condition met
                if (isApproving) {
                    await sendOrganizerApprovalEmail(formData.email, formData.displayName);
                    setMessage({ type: 'success', text: 'User updated & Approval Email Sent!' });
                }

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
        // ... (existing delete logic)
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

    // ... (keep unused functions or remove if truly unused)

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
            {/* ... (Keep existing JSX layout, just updating logic mostly) */}
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black uppercase mb-1 text-gray-600">Search Users</label>
                            <input
                                type="text"
                                placeholder="Search by name, email..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full border-2 border-black p-3 font-bold focus:bg-yellow-50 outline-none transition-colors"
                            />
                        </div>
                        {/* Role Filter */}
                        <div>
                            <label className="block text-xs font-black uppercase mb-1 text-gray-600">Role</label>
                            <select
                                value={filterRole}
                                onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
                                className="w-full border-2 border-black p-3 font-bold bg-white cursor-pointer"
                            >
                                <option value="all">All Roles</option>
                                <option value="organizer">Organizer</option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="scanner">Scanner</option>
                            </select>
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
                                        <th className="p-4 text-left font-black uppercase text-xs">Role</th>
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
                                                <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${getRoleBadge(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 text-xs font-bold uppercase border-2 ${getStatusBadge(user.status)}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="p-4 hidden md:table-cell">
                                                <span className="text-xs font-medium text-gray-600">{user.phoneNumber || user.phone || 'N/A'}</span>
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

                {/* Quick Stats - Updated for dynamic data */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-100 border-4 border-blue-600 p-4">
                        <span className="text-2xl font-black text-blue-700">{filteredUsers.length}</span>
                        <p className="text-xs font-bold uppercase text-blue-600">Total</p>
                    </div>
                    <div className="bg-purple-100 border-4 border-purple-600 p-4">
                        <span className="text-2xl font-black text-purple-700">{filteredUsers.filter(u => u.role === 'organizer').length}</span>
                        <p className="text-xs font-bold uppercase text-purple-600">Organizers</p>
                    </div>
                    <div className="bg-green-100 border-4 border-green-600 p-4">
                        <span className="text-2xl font-black text-green-700">{filteredUsers.filter(u => u.status === 'active').length}</span>
                        <p className="text-xs font-bold uppercase text-green-600">Active</p>
                    </div>
                    <div className="bg-yellow-100 border-4 border-yellow-600 p-4">
                        <span className="text-2xl font-black text-yellow-700">{filteredUsers.filter(u => u.status === 'pending').length}</span>
                        <p className="text-xs font-bold uppercase text-yellow-600">Pending</p>
                    </div>
                </div>
            </div>

            {/* Modal - Kept structure, ensured fields are correct */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black shadow-[12px_12px_0_black] max-w-lg w-full max-h-[90vh] overflow-y-auto">
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
                                    {/* ... (View mode styling similar to before) */}
                                    {/* Simplified for brevity while keeping logic */}
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
                                            <p className="font-bold">{selectedUser.phoneNumber || selectedUser.phone || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 border-2 border-gray-300">
                                            <span className="text-xs font-bold uppercase text-gray-500">Organizer Details</span>
                                            {selectedUser.organizerDetails ? (
                                                <p className="text-xs">
                                                    Type: <strong>{selectedUser.organizerDetails.organizerType}</strong><br />
                                                    Org: <strong>{selectedUser.organizerDetails.organizationName || 'N/A'}</strong><br />
                                                    Loc: <strong>{selectedUser.organizerDetails.city}, {selectedUser.organizerDetails.state}</strong>
                                                </p>
                                            ) : <p className="text-gray-400">N/A</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <button onClick={() => openModal('edit', selectedUser)} className="flex-1 py-3 bg-yellow-500 text-white font-black uppercase border-2 border-black hover:bg-yellow-400">Edit User</button>
                                        <button onClick={closeModal} className="flex-1 py-3 bg-gray-200 text-black font-black uppercase border-2 border-black hover:bg-gray-300">Close</button>
                                    </div>
                                </div>
                            )}

                            {/* Edit/Create Mode */}
                            {(modalMode === 'edit' || modalMode === 'create') && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase mb-1">Full Name</label>
                                        <input type="text" name="displayName" value={formData.displayName} onChange={handleInputChange} className="w-full border-2 border-black p-3 font-bold focus:bg-yellow-50 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase mb-1">Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={modalMode === 'edit'} className="w-full border-2 border-black p-3 font-bold focus:bg-yellow-50 outline-none disabled:bg-gray-100" />
                                    </div>
                                    {modalMode === 'create' && (
                                        <div>
                                            <label className="block text-xs font-black uppercase mb-1">Password</label>
                                            <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full border-2 border-black p-3 font-bold focus:bg-yellow-50 outline-none" />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-black uppercase mb-1">Role</label>
                                        <select name="role" value={formData.role} onChange={handleInputChange} className="w-full border-2 border-black p-3 font-bold bg-white cursor-pointer">
                                            <option value="user">User</option>
                                            <option value="organizer">Organizer</option>
                                            <option value="scanner">Scanner</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase mb-1">Status</label>
                                        <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border-2 border-black p-3 font-bold bg-white cursor-pointer">
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <button onClick={modalMode === 'create' ? handleCreateUser : handleUpdateUser} disabled={actionLoading} className="flex-1 py-3 bg-green-600 text-white font-black uppercase border-2 border-black hover:bg-green-500 disabled:opacity-50">
                                            {actionLoading ? 'Saving...' : (modalMode === 'create' ? 'Create User' : 'Save Changes')}
                                        </button>
                                        <button onClick={closeModal} disabled={actionLoading} className="flex-1 py-3 bg-gray-200 text-black font-black uppercase border-2 border-black hover:bg-gray-300">Cancel</button>
                                    </div>
                                </div>
                            )}

                            {/* Delete Mode */}
                            {modalMode === 'delete' && (
                                <div className="text-center space-y-6">
                                    <h3 className="text-xl font-black uppercase text-red-600">Confirm Deletion</h3>
                                    <p>Are you sure you want to delete <strong>{selectedUser?.displayName}</strong>?</p>
                                    <div className="flex gap-2">
                                        <button onClick={handleDeleteUser} disabled={actionLoading} className="flex-1 py-3 bg-red-600 text-white font-black uppercase border-2 border-black hover:bg-red-500 disabled:opacity-50">{actionLoading ? 'Deleting...' : 'Delete User'}</button>
                                        <button onClick={closeModal} disabled={actionLoading} className="flex-1 py-3 bg-gray-200 text-black font-black uppercase border-2 border-black hover:bg-gray-300">Cancel</button>
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
