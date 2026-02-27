import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsersService } from './src/users/users.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);

    try {
        const admin = await usersService.findByEmail('admin@platform.com');
        console.log('Admin user found:', admin?.role);

        // Fallback if the user testing uses a different email, let's list all users with super_admin role
        const allUsers = await usersService.findAll();
        const superAdmins = allUsers.filter(u => u.role === 'super_admin');
        console.log('Total Super Admins:', superAdmins.map(u => ({ email: u.email, role: u.role })));
    } catch (e) {
        console.error(e);
    }
    await app.close();
}
bootstrap();
