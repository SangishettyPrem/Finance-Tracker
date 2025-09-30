import {
    Card,
    CardContent,
    Typography,
    Select,
    MenuItem,
    FormControl,
    Box
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Scale } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { FETCH_REPORTS_DATA } from '../graphql/Queries/TransactionQuery';
const Reports = () => {
    const [period, setPeriod] = useState("3");

    useEffect(() => {
        document.title = "Reports | Expenses Tracker";
    }, []);

    const { data, loading, error } = useQuery(FETCH_REPORTS_DATA, {
        variables: { period },
        fetchPolicy: "cache-first",
    });

    const reportsData = data?.getReportsData;
    const summary = reportsData?.summary ?? {};
    const balanceTrendData = reportsData?.balanceTrend ?? [];
    const incomeExpensesData = reportsData?.incomeVsExpense ?? [];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const cardsValue = [
        {
            title: 'Total Income',
            value: formatCurrency(summary.income ?? 0),
            icon: <AddIcon />,
            color: 'text-green-600',
            bg: 'bg-green-50',
            iconbg: 'bg-green-100',
        },
        {
            title: 'Total Expenses',
            value: formatCurrency(summary.expense ?? 0),
            icon: <RemoveIcon />,
            color: 'text-red-600',
            bg: 'bg-red-50',
            iconbg: 'bg-red-100',
        },
        {
            title: 'Net Balance',
            value: formatCurrency(summary.balance ?? 0),
            icon: <Scale />,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            iconbg: 'bg-blue-100',
        },
        {
            title: 'Avg Monthly',
            value: formatCurrency(summary.avgMonthly ?? 0),
            icon: <TrendingUpIcon />,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            iconbg: 'bg-purple-100',
        }
    ];

    if (loading) return <p>Loading reports...</p>;
    if (error) return <p>Error loading reports: {error.message}</p>;

    return (
        <div className="min-h-screen w-full bg-gray-50 p-2">
            <div className="w-full">
                {/* Header */}
                <Card className="flex justify-between items-center mb-6 p-3 rounded-lg">
                    <Typography variant="h5" className=" text-gray-800">
                        Financial Reports
                    </Typography>
                    <FormControl variant="outlined" size="small" className="min-w-32">
                        <Select
                            value={period}
                            className="bg-gray-200 rounded-3xl"
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                    border: 'none'
                                },
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                            onChange={(e) => setPeriod(e.target.value)}
                        >
                            <MenuItem value="3">Last 3 Months</MenuItem>
                            <MenuItem value="6">Last 6 Months</MenuItem>
                            <MenuItem value="12">Last Year</MenuItem>
                        </Select>
                    </FormControl>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Income Card */}
                    {cardsValue?.map((card, index) => (
                        <Card key={index} className={`border-0 ${card.bg} shadow-lg rounded-2xl`}>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 ${card.iconbg} rounded-full flex items-center justify-center`}>
                                        {card.icon}
                                    </div>
                                    <div>
                                        <Typography variant="h6" className={`text-gray-600 text-xl mb-1 ${card.color}`}>
                                            {card.title}
                                        </Typography>
                                        <Typography variant="body2" className={`font-bold !text-lg ${card.color}`}>
                                            {card.value}
                                        </Typography>
                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Balance Trend Chart */}
                    <Card className="border-0 shadow-lg rounded-2xl">
                        <CardContent className="p-6">
                            <Typography variant="h6" className="font-semibold text-gray-800 mb-6">
                                Balance Trend
                            </Typography>
                            <Box sx={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={balanceTrendData}>
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6B7280' }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6B7280' }}
                                            tickFormatter={(value) => `₹${value / 1000}k`}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="balance"
                                            stroke="#3B82F6"
                                            strokeWidth={3}
                                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, fill: '#3B82F6' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Income vs Expenses Chart */}
                    <Card className="border-0 shadow-lg rounded-2xl">
                        <CardContent className="p-6">
                            <Typography variant="h6" className="font-semibold text-gray-800 mb-6">
                                Income vs Expenses
                            </Typography>
                            <Box sx={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={incomeExpensesData}>
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6B7280' }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6B7280' }}
                                            tickFormatter={(value) => `₹${value / 1000}k`}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="income"
                                            stroke="#10B981" // Green
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="expense"
                                            stroke="#EF4444" // Red
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Reports;