import { useEffect } from "react";
import Cards from "../components/Cards";
import { useQuery } from "@apollo/client/react";
import { FETCH_DASHBOARD_DATA } from "../graphql/Queries/TransactionQuery";
import RecentTransaction from "../components/RecentTransaction";
import { handleErrorResponse } from "../utils/handleResponse";
import { CardSkeleton } from "../skeletons/CardSkeleton";
import { RecentTransactionSkeleton } from "../skeletons/RecentTransactionSkeleton";
import CategoryBreakdown from "../components/CategoryBreakdown";

const Dashboard = () => {
  const { data, loading, error } = useQuery(FETCH_DASHBOARD_DATA, {
    fetchPolicy: "cache-first",
  })
  const transactions = data?.getRecentTransactions.transactions;
  const summary = data?.getTransactionSummary?.summary;
  useEffect(() => {
    document.title = "Dashboard | Expenses Tracker";
  }, []);
  if (error) {
    handleErrorResponse(error?.message || "Failed to Fetch");
    return;
  }

  return (
    <div className="bg-gray-50 w-full overflow-x-hidden">
      {/* Cards Section */}
      <div className="flex flex-wrap gap-6 w-full justify-center">
        {loading ? (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </>
        ) : (
          <>
            <Cards
              type="income"
              title="Total Income"
              amount={summary?.currentMonth.income}
              change={summary?.percentageChange.income}
            />
            <Cards
              type="expenses"
              title="Total Expenses"
              amount={summary?.currentMonth.expense}
              change={summary?.percentageChange.expense}
            />
            <Cards
              type="balance"
              title="Balance"
              amount={summary?.currentMonth.balance}
              description="Income - Expenses"
            />
          </>
        )}
      </div>
      {/* Recent Transaction Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mt-6 w-full">
        {loading ? (
          <>
            <RecentTransactionSkeleton />
            <RecentTransactionSkeleton />
          </>
        ) : (
          <>
            <CategoryBreakdown
              loading={loading}
              transactions={transactions}
            />
            <RecentTransaction
              loading={loading}
              transactions={transactions}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
