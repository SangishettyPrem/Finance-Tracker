// Skeleton component for recent transactions
export const RecentTransactionSkeleton = () => {
    return (
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
            <div className="p-4">
                {/* Title skeleton */}
                <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>

                {/* Transaction items skeleton */}
                <div className="space-y-3">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="flex items-center justify-between py-2 animate-pulse">
                            {/* Left side - Avatar and transaction info */}
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200"></div>

                                <div className="flex flex-col space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>

                            {/* Right side - Category and amount */}
                            <div className="flex flex-col items-end space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                                <div className="h-4 bg-gray-200 rounded w-12"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};