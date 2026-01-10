// Admin Setup Utility
// Run this ONCE to create the default admin account

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Default Admin Credentials
export const DEFAULT_ADMIN = {
    email: 'admin@tickify.com',
    password: 'Admin@123456',
    displayName: 'Super Admin'
};

export const setupDefaultAdmin = async () => {
    try {
        // Create admin user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            DEFAULT_ADMIN.email,
            DEFAULT_ADMIN.password
        );
        
        const user = userCredential.user;

        // Create admin document in 'admins' collection (separate from users)
        await setDoc(doc(db, 'admins', user.uid), {
            uid: user.uid,
            email: DEFAULT_ADMIN.email,
            displayName: DEFAULT_ADMIN.displayName,
            role: 'admin',
            status: 'active',
            emailVerified: true,
            isDefaultAdmin: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        console.log('✅ Default admin account created successfully!');
        console.log('📧 Email:', DEFAULT_ADMIN.email);
        console.log('🔑 Password:', DEFAULT_ADMIN.password);
        console.log('📁 Collection: admins');
        
        return { success: true, user };
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('ℹ️ Admin account already exists.');
            return { success: true, message: 'Admin already exists' };
        }
        console.warn('❌ Error creating admin:', error);
        return { success: false, error: error.message };
    }
};

export default setupDefaultAdmin;
