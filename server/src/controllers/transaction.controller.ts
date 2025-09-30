import { redisClient } from "@/lib/redisConnect.js";
import Transaction, { ITransaction } from "@/models/transaction.js";
import {
  AddTransactionArgs,
  GetTransactionArgs,
  MyContext,
  ReportDataArgs,
} from "@/types/context.js";
import { AddTransactionValidation } from "@/validations/TransactionValidations.js";
import { GraphQLError } from "graphql";
import mongoose, { FilterQuery } from "mongoose";

// ---- Utility: clear Redis cache ----
const deleteRedisTransaction = async (userId: string): Promise<void> => {
  const keys = await redisClient.keys(`transactions:${userId}:*`);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

// ---- Utility: calculate period dates ----
const getStartEndDate = (
  period: string
): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date();
  let monthsToSubtract = 3;

  if (period === "6") {
    monthsToSubtract = 6;
  } else if (period === "12") {
    monthsToSubtract = 12;
  }

  startDate.setDate(1);
  startDate.setMonth(startDate.getMonth() - (monthsToSubtract - 1));
  startDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ---- Get Transactions ----
export const getTransactions = async (
  args: GetTransactionArgs,
  context: MyContext
) => {
  try {
    if (!context.user) {
      throw new GraphQLError("Invalid Request", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    const { page, limit, type, category, search } = args;
    const skip = (page - 1) * limit;
    const userId = new mongoose.Types.ObjectId(context.user._id);

    const filter: FilterQuery<ITransaction> = { userId };
    if (type && type !== "all") filter.type = type;
    if (category && category !== "all") filter.category = category;
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const cacheKey = `transactions:${userId}:list:${page}:${limit}:${JSON.stringify(
      filter
    )}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(filter),
    ]);

    const summaryTransactions = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    let income = 0,
      expense = 0;
    summaryTransactions.forEach((summary) => {
      if (summary._id === "income") income = summary.total || 0;
      if (summary._id === "expense") expense = summary.total || 0;
    });

    const response = {
      success: true,
      message: "Transactions fetched successfully",
      summary: { income, expense, balance: income - expense },
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
      transactions,
    };

    await redisClient.set(cacheKey, JSON.stringify(response), { EX: 60 * 5 });
    return response;
  } catch (error: unknown) {
    const err =
      error instanceof Error
        ? error
        : new Error("Failed to Fetch Transactions");
    throw new GraphQLError(err.message, {
      extensions: { code: "INTERNAL_SERVER_ERROR" },
    });
  }
};

// ---- Get Recent Transactions ----
export const getRecentTransactions = async (context: MyContext) => {
  try {
    if (!context.user) {
      throw new GraphQLError("Invalid Request", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    const userId = new mongoose.Types.ObjectId(context.user._id);
    const cacheKey = `transactions:${userId}:recent`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);

    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    const response = {
      success: true,
      message: "Transactions fetched successfully",
      transactions,
    };
    await redisClient.set(cacheKey, JSON.stringify(response), { EX: 60 * 5 });
    return response;
  } catch (error: unknown) {
    const err =
      error instanceof Error
        ? error
        : new Error("Failed to Fetch Recent Transactions");
    throw new GraphQLError(err.message, {
      extensions: { code: "INTERNAL_SERVER_ERROR" },
    });
  }
};

// ---- Get Transaction Summary ----
export const getTransactionSummary = async (context: MyContext) => {
  try {
    if (!context.user) {
      throw new GraphQLError("Invalid Request", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    const userId = new mongoose.Types.ObjectId(context.user._id);
    const cacheKey = `transactions:${userId}:summary`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);

    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const aggregateSummary = async (start: Date, end?: Date) =>
      Transaction.aggregate([
        {
          $match: {
            userId,
            date: end ? { $gte: start, $lte: end } : { $gte: start },
          },
        },
        { $group: { _id: "$type", total: { $sum: "$amount" } } },
      ]);

    const currentMonthSummary = await aggregateSummary(firstDayThisMonth);
    const lastMonthSummary = await aggregateSummary(
      firstDayLastMonth,
      lastDayLastMonth
    );

    const parseSummary = (summary: { _id: string; total: number }[]) => {
      const income = summary.find((s) => s._id === "income")?.total || 0;
      const expense = summary.find((s) => s._id === "expense")?.total || 0;
      return { income, expense, balance: income - expense };
    };

    const currentMonth = parseSummary(currentMonthSummary);
    const lastMonth = parseSummary(lastMonthSummary);

    const calculatePercentage = (currentVal: number, lastVal: number) =>
      lastVal === 0
        ? currentVal === 0
          ? 0
          : 100
        : Number((((currentVal - lastVal) / lastVal) * 100).toFixed(2));

    const response = {
      success: true,
      message: "Transactions summary fetched successfully",
      summary: {
        currentMonth,
        lastMonth,
        percentageChange: {
          income: calculatePercentage(currentMonth.income, lastMonth.income),
          expense: calculatePercentage(currentMonth.expense, lastMonth.expense),
          balance: calculatePercentage(currentMonth.balance, lastMonth.balance),
        },
      },
    };

    await redisClient.set(cacheKey, JSON.stringify(response), { EX: 60 * 5 });
    return response;
  } catch (error: unknown) {
    const err =
      error instanceof Error
        ? error
        : new Error("Failed to Fetch Transaction Summary");
    throw new GraphQLError(err.message, {
      extensions: { code: "INTERNAL_SERVER_ERROR" },
    });
  }
};

// ---- Add Transaction ----
export const addTransaction = async (
  args: AddTransactionArgs,
  context: MyContext
) => {
  try {
    if (!context.user) {
      throw new GraphQLError("Invalid Request", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    const validation = await AddTransactionValidation.safeParseAsync(
      args.input
    );
    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0].message,
        transaction: null,
      };
    }

    const userId = new mongoose.Types.ObjectId(context.user._id);
    const newTransaction = await Transaction.create({
      ...args.input,
      date: new Date(
        `${args.input.date}T${new Date().toTimeString().slice(0, 8)}`
      ),
      userId,
    });

    await deleteRedisTransaction(userId.toString());

    return {
      success: true,
      message: "Transaction added successfully",
      transaction: newTransaction,
    };
  } catch (error: unknown) {
    const err =
      error instanceof Error
        ? error
        : new Error("Failed to Add New Transactions");
    throw new GraphQLError(err.message, {
      extensions: { code: "INTERNAL_SERVER_ERROR" },
    });
  }
};

// ---- Get Reports Data ----
export const getReportsData = async (
  args: ReportDataArgs,
  context: MyContext
) => {
  try {
    if (!context.user) {
      throw new GraphQLError("UnAunthenticated", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }
    if (!args.period) {
      throw new GraphQLError("Invalid Request", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    const { startDate, endDate } = getStartEndDate(args.period);
    const userId = new mongoose.Types.ObjectId(context.user._id);
    const cacheKey = `transactions:${userId}:reports:${args.period}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);

    const monthlyData = await Transaction.aggregate([
      { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    let totalIncome = 0,
      totalExpense = 0,
      cumulativeBalance = 0;
    const incomeVsExpense: {
      month: string;
      year: number;
      income: number;
      expense: number;
    }[] = [];
    const balanceTrend: { month: string; year: number; balance: number }[] = [];

    const priorBalanceResult = await Transaction.aggregate([
      { $match: { userId, date: { $lt: startDate } } },
      {
        $group: {
          _id: null,
          income: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
        },
      },
    ]);

    if (priorBalanceResult.length > 0) {
      cumulativeBalance =
        priorBalanceResult[0].income - priorBalanceResult[0].expense;
    }

    monthlyData.forEach((item) => {
      const { year, month } = item._id;
      const income = item.totalIncome;
      const expense = item.totalExpense;
      const netChange = income - expense;

      totalIncome += income;
      totalExpense += expense;
      cumulativeBalance += netChange;

      const monthStr = monthNames[month - 1];

      incomeVsExpense.push({ month: monthStr, year, income, expense });
      balanceTrend.push({ month: monthStr, year, balance: cumulativeBalance });
    });

    const netBalance = totalIncome - totalExpense;
    const avgMonthly = netBalance / (monthlyData.length || 1);

    const response = {
      success: true,
      message: "Reports data fetched successfully.",
      summary: {
        income: totalIncome,
        expense: totalExpense,
        balance: netBalance,
        avgMonthly,
      },
      balanceTrend,
      incomeVsExpense,
    };

    await redisClient.set(cacheKey, JSON.stringify(response), { EX: 60 * 5 });
    return response;
  } catch (error: unknown) {
    const err =
      error instanceof Error
        ? error
        : new Error("Failed to Fetch Reports Data");
    throw new GraphQLError(err.message, {
      extensions: { code: "INTERNAL_SERVER_ERROR" },
    });
  }
};

// ---- Delete Transaction ----
export const deleteTransaction = async (
  args: { id: string },
  context: MyContext
) => {
  try {
    if (!context.user) {
      throw new GraphQLError("Invalid Request", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }
    const userId = new mongoose.Types.ObjectId(context.user._id);
    const transaction = await Transaction.findOneAndDelete({
      _id: args.id,
      userId,
    });

    if (!transaction) {
      throw new GraphQLError("Transaction not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    await deleteRedisTransaction(userId.toString());

    return { success: true, message: "Transaction deleted successfully" };
  } catch (error: unknown) {
    const err =
      error instanceof Error
        ? error
        : new Error("Failed to Delete Transaction");
    throw new GraphQLError(err.message, {
      extensions: { code: "INTERNAL_SERVER_ERROR" },
    });
  }
};
