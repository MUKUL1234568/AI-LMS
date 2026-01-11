import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../types';
import { EmployeeData } from '../types';

export const createEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const employeeData: EmployeeData = req.body;

    // Validate required fields
    if (!employeeData.name || !employeeData.email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if employee with same email exists in this company
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        companyId,
        email: employeeData.email,
      },
    });

    if (existingEmployee) {
      return res.status(400).json({ error: 'Employee with this email already exists' });
    }

    const employee = await prisma.employee.create({
      data: {
        ...employeeData,
        companyId,
      },
    });

    res.status(201).json(employee);
  } catch (error: any) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: error.message || 'Failed to create employee' });
  }
};

export const getEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const employees = await prisma.employee.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(employees);
  } catch (error: any) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch employees' });
  }
};

export const getEmployeeById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const employee = await prisma.employee.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error: any) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch employee' });
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;
    const updateData: Partial<EmployeeData> = req.body;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if employee exists and belongs to company
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // If email is being updated, check for duplicates
    if (updateData.email && updateData.email !== existingEmployee.email) {
      const duplicate = await prisma.employee.findFirst({
        where: {
          companyId,
          email: updateData.email,
        },
      });

      if (duplicate) {
        return res.status(400).json({ error: 'Employee with this email already exists' });
      }
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    res.json(employee);
  } catch (error: any) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: error.message || 'Failed to update employee' });
  }
};

export const deleteEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if employee exists and belongs to company
    const employee = await prisma.employee.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await prisma.employee.delete({
      where: { id },
    });

    res.json({ message: 'Employee deleted successfully' });
  } catch (error: any) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete employee' });
  }
};
