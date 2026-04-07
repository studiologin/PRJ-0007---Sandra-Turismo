import CryptoJS from 'crypto-js';

const MASTER_KEY = import.meta.env.VITE_MASTER_KEY || 'default-fallback-key';

export const encryptValue = (value: string): string => {
  if (!value) return '';
  try {
    return CryptoJS.AES.encrypt(value, MASTER_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return value;
  }
};

export const decryptValue = (cipherText: string): string => {
  if (!cipherText) return '';
  try {
    if (!cipherText.includes('/') && !cipherText.includes('+') && cipherText.length < 20 && !cipherText.endsWith('==')) {
         return cipherText;
    }
    const bytes = CryptoJS.AES.decrypt(cipherText, MASTER_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || cipherText;
  } catch (error) {
    return cipherText;
  }
};

/**
 * Generates a security signature for requests to the Edge Function.
 * Prevents unauthorized external calls and tampering.
 */
export const generateSignature = (bookingId: string): string => {
  // Use a combination of bookingId and a timestamp or fixed salt
  const salt = 'ST_2024_PROT'; // Hardcoded internal salt
  const dataToSign = `${bookingId}:${salt}`;
  return CryptoJS.HmacSHA256(dataToSign, MASTER_KEY).toString();
};
