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
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userStatus, setUserStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sign up with email and password
    const signup = async (email, password, displayName, phoneNumber) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with display name
        await updateProfile(user, { displayName });

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            phoneNumber: phoneNumber || '',
            role: 'user',
            status: 'active',
            emailVerified: true, // Phone verified via OTP
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return user;
    };

    // Register as Organizer
    const registerOrganizer = async (email, password, displayName, phoneNumber, organizerDetails) => {
        // Check if organizer already exists in Firestore (organizers collection)
        const organizersRef = collection(db, 'organizers');
        const q = query(organizersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            throw new Error('An organizer account with this email already exists.');
        }

        try {
            // Create auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update profile
            await updateProfile(user, { displayName });

            // Prepare data to save in 'organizers' collection
            const organizerData = {
                uid: user.uid,
                email: user.email,
                displayName: displayName,
                phoneNumber: phoneNumber || '',
                role: 'organizer',
                status: 'pending', // Pending approval
                emailVerified: true,
                organizerDetails: organizerDetails,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Create organizer document in 'organizers' collection
            await setDoc(doc(db, 'organizers', user.uid), organizerData);

            return user;
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('This email is already in use. Please use a different email.');
            } else {
                throw error;
            }
        }
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

    // Get user role - checks admins, organizers, and users collections
    const getUserRole = async (uid) => {
        try {
            // First check if user is an admin
            const adminDoc = await getDoc(doc(db, 'admins', uid));
            if (adminDoc.exists()) {
                return 'admin';
            }

            // Check if user is an organizer
            const organizerDoc = await getDoc(doc(db, 'organizers', uid));
            if (organizerDoc.exists()) {
                return organizerDoc.data().role || 'organizer';
            }

            // Then check users collection
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return userDoc.data().role || 'user';
            }

            return 'user';
        } catch (error) {
            toast.error('Error getting user role');
            return 'user';
        }
    };

    // Get all users (admin only) - fetches from both users and organizers
    const getAllUsers = async () => {
        try {
            const usersRef = collection(db, 'users');
            const organizersRef = collection(db, 'organizers');

            const [usersSnapshot, organizersSnapshot] = await Promise.all([
                getDocs(usersRef),
                getDocs(organizersRef)
            ]);

            const users = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const organizers = organizersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return [...users, ...organizers];
        } catch (error) {
            toast.error('Error getting users');
            return [];
        }
    };

    // Update user (admin only) - handles both collections
    const updateUser = async (userId, userData) => {
        try {
            // Check users collection first
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                await updateDoc(userRef, {
                    ...userData,
                    updatedAt: serverTimestamp()
                });
                return { success: true };
            }

            // Check organizers collection
            const orgRef = doc(db, 'organizers', userId);
            const orgSnap = await getDoc(orgRef);

            if (orgSnap.exists()) {
                await updateDoc(orgRef, {
                    ...userData,
                    updatedAt: serverTimestamp()
                });
                return { success: true };
            }

            return { success: false, error: 'User not found in either collection' };
        } catch (error) {
            toast.error('Error updating user');
            return { success: false, error: error.message };
        }
    };

    // Delete user (admin only) - handles both collections
    const deleteUser = async (userId) => {
        try {
            // Try deleting from users
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                await deleteDoc(userRef);
                return { success: true };
            }

            // Try deleting from organizers
            const orgRef = doc(db, 'organizers', userId);
            const orgSnap = await getDoc(orgRef);
            if (orgSnap.exists()) {
                await deleteDoc(orgRef);
                return { success: true };
            }

            return { success: false, error: 'User not found' };
        } catch (error) {
            toast.error('Error deleting user');
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

            const collectionName = userData.role === 'organizer' ? 'organizers' : 'users';

            await setDoc(doc(db, collectionName, user.uid), {
                uid: user.uid,
                email: userData.email,
                displayName: userData.displayName || '',
                role: userData.role || 'user',
                status: userData.status || 'active',
                phone: userData.phone || '', // Unified field name maybe? legacy was 'phone' here but 'phoneNumber' elsewhere. Keeping 'phone' as per original code here.
                emailVerified: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return { success: true, user };
        } catch (error) {
            toast.error('Error creating user');
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

                // Get status as well
                let status = 'active';
                const adminDoc = await getDoc(doc(db, 'admins', user.uid));
                if (!adminDoc.exists()) {
                    const orgDoc = await getDoc(doc(db, 'organizers', user.uid));
                    if (orgDoc.exists()) {
                        status = orgDoc.data().status;
                    } else {
                        const userDoc = await getDoc(doc(db, 'users', user.uid));
                        if (userDoc.exists()) {
                            status = userDoc.data().status;
                        }
                    }
                }
                setUserStatus(status);
            } else {
                setUserRole(null);
                setUserStatus(null);
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
            toast.error('Error getting admins');
            return [];
        }
    };

    // Manual login for Phone OTP (Session only, not persisted on refresh unless using LocalStorage)
    const manualLogin = async (user) => {
        setCurrentUser(user);
        const role = await getUserRole(user.uid);
        setUserRole(role);
        return user;
    };

    const value = {
        currentUser,
        userRole,
        userStatus,
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
        getUserRole,
        manualLogin,
        registerOrganizer
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
