import { useEffect, useState } from 'react';
import { useMutation } from "@apollo/client/react"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    IconButton,
    MenuItem,
    Select,
    FormControl,
    Typography,
} from '@mui/material';
import { Close, Add, Remove } from '@mui/icons-material';
import { ADD_TRANSACTION } from '../graphql/Mutations/TransactionMutation';
import { handleErrorResponse, handleSuccessResponse } from '../utils/handleResponse';
import { useAuth } from '../context/AuthContext';

const AddTransaction = ({ open, onClose }) => {
    const [form, setform] = useState({
        transactionType: 'expense',
        amount: null,
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });
    const { user } = useAuth();
    const [addTransaction, { loading }] = useMutation(ADD_TRANSACTION, {
        refetchQueries: ["GetTransactions", "GetDashboardData", "GetReportsData"],
        awaitRefetchQueries: true,
    });

    useEffect(() => {
        document.title = "Add Transaction | Expenses Tracker";
    }, []);


    const expenseCategories = [
        'Food & Dining',
        'Transportation',
        'Shopping',
        'Entertainment',
        'Bills & Utilities',
        'Healthcare',
        'Education',
        'Travel',
        'Other'
    ];

    const incomeCategories = [
        'Salary',
        'Freelance',
        'Business',
        'Investment',
        'Gift',
        'Bonus',
        'Other'
    ];

    const handleSubmit = async () => {
        try {
            const result = await addTransaction({
                variables: {
                    userId: user?._id,
                    input: {
                        type: form.transactionType,
                        amount: Number(form.amount),
                        category: form.category,
                        description: form.description,
                        date: form.date,
                    }

                }
            })
            if (result?.data?.addTransaction?.success) {
                setform({
                    transactionType: 'expense',
                    amount: null,
                    category: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                });
                setTimeout(() => {
                    onClose();
                }, 2000);
                return handleSuccessResponse(result?.data?.addTransaction?.message);
            } else {
                return handleErrorResponse(result?.data?.addTransaction?.message)
            }
        } catch (error) {
            return handleErrorResponse(error?.response?.data?.message || error?.message || "Error while Adding Transaction  ")
        }
    };

    const toggleTransactionType = (type) => {
        setform({
            ...form,
            transactionType: type,
            category: '',
            amount: null,
            description: '',
            date: new Date().toISOString().split('T')[0],
        })
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setform({
            ...form,
            [name]: value,
        });
    }

    return (
        <div className="bg-gray-100 flex items-center justify-center">
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        margin: '16px',
                        maxHeight: 'calc(100vh - 32px)',
                        width: 'calc(100vw - 32px)',
                        maxWidth: '500px',
                    }
                }}
            >
                <DialogTitle className="flex items-center justify-between p-6 pb-4">
                    <div className="flex items-center gap-2">
                        {form.transactionType === 'expense' ? (
                            <Remove className="text-red-500 text-lg" />
                        ) : (
                            <Add className="text-green-500 text-lg" />
                        )}
                        <Typography variant="h6" className="font-medium text-gray-900">
                            Add New Transaction
                        </Typography>
                    </div>
                    <IconButton onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent className="px-6 pb-6 space-y-6">
                    {/* Transaction Type Toggle */}
                    <div>
                        <Typography variant="subtitle1" className="font-medium text-gray-900 mb-3">
                            Transaction Type
                        </Typography>
                        <div className="flex gap-4">
                            <button
                                onClick={() => toggleTransactionType('income')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:cursor-pointer transition-colors ${form.transactionType === 'income'
                                    ? 'bg-green-50 text-green-700 border-2 border-green-200'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Add className="text-green-500 text-sm" />
                                Income
                                {form.transactionType === 'income' && (
                                    <div className="w-2 h-2 bg-green-500 rounded-full ml-1"></div>
                                )}
                            </button>

                            <button
                                onClick={() => toggleTransactionType('expense')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:cursor-pointer transition-colors ${form.transactionType === 'expense'
                                    ? 'bg-red-50 text-red-700 border-2 border-red-200'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Remove className="text-red-500 text-sm" />
                                Expense
                                {form.transactionType === 'expense' && (
                                    <div className="w-2 h-2 bg-red-500 rounded-full ml-1"></div>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Amount Field */}
                    <div>
                        <Typography variant="subtitle1" className="font-medium text-gray-900 mb-2">
                            Amount ($)
                        </Typography>
                        <TextField
                            fullWidth
                            value={form.amount}
                            name='amount'
                            onChange={handleInputChange}
                            type="number"
                            inputProps={{ step: '0.01', min: '0' }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '8px',
                                    '& fieldset': {
                                        borderColor: '#e5e7eb',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#d1d5db',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: form.transactionType === 'expense' ? '#ef4444' : '#10b981',
                                    },
                                }
                            }}
                        />
                    </div>

                    {/* Category Field */}
                    <div>
                        <Typography variant="subtitle1" className="font-medium text-gray-900 mb-2">
                            Category
                        </Typography>
                        <FormControl fullWidth>
                            <Select
                                value={form.category}
                                onChange={handleInputChange}
                                name='category'
                                displayEmpty
                                sx={{
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '8px',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#e5e7eb',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#d1d5db',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: form.transactionType === 'expense' ? '#ef4444' : '#10b981',
                                    },
                                }}
                            >
                                <MenuItem value="" disabled>
                                    <span className="text-gray-400">
                                        Select {form.transactionType} category
                                    </span>
                                </MenuItem>
                                {(form.transactionType === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                                    <MenuItem key={cat} value={cat}>
                                        {cat}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    {/* Description Field */}
                    <div>
                        <Typography variant="subtitle1" className="font-medium text-gray-900 mb-2">
                            Description
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            name='description'
                            type="text"
                            value={form.description}
                            onChange={handleInputChange}
                            placeholder={`Describe this ${form.transactionType}...`}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '8px',
                                    '& fieldset': {
                                        borderColor: '#e5e7eb',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#d1d5db',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: form.transactionType === 'expense' ? '#ef4444' : '#10b981',
                                    },
                                }
                            }}
                        />
                    </div>

                    {/* Date Field */}
                    <div>
                        <Typography variant="subtitle1" className="font-medium text-gray-900 mb-2">
                            Date
                        </Typography>
                        <TextField
                            fullWidth
                            type="date"
                            value={form.date}
                            name='date'
                            onChange={handleInputChange}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '8px',
                                    '& fieldset': {
                                        borderColor: '#e5e7eb',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#d1d5db',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: form.transactionType === 'expense' ? '#ef4444' : '#10b981',
                                    },
                                }
                            }}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            onClick={onClose}
                            variant="outlined"
                            fullWidth
                            sx={{
                                borderColor: '#e5e7eb',
                                color: '#6b7280',
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 500,
                                py: 1.5,
                                '&:hover': {
                                    borderColor: '#d1d5db',
                                    backgroundColor: '#f9fafb',
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            loading={loading}
                            loadingIndicator={"Adding..."}
                            sx={{
                                backgroundColor: form.transactionType === 'expense' ? '#ef4444' : '#10b981',
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 500,
                                py: 1.5,
                                '&:hover': {
                                    backgroundColor: form.transactionType === 'expense' ? '#dc2626' : '#059669',
                                }
                            }}
                        >
                            Add {form.transactionType === 'expense' ? 'Expense' : 'Income'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default AddTransaction;