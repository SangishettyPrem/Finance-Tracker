import { gql } from "@apollo/client";

export const FETCH_DASHBOARD_DATA = gql`
    query GetDashboardData {
        getRecentTransactions {
            message
            success
            transactions {
                amount
                category
                date
                description
                _id
                type
            }
        }
        getTransactionSummary {
            message
            success
            summary {
                currentMonth {
                    balance
                    expense
                    income
                }
                lastMonth {
                    balance
                    expense
                    income
                }
                percentageChange {
                    balance
                    expense
                    income
                }
            }
        }
    }

`;

export const FETCH_TRANSACTIONS = gql`
    query GetTransactions($limit: Int!, $page: Int!, $type: String, $category: String, $search: String) {
        getTransactions(limit: $limit, page: $page, type: $type, category: $category, search: $search) {
            message
            success
            summary {
                balance
                expense
                income
            }
            pagination {
                currentPage
                totalPages
                totalCount
            }
            transactions {
               amount
               type
               description
               category
               date
               userId
               _id
            }
        }
    }
`;

export const FETCH_REPORTS_DATA = gql`
  query GetReportsData($period: String!) {
    getReportsData(period: $period) {
      message
      success
      summary {
        income
        expense
        balance
        avgMonthly
      }
      balanceTrend {
        month
        year
        balance
      }
      incomeVsExpense {
        month
        year
        income
        expense
      }
    }
  }
`;
