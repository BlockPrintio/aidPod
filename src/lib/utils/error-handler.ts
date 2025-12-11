export class TransactionError extends Error {
  code?: string;
  details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'TransactionError';
    this.code = code;
    this.details = details;
  }
}

export function handleTransactionError(error: Error | TransactionError): string {
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

interface FormattedError {
  title: string;
  message: string;
  code: string;
  timestamp: string;
}

export function formatErrorForUser(error: Error | TransactionError): FormattedError {
  const userFriendlyMessage = handleTransactionError(error);
  
  return {
    title: 'Transaction Failed',
    message: userFriendlyMessage,
    code: error instanceof TransactionError && error.code ? error.code : 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString()
  };
}

