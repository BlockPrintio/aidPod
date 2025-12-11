import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const TransactionHistory = ({ transactions = [] }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filterOptions = [
    { value: 'all', label: 'All Transactions' },
    { value: 'donation', label: 'Donations' },
    { value: 'refund', label: 'Refunds' },
    { value: 'withdrawal', label: 'Withdrawals' },
    { value: 'deposit', label: 'Deposits' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date (Newest)' },
    { value: 'amount', label: 'Amount (Highest)' },
    { value: 'type', label: 'Type' }
  ];

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'donation': return 'Heart';
      case 'refund': return 'RotateCcw';
      case 'withdrawal': return 'ArrowUpRight';
      case 'deposit': return 'ArrowDownLeft';
      default: return 'ArrowRightLeft';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'donation': return 'text-secondary';
      case 'refund': return 'text-warning';
      case 'withdrawal': return 'text-error';
      case 'deposit': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      completed: { color: 'text-success bg-success/10 border-success/20', label: 'Completed' },
      pending: { color: 'text-warning bg-warning/10 border-warning/20', label: 'Pending' },
      failed: { color: 'text-error bg-error/10 border-error/20', label: 'Failed' }
    };
    
    const { color, label } = config?.[status] || config?.completed;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-medical text-xs font-medium border ${color}`}>
        {label}
      </span>
    );
  };

  const filteredTransactions = transactions?.filter(tx => filter === 'all' || tx?.type === filter)?.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'amount':
          return b?.amount - a?.amount;
        case 'type':
          return a?.type?.localeCompare(b?.type);
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredTransactions?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions?.slice(startIndex, startIndex + itemsPerPage);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-4">
          <Select
            options={filterOptions}
            value={filter}
            onChange={setFilter}
            className="w-48"
          />
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            className="w-48"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
          >
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="RefreshCw"
          >
            Refresh
          </Button>
        </div>
      </div>
      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-medical p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="TrendingUp" size={16} className="text-success" />
            <span className="text-sm font-medium text-muted-foreground">Total Received</span>
          </div>
          <div className="text-xl font-bold text-foreground font-mono">
            {formatAmount(transactions?.filter(t => t?.type === 'deposit' || t?.type === 'refund')?.reduce((sum, t) => sum + t?.amount, 0))} ADA
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-medical p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="TrendingDown" size={16} className="text-error" />
            <span className="text-sm font-medium text-muted-foreground">Total Sent</span>
          </div>
          <div className="text-xl font-bold text-foreground font-mono">
            {formatAmount(transactions?.filter(t => t?.type === 'donation' || t?.type === 'withdrawal')?.reduce((sum, t) => sum + t?.amount, 0))} ADA
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-medical p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Heart" size={16} className="text-secondary" />
            <span className="text-sm font-medium text-muted-foreground">Donations Made</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            {transactions?.filter(t => t?.type === 'donation')?.length}
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-medical p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Clock" size={16} className="text-warning" />
            <span className="text-sm font-medium text-muted-foreground">Pending</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            {transactions?.filter(t => t?.status === 'pending')?.length}
          </div>
        </div>
      </div>
      {/* Transaction List */}
      <div className="bg-card border border-border rounded-medical overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
          <p className="text-sm text-muted-foreground">
            Showing {paginatedTransactions?.length} of {filteredTransactions?.length} transactions
          </p>
        </div>

        {paginatedTransactions?.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="Receipt" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">No transactions found</h4>
            <p className="text-muted-foreground">
              {filter === 'all' ? "You haven't made any transactions yet."
                : `No ${filter} transactions found.`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedTransactions?.map((transaction) => (
              <div key={transaction?.id} className="p-6 hover:bg-muted/50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-medical flex items-center justify-center bg-muted ${getTransactionColor(transaction?.type)}`}>
                      <Icon name={getTransactionIcon(transaction?.type)} size={20} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-foreground truncate">
                          {transaction?.description}
                        </h4>
                        {getStatusBadge(transaction?.status)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatDate(transaction?.timestamp)}</span>
                        {transaction?.campaignTitle && (
                          <span className="truncate">Campaign: {transaction?.campaignTitle}</span>
                        )}
                        {transaction?.txHash && (
                          <button
                            onClick={() => window.open(`https://cardanoscan.io/transaction/${transaction?.txHash}`, '_blank')}
                            className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors duration-200"
                          >
                            <Icon name="ExternalLink" size={12} />
                            <span>View on Explorer</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-mono font-semibold ${
                      transaction?.type === 'donation' || transaction?.type === 'withdrawal' 
                        ? 'text-error' :'text-success'
                    }`}>
                      {transaction?.type === 'donation' || transaction?.type === 'withdrawal' ? '-' : '+'}
                      {formatAmount(transaction?.amount)} ADA
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ≈ ${(transaction?.amount * 0.35)?.toFixed(2)} USD
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  iconName="ChevronLeft"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  iconName="ChevronRight"
                  iconPosition="right"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;