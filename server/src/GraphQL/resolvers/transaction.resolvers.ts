import {
  addTransaction,
  deleteTransaction,
  getRecentTransactions,
  getReportsData,
  getTransactions,
  getTransactionSummary,
} from "@/controllers/transaction.controller.js";
import {
  AddTransactionArgs,
  GetTransactionArgs,
  MyContext,
  ReportDataArgs,
} from "@/types/context.js";

export const TransactionResolvers = {
  Query: {
    getTransactions: async (
      _: unknown,
      args: GetTransactionArgs,
      context: MyContext
    ) => {
      return getTransactions(args, context);
    },
    getRecentTransactions: async (
      _: unknown,
      __: unknown,
      context: MyContext
    ) => {
      return getRecentTransactions(context);
    },
    getTransactionSummary: async (
      _: unknown,
      __: unknown,
      context: MyContext
    ) => {
      return getTransactionSummary(context);
    },
    getReportsData: async (
      _: unknown,
      args: ReportDataArgs,
      context: MyContext
    ) => {
      return getReportsData(args, context);
    },
  },

  Mutation: {
    addTransaction: async (
      _: unknown,
      args: AddTransactionArgs,
      context: MyContext
    ) => {
      return addTransaction(args, context);
    },
    deleteTransaction: async (
      _: unknown,
      args: { id: string },
      context: MyContext
    ) => {
      return deleteTransaction(args, context);
    },
  },
};
