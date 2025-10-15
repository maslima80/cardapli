import { parsePhoneNumber, formatIncompletePhoneNumber } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';

/**
 * Format a phone number to national format
 * @param phoneNumber Phone number in E.164 or any other format
 * @param defaultCountry Default country code to use if not specified in the number
 * @returns Formatted phone number or original string if parsing fails
 */
export function formatPhoneNumber(phoneNumber: string | undefined | null, defaultCountry: CountryCode = 'BR'): string {
  // Return empty string if phoneNumber is undefined or null
  if (phoneNumber === undefined || phoneNumber === null) return '';
  
  // Ensure phoneNumber is a string
  const phoneStr = String(phoneNumber);
  
  try {
    // Try to parse as E.164
    const parsedNumber = parsePhoneNumber(phoneStr, defaultCountry as CountryCode);
    return parsedNumber.formatNational();
  } catch (error) {
    // If parsing fails, try to format as incomplete
    try {
      return formatIncompletePhoneNumber(phoneStr, defaultCountry as CountryCode);
    } catch (e) {
      // If all formatting fails, return the original
      console.error('Error formatting phone number:', phoneNumber, e);
      return phoneStr;
    }
  }
}

/**
 * Ensure a phone number is in E.164 format
 * @param phoneNumber Phone number in any format
 * @param defaultCountry Default country code to use if not specified in the number
 * @returns E.164 formatted phone number or original string if parsing fails
 */
export function ensureE164Format(phoneNumber: string | undefined | null, defaultCountry: CountryCode = 'BR'): string {
  // Return empty string if phoneNumber is undefined or null
  if (phoneNumber === undefined || phoneNumber === null) return '';
  
  // Ensure phoneNumber is a string
  const phoneStr = String(phoneNumber);
  
  try {
    const parsedNumber = parsePhoneNumber(phoneStr, defaultCountry as CountryCode);
    return parsedNumber.format('E.164');
  } catch (error) {
    try {
      // If parsing fails, just clean non-digits and add + if missing
      const cleaned = phoneStr.replace(/\D/g, '');
      return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    } catch (e) {
      console.error('Error formatting phone number:', phoneNumber, e);
      return '';
    }
  }
}

/**
 * Obfuscate an email address for anti-bot protection
 * @param email Email address to obfuscate
 * @returns HTML entity encoded email
 */
export function obfuscateEmail(email: string): string {
  return email
    .split('')
    .map(char => `&#${char.charCodeAt(0)};`)
    .join('');
}
