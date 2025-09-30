import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Minus, Calendar } from 'lucide-react';
import { allCategories } from '../constants';
import { useQuery } from '@apollo/client/react';
import { FETCH_TRANSACTIONS } from '../graphql/Queries/TransactionQuery';

// Custom hook to debounce a value
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setfilters] = useState({
    type: "all",
    category: "all"
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, loading, error } = useQuery(FETCH_TRANSACTIONS, {
    fetchPolicy: "cache-first",
    variables: {
      limit: 4,
      page,
      type: filters.type,
      category: filters.category,
      search: debouncedSearchTerm,
    }
  });

  useEffect(() => {
    document.title = "Transactions | Expenses Tracker";
  }, []);


  // Reset to page 1 when filters or search term change
  useEffect(() => {
    setPage(1);
  }, [filters.type, filters.category, debouncedSearchTerm]);

  const transactions = data?.getTransactions?.transactions ?? [];
  const summary = data?.getTransactions?.summary ?? {};
  const pagination = data?.getTransactions?.pagination;

  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Get current type display name
  const getTypeDisplayName = (value) => {
    switch (value) {
      case 'all': return 'All Types';
      case 'income': return 'Income';
      case 'expense': return 'Expense';
      default: return 'All Types';
    }
  };

  // Get current category display name
  const getCategoryDisplayName = (value) => {
    return value === 'all' ? 'All Categories' : value;
  };

  const formatAmount = (amount, type) => {
    return type === 'income' ? `$${amount?.toFixed(2)}` : `-$${amount?.toFixed(2)}`;
  };

  const formatDate = (timestamp) => {
    const isNan = Number.isNaN(Number(timestamp));
    if (!isNan) {
      const date = new Date(Number(timestamp));
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } else {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const handleCloseDropdown = () => {
    setTypeDropdownOpen(false);
    setCategoryDropdownOpen(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 w-full " onClick={handleCloseDropdown}>
      <div className="w-full">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <Search className="w-6 h-6 text-gray-600" />
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Search & Filter
            </h1>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6" onClick={(e) => e.stopPropagation()}>
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <button
                onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700 min-w-[140px] flex items-center justify-around "
              >
                <span>{getTypeDisplayName(filters.type)}</span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${typeDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Type Dropdown Menu */}
              {typeDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setfilters({
                          ...filters,
                          type: 'all'
                        });
                        setTypeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between ${filters.type === 'all' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                        }`}
                    >
                      <span>All Types</span>
                      {filters.type === 'all' && (
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setfilters({
                          ...filters,
                          type: 'income'
                        });
                        setTypeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between ${filters.type === 'income' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                        }`}
                    >
                      <span>Income</span>
                      {filters.type === 'income' && (
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setfilters({
                          ...filters,
                          type: 'expense'
                        });
                        setTypeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between ${filters.type === 'expense' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                        }`}
                    >
                      <span>Expense</span>
                      {filters.type === 'expense' && (
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center space-x-2 bg-white border border-blue-300 rounded-xl px-4 py-3 min-w-[160px] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="text-blue-600 font-medium flex-1 text-left">
                  {getCategoryDisplayName(filters.category)}
                </span>
                <svg
                  className={`w-4 h-4 text-blue-600 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {categoryDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setfilters({
                          ...filters,
                          category: 'all'
                        });
                        setCategoryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between ${filters.category === 'all' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                        }`}
                    >
                      <span>All Categories</span>
                      {filters.category === 'all' && (
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {allCategories?.map((category, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setfilters({
                            ...filters,
                            category
                          });
                          setCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between ${filters.category === category ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                          }`}
                      >
                        <span>{category}</span>
                        {filters.category === category && (
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="flex items-center text-gray-600">
              <span className="text-sm font-medium">
                Results: {pagination?.totalCount ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-200 rounded-full p-3 w-12 h-12"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              {/* Total Income */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <Plus className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Income</p>
                    <p className="text-2xl font-bold text-gray-900">₹{summary?.income?.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Total Expenses */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-red-100 rounded-full p-3">
                    <Minus className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-900">₹{summary?.expense?.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Net Balance */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Net Balance</p>
                    <p className="text-2xl font-bold text-gray-900">₹{summary?.balance?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4 sm:p-6">
                  <div className="flex items-center justify-between animate-pulse">
                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                {Array.isArray(transactions) && transactions?.map((transaction, index) => (
                  <div key={index} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      {/* Left Side - Icon and Details */}
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                          {transaction.type === 'income' ? (
                            <Plus className="w-6 h-6 text-green-600" />
                          ) : (
                            <Minus className="w-6 h-6 text-red-600" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {transaction.description}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600">
                              {transaction.category}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.type === 'income'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}>
                              {transaction.type === 'income' ? 'Income' : 'Expense'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(transaction.date)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Amount */}
                      <div className="text-right ml-4 flex-shrink-0">
                        <div className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {formatAmount(transaction.amount, transaction.type)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {!loading && transactions?.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <Search className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </>
            )}
          </div>
          {/* Pagination Controls */}
          {pagination?.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 sm:p-6 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{(page - 1) * 3 + 1}</span> to <span className="font-medium">{Math.min(page * 3, pagination.totalCount)}</span> of <span className="font-medium">{pagination.totalCount}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1 || loading}
                  className="px-3 py-2 cursor-pointer text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-700 font-medium px-2 hidden sm:inline">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages || loading}
                  className="px-3 py-2 text-sm cursor-pointer font-medium text-gray-600 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

export default Transactions;