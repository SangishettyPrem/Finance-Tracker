// Skeleton loading component
const ChartSkeleton = () => (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-40 mb-6 animate-pulse"></div>
        {/* Chart skeleton */}
        <div className="flex justify-center mb-8">
            <div className="w-64 h-64 rounded-full bg-gray-200 animate-pulse"></div>
        </div>

        {/* Legend skeleton */}
        <div className="grid grid-cols-2 gap-4">
            {[...Array(8)].map((_, index) => (
                <div key={index} className="flex items-center space-x-2 animate-pulse">
                    <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-5 bg-gray-200 rounded w-16 px-2 py-1"></div>
                </div>
            ))}
        </div>
    </div>
);

export default ChartSkeleton;