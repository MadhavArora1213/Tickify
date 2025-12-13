import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sign up with email and password
    const signup = async (email, password, displayName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with display name
        await updateProfile(user, { displayName });

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            role: 'user',
            status: 'active',
            emailVerified: true, // Assuming OTP verification was done
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return user;
    };

    // Sign in with email and password
    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    };

    // Admin login - uses separate 'admins' collection
    const adminLogin = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if user exists in 'admins' collection
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists() && adminDoc.data().role === 'admin') {
            setUserRole('admin');
            return user;
        } else {
            await signOut(auth);
            throw new Error('Access denied. Admin privileges required.');
        }
    };

    // Sign out
    const logout = async () => {
        await signOut(auth);
        setCurrentUser(null);
        setUserRole(null);
    };

    // Google Sign In
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user document exists
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists()) {
            // Create user document for new Google users
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                role: 'user',
                status: 'active',
                emailVerified: true,
                provider: 'google',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        } else {
            // Update last login
            await updateDoc(doc(db, 'users', user.uid), {
                lastLogin: serverTimestamp(),
                photoURL: user.photoURL || userDoc.data().photoURL || ''
            });
        }

        return user;
    };

    // Get user role - checks both admins and users collections
    const getUserRole = async (uid) => {
        try {
            // First check if user is an admin
            const adminDoc = await getDoc(doc(db, 'admins', uid));
            if (adminDoc.exists()) {
                return 'admin';
            }

            // Then check users collection
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return userDoc.data().role || 'user';
            }

            return 'user';
        } catch (error) {
            console.error('Error getting user role:', error);
            return 'user';
        }
    };

    // Get all users (admin only)
    const getAllUsers = async () => {
        try {
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    };

    // Update user (admin only)
    const updateUser = async (userId, userData) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                ...userData,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, error: error.message };
        }
    };

    // Delete user (admin only)
    const deleteUser = async (userId) => {
        try {
            await deleteDoc(doc(db, 'users', userId));
            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            return { success: false, error: error.message };
        }
    };

    // Create user (admin only)
    const createUser = async (userData) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                userData.email,
                userData.password
            );
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: userData.email,
                displayName: userData.displayName || '',
                role: userData.role || 'user',
                status: userData.status || 'active',
                phone: userData.phone || '',
                emailVerified: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return { success: true, user };
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, error: error.message };
        }
    };

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const role = await getUserRole(user.uid);
                setUserRole(role);
            } else {
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Get all admins
    const getAllAdmins = async () => {
        try {
            const adminsRef = collection(db, 'admins');
            const snapshot = await getDocs(adminsRef);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting admins:', error);
            return [];
        }
    };

    const value = {
        currentUser,
        userRole,
        loading,
        signup,
        login,
        adminLogin,
        logout,
        signInWithGoogle,
        getAllUsers,
        getAllAdmins,
        updateUser,
        deleteUser,
        createUser,
        getUserRole
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
