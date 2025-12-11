export async function waitForTransaction(provider, txHash, maxAttempts = 20) {
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

export async function getTransactionConfirmations(provider, txHash) {
  try {
    const txInfo = await provider.fetchTxInfo(txHash);
    return txInfo.block_height ? 1 : 0; // Simplified
  } catch (e) {
    return 0;
  }
}

export async function monitorTransaction(provider, txHash, onUpdate) {
  let attempts = 0;
  const maxAttempts = 30;
  
  const checkStatus = async () => {
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
      onUpdate({
        status: 'error',
        txHash,
        confirmations: 0,
        error: error.message,
        message: 'Error monitoring transaction'
      });
    }
  };
  
  // Start monitoring
  checkStatus();
}
