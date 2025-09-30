import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import ChartSkeleton from '../skeletons/ChartSkeleton';
import { categoryColors } from '../constants';

const CategoryBreakdown = ({ transactions = [], loading = false }) => {
    const categoryData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];
        const categoryTotals = {};
        transactions.forEach(transaction => {
            const category = transaction.category;
            const amount = Math.abs(transaction.amount);

            if (categoryTotals[category]) {
                categoryTotals[category] += amount;
            } else {
                categoryTotals[category] = amount;
            }
        });

        return Object.entries(categoryTotals).map(([category, amount]) => ({
            name: category,
            value: amount,
            color: categoryColors[category] || '#6B7280'
        }));
    }, [transactions]);

    // Get legend data with type information
    const legendData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        const categoryInfo = {};

        transactions.forEach(transaction => {
            const category = transaction.category;
            if (!categoryInfo[category]) {
                categoryInfo[category] = {
                    type: transaction.type,
                    color: categoryColors[category] || '#6B7280'
                };
            }
        });

        return Object.entries(categoryInfo).map(([category, info]) => ({
            name: category,
            type: info.type,
            color: info.color
        }));
    }, [transactions]);

    if (loading) {
        return <ChartSkeleton />;
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4 sm:mb-6 text-gray-900">
                    Category Breakdown
                </h2>
                <div className="flex justify-center items-center py-12 sm:py-16">
                    <div className="text-gray-500 text-center">
                        <p className="text-lg mb-2">No transaction data available</p>
                        <p className="text-sm">Add some transactions to see the breakdown</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4 sm:mb-6 text-gray-900">
                Category Breakdown
            </h2>

            {/* Responsive Pie Chart */}
            <div className="flex justify-center mb-6 sm:mb-8">
                <div className="w-full max-w-[280px] sm:max-w-[300px] aspect-square">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius="35%"
                                outerRadius="70%"
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Responsive Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {legendData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-gray-900 font-medium truncate flex-1">
                            {item.name}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${item.type === 'income'
                            ? 'bg-black text-white'
                            : 'bg-red-500 text-white'
                            }`}>
                            {item.type}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryBreakdown;