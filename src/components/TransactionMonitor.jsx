import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const TransactionMonitor = ({
  txHash,
  onConfirmation,
  requiredConfirmations = 2
}) => {
  const [status, setStatus] = useState('pending');
  const [confirmations, setConfirmations] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!txHash) return;

    const checkStatus = async () => {
      try {
        // Simulated tx check - replace with actual blockchain query
        const response = await fetch(`YOUR_BLOCKFROST_OR_KOIOS_ENDPOINT/tx/${txHash}`);
        const data = await response.json();
        
        if (data.confirmations >= requiredConfirmations) {
          setStatus('confirmed');
          setConfirmations(data.confirmations);
          onConfirmation();
        } else if (data.confirmations > 0) {
          setStatus('confirming');
          setConfirmations(data.confirmations);
        }
      } catch (err) {
        setError(err.message);
        setStatus('error');
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [txHash, requiredConfirmations, onConfirmation]);

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Icon name="Clock" size={20} className="text-warning animate-pulse" />;
      case 'confirming':
        return <Icon name="Loader" size={20} className="text-primary animate-spin" />;
      case 'confirmed':
        return <Icon name="CheckCircle" size={20} className="text-success" />;
      case 'error':
        return <Icon name="AlertTriangle" size={20} className="text-error" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Transaction submitted, waiting for confirmation...';
      case 'confirming':
        return `Confirming transaction (${confirmations}/${requiredConfirmations} confirmations)`;
      case 'confirmed':
        return 'Transaction confirmed!';
      case 'error':
        return `Transaction failed: ${error}`;
      default:
        return '';
    }
  };

  const getProgressPercentage = () => {
    if (status === 'confirmed') return 100;
    if (status === 'error') return 0;
    return (confirmations / requiredConfirmations) * 100;
  };

  if (!txHash) return null;

  return (
    <div className="bg-card border border-border rounded-medical p-4">
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {getStatusText()}
            </span>
            <span className="text-xs text-muted-foreground">
              {status !== 'error' && `${getProgressPercentage()}%`}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                status === 'confirmed' 
                  ? 'bg-success' 
                  : status === 'error'
                  ? 'bg-error'
                  : 'bg-primary'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>

          {/* Transaction Hash */}
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Tx Hash:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {`${txHash.slice(0, 8)}...${txHash.slice(-8)}`}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(txHash)}
              className="text-xs text-primary hover:text-primary/80"
            >
              <Icon name="Copy" size={12} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded text-sm text-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default TransactionMonitor;