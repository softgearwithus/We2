import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, password, role, subscriptionPlan } = registerDto;
        const user = await this.usersService.create(email, password, role, subscriptionPlan);
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            subscriptionPlan: user.subscriptionPlan,
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;
        console.log(`[AuthService] Attempting login for email: ${email}`);

        const user = await this.usersService.findByEmail(email);

        if (!user) {
            console.log(`[AuthService] User not found for email: ${email}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        console.log(`[AuthService] User found, validating password...`);
        const isPasswordValid = await this.usersService.validatePassword(
            password,
            user.password,
        );

        if (!isPasswordValid) {
            console.log(`[AuthService] Password validation failed for email: ${email}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        console.log(`[AuthService] Login successful for email: ${email}`);
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }
}
