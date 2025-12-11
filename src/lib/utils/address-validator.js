/**
 * Cardano Address Validation Utilities
 */

// Bech32 character set
const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

/**
 * Validate if a string is a valid Cardano address
 * @param {string} address - The address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidCardanoAddress(address) {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Check for mainnet or testnet prefix
  const validPrefixes = ['addr1', 'addr_test1'];
  const hasValidPrefix = validPrefixes.some(prefix => address.startsWith(prefix));
  
  if (!hasValidPrefix) {
    return false;
  }

  // Basic length check (Cardano addresses are typically 103 characters)
  if (address.length < 50 || address.length > 120) {
    return false;
  }

  // Check if all characters are valid bech32 characters
  const addressBody = address.slice(address.indexOf('1') + 1);
  for (const char of addressBody) {
    if (!BECH32_CHARSET.includes(char)) {
      return false;
    }
  }

  return true;
}

/**
 * Generate a sample testnet address for testing
 * @returns {string} - A valid testnet address format
 */
export function generateSampleTestnetAddress() {
  return 'addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj0vs2qd4a8cpvkqtqgq6pqw5a';
}

/**
 * Validate campaign addresses
 * @param {Object} campaignData - Campaign data with addresses
 * @returns {Object} - Validation result with errors
 */
export function validateCampaignAddresses(campaignData) {
  const errors = {};

  if (campaignData.creator && !isValidCardanoAddress(campaignData.creator)) {
    errors.creator = 'Invalid creator address format';
  }

  if (campaignData.beneficiary && !isValidCardanoAddress(campaignData.beneficiary)) {
    errors.beneficiary = 'Invalid beneficiary address format';
  }

  if (campaignData.medicalAuthority && !isValidCardanoAddress(campaignData.medicalAuthority)) {
    errors.medicalAuthority = 'Invalid medical authority address format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Format address for display (truncate middle)
 * @param {string} address - Full address
 * @param {number} startChars - Characters to show at start
 * @param {number} endChars - Characters to show at end
 * @returns {string} - Formatted address
 */
export function formatAddressForDisplay(address, startChars = 8, endChars = 8) {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
