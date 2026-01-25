export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'EMPLOYEE';
  companyId: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  position?: string;
  salary?: number;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  idNumber?: string;
  photo?: string;
  signature?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  aadhaarImage?: string;
  panImage?: string;
  principalAmount: number;
  accumulatedInterest: number;
  monthlyInterestRate: number;
  lastInterestDate: string;
  createdAt: string;
  updatedAt: string;
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'LOAN' | 'DEPOSIT' | 'INTEREST_ADD';
  amount: number;
  interestRate?: number;
  description?: string;
  principalAfter: number;
  interestAfter: number;
  createdAt: string;
  customerId: string;
  date?: string;
}

export interface Investor {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  idNumber?: string;
  photo?: string;
  signature?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  aadhaarImage?: string;
  panImage?: string;
  principalAmount: number;
  accumulatedInterest: number;
  monthlyInterestRate: number;
  lastInterestDate: string;
  createdAt: string;
  updatedAt: string;
  transactions?: InvestorTransaction[];
}

export interface InvestorTransaction {
  id: string;
  type: 'LOAN_TAKEN' | 'LOAN_RETURN' | 'INTEREST_ADD';
  amount: number;
  interestRate?: number;
  description?: string;
  principalAfter: number;
  interestAfter: number;
  createdAt: string;
  investorId: string;
  date?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber?: string;
  ownerName: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  bankTransactions?: BankTransaction[];
  _count?: {
    bankTransactions: number;
  };
}

export interface BankTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW';
  amount: number;
  description?: string;
  balanceAfter: number;
  createdAt: string;
  bankAccountId: string;
}
