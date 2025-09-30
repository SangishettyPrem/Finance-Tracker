const RecentTransactions = ({ loading, transactions = [] }) => {
  // Format date to YYYY-MM-DD
  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    return date.toISOString().split('T')[0];
  };

  // Format amount with proper sign and color
  const formatAmount = (amount, type) => {
    const formattedAmount = Math.abs(amount).toFixed(2);
    return type === 'income' ? `+₹${formattedAmount}` : `-₹${formattedAmount}`;
  };

  // Get color based on transaction type
  const getAmountColor = (type) => {
    return type === 'income' ? 'text-green-600' : 'text-red-500';
  };

  // Get background color for avatar
  const getAvatarBgColor = (type) => {
    return type === 'income' ? 'bg-green-100' : 'bg-red-100';
  };

  // Get icon color
  const getIconColor = (type) => {
    return type === 'income' ? 'text-green-600' : 'text-red-500';
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 sm:mb-6 text-gray-900">
            Recent Transactions
          </h2>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4 sm:mb-6 text-gray-900">
          Recent Transactions
        </h2>

        <div className="space-y-4 sm:space-y-6">
          {transactions.map((transaction, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              {/* Left side - Avatar and transaction info */}
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getAvatarBgColor(transaction.type)}`}>
                  {transaction.type === 'income' ? (
                    <svg className={`w-5 h-5 ${getIconColor(transaction.type)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  ) : (
                    <svg className={`w-5 h-5 ${getIconColor(transaction.type)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  )}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="font-medium text-gray-900 text-sm truncate">
                    {transaction.description}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(transaction.date)}
                  </div>
                </div>
              </div>

              {/* Right side - Category and amount */}
              <div className="flex flex-col items-end text-right ml-3 flex-shrink-0">
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600 mb-1 whitespace-nowrap">
                  {transaction.category}
                </span>
                <div className={`font-semibold text-sm whitespace-nowrap ${getAmountColor(transaction.type)}`}>
                  {formatAmount(transaction.amount, transaction.type)}
                </div>
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <div className="text-center py-8">
              <div className="text-sm text-gray-500">
                No recent transactions
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentTransactions;