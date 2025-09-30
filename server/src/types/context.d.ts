export interface MyContext {
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface ReportDataArgs {
  period: string;
}

export interface GetTransactionArgs {
  page: number;
  limit: number;
  type?: string;
  category?: string;
  search?: string;
}

export interface AddTransactionArgs {
  input: {
    type: string;
    category: string;
    amount: number;
    date: string;
    description?: string;
  };
}
