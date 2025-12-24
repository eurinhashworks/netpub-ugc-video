import { prisma } from './lib/prisma.js';
import { AuthService } from './lib/auth.js';

async function testAuth() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'org.netpub@gmail.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'NetpubAdmin2024!';

        const user = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (!user) {
            await AuthService.createAdminUser();
        } else {
                id: user.id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            });

            // Test password verification
            const isValid = await AuthService.verifyPassword(adminPassword, user.password);
        }
    } catch (error) {
    } finally {
        await prisma.$disconnect();
    }
}

testAuth();
