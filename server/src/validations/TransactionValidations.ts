import * as z from "zod";

export const AddTransactionValidation = z.object({
  type: z.enum(["income", "expense"], {
    error: "Type must be either 'income' or 'expense'",
  }),
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Date must be a valid date string",
  }),
  description: z.string().optional(),
});
