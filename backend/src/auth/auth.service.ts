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
        const { email, password, role, subscriptionPlan, firstName, lastName, timezone } = registerDto;
        const user = await this.usersService.create(
            email,
            password,
            role,
            subscriptionPlan,
            firstName,
            lastName,
            timezone,
        );
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            subscriptionPlan: user.subscriptionPlan,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionEndDate: user.subscriptionEndDate,
            firstName: user.firstName,
            lastName: user.lastName,
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password, role } = loginDto;

        const user = await this.usersService.findByEmail(email)
            || await this.usersService.findByCredentialId(email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        if (user.isActive === false) {
            throw new UnauthorizedException('Account disabled');
        }

        const isPasswordValid = await this.usersService.validatePassword(
            password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (role && user.role !== role) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                credentialId: (user as any).credentialId || null,
                collegeId: (user as any).collegeId || null,
                department: (user as any).department || null,
                year: (user as any).year || null,
                role: user.role,
                subscriptionPlan: user.subscriptionPlan,
                subscriptionStatus: user.subscriptionStatus,
                subscriptionEndDate: user.subscriptionEndDate,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        };
    }
}
