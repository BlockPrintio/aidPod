export class TransactionError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'TransactionError';
    this.code = code;
    this.details = details;
  }
}

export function handleTransactionError(error) {
  if (error.message.includes('UTxO')) {
    return 'Campaign state has changed. Please refresh and try again.';
  }
  
  if (error.message.includes('insufficient')) {
    return 'Insufficient funds in your wallet.';
  }
  
  if (error.message.includes('signature')) {
    return 'Required signature missing. Please check authorization.';
  }
  
  if (error.message.includes('validation')) {
    return 'Transaction validation failed. Please check campaign requirements.';
  }
  
  if (error.message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (error.message.includes('timeout')) {
    return 'Transaction timed out. Please try again.';
  }
  
  return error.message || 'An unknown error occurred';
}

export function formatErrorForUser(error) {
  const userFriendlyMessage = handleTransactionError(error);
  
  return {
    title: 'Transaction Failed',
    message: userFriendlyMessage,
    code: error.code || 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString()
  };
}
