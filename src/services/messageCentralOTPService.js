// Message Central Service for OTP Verification
// API Documentation: https://cpaas.messagecentral.com/
import toast from 'react-hot-toast';

const CUSTOMER_ID = import.meta.env.VITE_MSG_CENTRAL_CUSTOMER_ID;
const AUTH_TOKEN = import.meta.env.VITE_MSG_CENTRAL_AUTH_TOKEN;
const BASE_URL = 'https://cpaas.messagecentral.com/verification/v3';

// Store verificationId temporarily
const verificationStore = new Map();

/**
 * Send OTP SMS via Message Central API (Send OTP Flow)
 * @param {string} phoneNumber - Recipient phone number (10 digits)
 * @returns {Promise<{success: boolean, message: string, otp?: string}>}
 */
export const sendOTPSMS = async (phoneNumber) => {
    // Debug Trace
    console.log('--- OTP Service Debug ---');
    console.log('Customer ID Loaded:', !!CUSTOMER_ID);
    console.log('Auth Token Loaded:', !!AUTH_TOKEN);
    console.log('Phone:', phoneNumber);
    // console.log('Auth Token:', AUTH_TOKEN); // Inspect this locally if needed, do not commit
    
    if (!CUSTOMER_ID || !AUTH_TOKEN) {
        console.error('Missing Message Central credentials in .env');
        return { success: false, message: 'Configuration error: Missing SMS credentials.' };
    }

    try {
        const url = `${BASE_URL}/send?countryCode=91&customerId=${CUSTOMER_ID}&flowType=SMS&mobileNumber=${phoneNumber}`;
        
        console.log('Sending OTP to:', phoneNumber);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'authToken': AUTH_TOKEN
            }
        });

        const responseText = await response.text();
        console.log('Message Central Response:', response.status, responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            return { 
                success: false, 
                message: `Server returned ${response.status}: ${responseText.substring(0, 100)}` 
            };
        }

        if (response.ok && data.responseCode === 200 && data.message === 'SUCCESS') {
            // Store verificationId for the subsequent validation step
            verificationStore.set(phoneNumber, data.data.verificationId);
            return { success: true, message: 'OTP sent successfully' };
        } else {
            return { success: false, message: data.message || data.errorMessage || 'Failed to send OTP' };
        }
    } catch (error) {
        toast.error('Error sending OTP');
        return { success: false, message: 'Network error. Please try again.' };
    }
};

/**
 * Verify OTP (Validate OTP Flow - Server-side check)
 * @param {string} phoneNumber - Phone number
 * @param {string} inputOtp - OTP entered by user
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const verifyOTP = async (phoneNumber, inputOtp) => {
    const verificationId = verificationStore.get(phoneNumber);
    
    if (!verificationId) {
        return { success: false, message: 'Verification session expired. Please request a new OTP.' };
    }

    try {
        const url = `${BASE_URL}/validateOtp?countryCode=91&mobileNumber=${phoneNumber}&verificationId=${verificationId}&customerId=${CUSTOMER_ID}&code=${inputOtp}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'authToken': AUTH_TOKEN
            }
        });

        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            return { success: false, message: 'Invalid server response during verification.' };
        }

        if (response.ok && data.responseCode === 200 && data.data.verificationStatus === 'VERIFICATION_COMPLETED') {
            verificationStore.delete(phoneNumber);
            return { success: true, message: 'Phone verified successfully!' };
        } else {
            return { success: false, message: 'Invalid OTP. Please try again.' };
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return { success: false, message: 'Verification failed. Please try again.' };
    }
};

/**
 * Clear OTP session
 * @param {string} phoneNumber 
 */
export const clearOTP = (phoneNumber) => {
    verificationStore.delete(phoneNumber);
};

export default {
    sendOTPSMS,
    verifyOTP,
    clearOTP
};
