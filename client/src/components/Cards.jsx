import { ArrowUpRight, ArrowDownRight, IndianRupee, Plus, Minus } from "lucide-react";

const Cards = ({ type, title, amount, change, description }) => {
    const cardStyles = {
        income: "bg-green-50 text-green-700 border border-green-200",
        expenses: "bg-red-50 text-red-700 border border-red-200",
        balance: "bg-blue-50 text-blue-700 border border-blue-200",
    };

    const iconMap = {
        income: <Plus className="w-5 h-5 text-green-600" />,
        expenses: <Minus className="w-5 h-5 text-red-600" />,
        balance: <IndianRupee className="w-5 h-5 text-blue-600" />,
    };

    return (
        <div className={`rounded-2xl border shadow-md p-5 w-72 ${cardStyles[type]}`}>
            <div className="flex items-center gap-2 font-semibold">
                {iconMap[type]}
                <span>{title}</span>
            </div>
            <h2 className="text-2xl font-bold mt-2 text-black">₹{amount}</h2>
            {change && (
                <p className={`text-sm mt-1 ${change > 0 ? "text-green-600" : "text-red-600"}`}>
                    {change > 0 ? <ArrowUpRight className="inline w-4 h-4" /> : <ArrowDownRight className="inline w-4 h-4" />}
                    {Math.abs(change)}% vs last month
                </p>
            )}
            {description && <p className="text-sm mt-1">{description}</p>}
        </div>
    );
};

export default Cards;
