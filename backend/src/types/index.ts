import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: JwtPayload & {
    userId: string;
    companyId: string;
    role: string;
  };
  files?: {
    [fieldname: string]: Express.Multer.File[];
  } | Express.Multer.File[];
}

export interface CompanyRegistrationData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  adminName: string;
  adminPhone?: string;
}

export interface EmployeeData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  position?: string;
  salary?: number;
  joinDate?: Date;
}

export interface CustomerData {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  idNumber?: string;
  aadhaarNumber?: string;
  panNumber?: string;
}

export interface InvestorData {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  idNumber?: string;
  aadhaarNumber?: string;
  panNumber?: string;
}