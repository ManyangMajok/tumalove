// src/utils/formatters.ts

/**
 * Formats a Kenyan phone number to the 2547XX... format required by Daraja.
 * Handles: 07XX, +2547XX, 2547XX, and 7XX inputs.
 */
export const formatPhoneNumber = (phone: string): string => {
    // 1. Remove all non-numeric characters (spaces, dashes, plus signs)
    let cleaned = phone.replace(/\D/g, ''); 
  
    // 2. Handle 07... or 01... (Standard local format)
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    } 
    
    // 3. Handle 254... (Already correct format)
    if (cleaned.startsWith('254')) {
      return cleaned;
    }
  
    // 4. Handle 7... or 1... (Missing prefix)
    if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('1'))) {
      return '254' + cleaned;
    }
  
    // Return original if we can't figure it out (Validator will catch it)
    return cleaned;
  };