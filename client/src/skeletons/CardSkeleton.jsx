export const CardSkeleton = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-80 animate-pulse">
            {/* Title skeleton */}
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>

            {/* Amount skeleton */}
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>

            {/* Change/Description skeleton */}
            <div className="flex items-center space-x-2">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
        </div>
    );
};