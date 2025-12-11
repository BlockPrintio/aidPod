interface TransactionProvider {
  fetchTxInfo: (txHash: string) => Promise<{ block_height?: number } | null>;
}

interface TransactionUpdate {
  status: 'pending' | 'confirmed' | 'timeout' | 'error';
  txHash: string;
  confirmations: number;
  message: string;
  attempts?: number;
  error?: string;
}

export async function waitForTransaction(
  provider: TransactionProvider,
  txHash: string,
  maxAttempts: number = 20
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const txStatus = await provider.fetchTxInfo(txHash);
      if (txStatus) {
        return true;
      }
    } catch (e) {
      // Transaction not yet confirmed
    }
    
    // Wait 3 seconds before next attempt
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  return false;
}

export async function getTransactionConfirmations(
  provider: TransactionProvider,
  txHash: string
): Promise<number> {
  try {
    const txInfo = await provider.fetchTxInfo(txHash);
    return txInfo?.block_height ? 1 : 0; // Simplified
  } catch (e) {
    return 0;
  }
}

export async function monitorTransaction(
  provider: TransactionProvider,
  txHash: string,
  onUpdate: (update: TransactionUpdate) => void
): Promise<void> {
  let attempts = 0;
  const maxAttempts = 30;
  
  const checkStatus = async (): Promise<void> => {
    attempts++;
    
    try {
      const confirmed = await waitForTransaction(provider, txHash, 1);
      
      if (confirmed) {
        onUpdate({
          status: 'confirmed',
          txHash,
          confirmations: 1,
          message: 'Transaction confirmed successfully!'
        });
        return;
      }
      
      if (attempts >= maxAttempts) {
        onUpdate({
          status: 'timeout',
          txHash,
          confirmations: 0,
          message: 'Transaction confirmation timed out. Please check manually.'
        });
        return;
      }
      
      onUpdate({
        status: 'pending',
        txHash,
        confirmations: 0,
        attempts,
        message: `Waiting for confirmation... (${attempts}/${maxAttempts})`
      });
      
      // Continue monitoring
      setTimeout(checkStatus, 3000);
      
    } catch (error) {
      const err = error as Error;
      onUpdate({
        status: 'error',
        txHash,
        confirmations: 0,
        error: err.message,
        message: 'Error monitoring transaction'
      });
    }
  };
  
  // Start monitoring
  checkStatus();
}

