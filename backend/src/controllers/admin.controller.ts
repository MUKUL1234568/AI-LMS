import { Request, Response } from 'express';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';

export const getAdminData = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                company: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user info and company info
        // Exclude password
        const { password, ...userInfo } = user;

        res.json({
            user: userInfo,
            company: user.company,
        });

    } catch (error: any) {
        console.error('Get admin data error:', error);
        res.status(500).json({ error: 'Failed to fetch admin data' });
    }
}

export const updateAdminProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const { name, email, phone } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                phone
            }
        });

        const { password, ...userInfo } = updatedUser;
        res.json({ message: 'Profile updated successfully', user: userInfo });
    } catch (error: any) {
        console.error('Update admin profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

export const updateCompanyProfile = async (req: any, res: Response) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only admins can update company profile' });
        }

        if (!user.companyId) {
            return res.status(400).json({ error: 'User is not associated with a company' });
        }

        const { name, email, phone, address } = req.body;

        const updatedCompany = await prisma.company.update({
            where: { id: user.companyId },
            data: {
                name,
                email,
                phone,
                address
            }
        });

        res.json({ message: 'Company profile updated successfully', company: updatedCompany });

    } catch (error: any) {
        console.error('Update company profile error:', error);
        res.status(500).json({ error: 'Failed to update company profile' });
    }
};

export const changePassword = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Password changed successfully' });

    } catch (error: any) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};
