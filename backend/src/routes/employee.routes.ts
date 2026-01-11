import { Router } from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employee.controller';
import { authenticate } from '../middlewares/auth.middleware';

export const employeeRoutes = Router();

employeeRoutes.use(authenticate);

employeeRoutes.post('/', createEmployee);
employeeRoutes.get('/', getEmployees);
employeeRoutes.get('/:id', getEmployeeById);
employeeRoutes.put('/:id', updateEmployee);
employeeRoutes.delete('/:id', deleteEmployee);
