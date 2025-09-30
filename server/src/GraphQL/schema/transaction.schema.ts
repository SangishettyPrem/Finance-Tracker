export const TransactionSchema = `#graphql

type Transaction {
    _id: ID!
    type: String!
    category: String!
    amount: Float!
    date: String!
    description: String
    createdAt: String!
    updatedAt: String!
    userId: String!
}

input TransactionInput {
    type: String!,
    category: String!,
    amount: Float!
    date: String!
    description: String
}

type AddTransactionResponse {
    success : Boolean!
    message: String!
    transaction: Transaction
}

type getRecentTransactionResponse {
    success : Boolean!
    message: String!
    transactions: [Transaction]
}

type Summary{
    currentMonth: TransactionSummary
    lastMonth: TransactionSummary
    percentageChange: PercentageChange
}

type TransactionSummary {
    income: Float!
    expense: Float!
    balance: Float!
    avgMonthly: Float
}

type PercentageChange {
    income: Float!
    expense: Float!
    balance: Float!
}

type Pagination {
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
}

type getTransactionSummaryResponse {
    success : Boolean!
    message: String!
    summary: Summary
}

type getTransactionsResponse {
    success: Boolean!
    message: String!
    transactions: [Transaction]
    summary: TransactionSummary
    pagination: Pagination
}

type BalanceTrend {
    month: String!
    year: Int!
    balance: Float!
}

type IncomeVsExpense {
    month: String!
    year: Int!
    income: Float!
    expense: Float!
}

type getReportsDataResponse {
    success: Boolean!
    message: String!
    summary: TransactionSummary
    balanceTrend: [BalanceTrend!]!
    incomeVsExpense: [IncomeVsExpense!]!
}

type Query {
    getTransactions(limit: Int!, page: Int!, type: String, category: String,search: String): getTransactionsResponse!
    getRecentTransactions: getRecentTransactionResponse!
    getTransactionSummary: getTransactionSummaryResponse!
    getReportsData(period: String!): getReportsDataResponse
}

type Mutation {
    addTransaction(userId: ID!, input: TransactionInput!): AddTransactionResponse!
    deleteTransaction(id: ID!): Boolean!
}
`;
