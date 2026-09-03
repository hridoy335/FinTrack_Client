import { ACCOUNT_TYPE, TRANSACTION_TYPE } from './transaction.util';

export type TransactionFormMode =
  | 'income'
  | 'expense'
  | 'transfer'
  | 'loan-borrow'
  | 'loan-repay'
  | 'loan-lend'
  | 'loan-collect';

export interface TransactionFormModeConfig {
  title: string;
  subtitle: string;
  icon: string;
  theme: 'income' | 'expense' | 'transfer' | 'loan';
  transactionTypeId: number;
  debitAccountTypeId: number;
  creditAccountTypeId: number;
  debitLabel: string;
  creditLabel: string;
  debitHint: string;
  creditHint: string;
  amountLabel: string;
  descriptionPlaceholder: string;
  cancelLink: string;
}

export const TRANSACTION_FORM_MODES: Record<TransactionFormMode, TransactionFormModeConfig> = {
  income: {
    title: 'Record income',
    subtitle: 'Money received — e.g. salary, freelance, or other earnings.',
    icon: '💰',
    theme: 'income',
    transactionTypeId: TRANSACTION_TYPE.income,
    debitAccountTypeId: ACCOUNT_TYPE.asset,
    creditAccountTypeId: ACCOUNT_TYPE.income,
    debitLabel: 'Deposit to',
    creditLabel: 'Income source',
    debitHint: 'Where the money goes — Cash, Bank, or Wallet.',
    creditHint: 'What kind of income — Salary, Freelance, etc.',
    amountLabel: 'Amount received',
    descriptionPlaceholder: 'e.g. August salary',
    cancelLink: '/app/transactions'
  },
  expense: {
    title: 'Record expense',
    subtitle: 'Money spent — e.g. food, rent, shopping, or bills.',
    icon: '🛒',
    theme: 'expense',
    transactionTypeId: TRANSACTION_TYPE.expense,
    debitAccountTypeId: ACCOUNT_TYPE.expense,
    creditAccountTypeId: ACCOUNT_TYPE.asset,
    debitLabel: 'Expense category',
    creditLabel: 'Paid from',
    debitHint: 'What you spent on — Food, Rent, Transport, etc.',
    creditHint: 'Account used to pay — Cash, Bank, or Wallet.',
    amountLabel: 'Amount spent',
    descriptionPlaceholder: 'e.g. Grocery shopping',
    cancelLink: '/app/transactions'
  },
  transfer: {
    title: 'Transfer money',
    subtitle: 'Move money between your own accounts.',
    icon: '⇄',
    theme: 'transfer',
    transactionTypeId: TRANSACTION_TYPE.transfer,
    debitAccountTypeId: ACCOUNT_TYPE.asset,
    creditAccountTypeId: ACCOUNT_TYPE.asset,
    debitLabel: 'To account',
    creditLabel: 'From account',
    debitHint: 'Account receiving the money.',
    creditHint: 'Account sending the money.',
    amountLabel: 'Amount to transfer',
    descriptionPlaceholder: 'e.g. Moved to savings',
    cancelLink: '/app/transactions'
  },
  'loan-borrow': {
    title: 'Borrow loan',
    subtitle: 'Money you received as a loan — increases cash and loan liability.',
    icon: '🏦',
    theme: 'loan',
    transactionTypeId: TRANSACTION_TYPE.loanBorrow,
    debitAccountTypeId: ACCOUNT_TYPE.asset,
    creditAccountTypeId: ACCOUNT_TYPE.liability,
    debitLabel: 'Receive into',
    creditLabel: 'Loan account',
    debitHint: 'Cash, Bank, or Wallet where loan money is deposited.',
    creditHint: 'Liability account — e.g. Personal Loan or Credit Card.',
    amountLabel: 'Loan amount received',
    descriptionPlaceholder: 'e.g. Personal loan from bank',
    cancelLink: '/app/loans/borrow'
  },
  'loan-repay': {
    title: 'Repay loan',
    subtitle: 'Pay back borrowed money — reduces your loan balance.',
    icon: '💳',
    theme: 'loan',
    transactionTypeId: TRANSACTION_TYPE.loanRepay,
    debitAccountTypeId: ACCOUNT_TYPE.liability,
    creditAccountTypeId: ACCOUNT_TYPE.asset,
    debitLabel: 'Loan account',
    creditLabel: 'Pay from',
    debitHint: 'Which loan you are paying down.',
    creditHint: 'Cash, Bank, or Wallet used for repayment.',
    amountLabel: 'Repayment amount',
    descriptionPlaceholder: 'e.g. Monthly EMI payment',
    cancelLink: '/app/loans/repay'
  },
  'loan-lend': {
    title: 'Lend money',
    subtitle: 'Give money to someone — tracked as a transfer between your accounts.',
    icon: '🤝',
    theme: 'loan',
    transactionTypeId: TRANSACTION_TYPE.transfer,
    debitAccountTypeId: ACCOUNT_TYPE.asset,
    creditAccountTypeId: ACCOUNT_TYPE.asset,
    debitLabel: 'Track as (receivable)',
    creditLabel: 'Lend from',
    debitHint: 'Account to track the loan given — e.g. a receivable or separate wallet.',
    creditHint: 'Your Cash, Bank, or Wallet used to lend.',
    amountLabel: 'Amount lent',
    descriptionPlaceholder: 'e.g. Lent to friend',
    cancelLink: '/app/loans/lend'
  },
  'loan-collect': {
    title: 'Collect repayment',
    subtitle: 'Money returned to you from a loan you gave.',
    icon: '💵',
    theme: 'loan',
    transactionTypeId: TRANSACTION_TYPE.transfer,
    debitAccountTypeId: ACCOUNT_TYPE.asset,
    creditAccountTypeId: ACCOUNT_TYPE.asset,
    debitLabel: 'Receive into',
    creditLabel: 'From receivable',
    debitHint: 'Cash, Bank, or Wallet receiving the repayment.',
    creditHint: 'Account where the loan was tracked.',
    amountLabel: 'Amount collected',
    descriptionPlaceholder: 'e.g. Friend repaid loan',
    cancelLink: '/app/loans/collect'
  }
};
