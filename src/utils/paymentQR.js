/**
 * Helper functions to generate QR code strings for payment methods
 */

/**
 * Generate Momo QR code string
 * Format: 2|99|{phone}|{name}|{email}|0|0|{amount}|{content}
 * @param {string} phone - Momo phone number (10 digits)
 * @param {string} name - Merchant name
 * @param {string} email - Merchant email (optional)
 * @param {number} amount - Payment amount
 * @param {string} content - Payment content/description
 * @returns {string} QR code string for Momo
 */
export const generateMomoQR = (phone, name, amount, content, email = "") => {
  // Momo phone number should be 10 digits
  const momoPhone = phone || "0987654321"; // Default phone number
  const merchantName = name || "PHONG KHAM MEDPRO";
  const merchantEmail = email || "";
  const paymentAmount = Math.round(amount || 0);
  const paymentContent = content || "";

  // Format: 2|99|{phone}|{name}|{email}|0|0|{amount}|{content}
  return `2|99|${momoPhone}|${merchantName}|${merchantEmail}|0|0|${paymentAmount}|${paymentContent}`;
};

/**
 * Generate VNPay QR code string
 * Format: VNPay uses a specific format with merchant info
 * @param {string} merchantId - VNPay merchant ID
 * @param {number} amount - Payment amount
 * @param {string} content - Payment content/description
 * @param {string} accountNumber - Bank account number (optional)
 * @returns {string} QR code string for VNPay
 */
export const generateVNPayQR = (merchantId, amount, content, accountNumber = "") => {
  const merchant = merchantId || "MEDPRO";
  const paymentAmount = Math.round(amount || 0);
  const paymentContent = content || "";
  
  // VNPay QR format: Can use simple format or full format
  // Simple format for bank transfer: bank://transfer?account={account}&amount={amount}&content={content}
  if (accountNumber) {
    return `bank://transfer?account=${accountNumber}&amount=${paymentAmount}&content=${encodeURIComponent(paymentContent)}`;
  }
  
  // Alternative format for VNPay app
  return `vnpay://payment?merchant=${merchant}&amount=${paymentAmount}&content=${encodeURIComponent(paymentContent)}`;
};

/**
 * Generate bank transfer QR code string (VietQR standard)
 * @param {string} bankCode - Bank code (e.g., VCB for Vietcombank)
 * @param {string} accountNumber - Bank account number
 * @param {string} accountName - Account holder name
 * @param {number} amount - Payment amount
 * @param {string} content - Payment content
 * @returns {string} QR code string for bank transfer
 */
export const generateBankQR = (bankCode, accountNumber, accountName, amount, content) => {
  const bank = bankCode || "VCB";
  const account = accountNumber || "0123456789";
  const name = accountName || "PHONG KHAM MEDPRO";
  const paymentAmount = Math.round(amount || 0);
  const paymentContent = content || "";

  // VietQR format
  return `00020101021238570010A00000072701270006${bank}${account.length}${account}${name.length}${name}53037045406${paymentAmount}5802VN62${paymentContent.length}${paymentContent}6304`;
};

