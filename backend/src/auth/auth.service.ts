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
        const { email, password, role, subscriptionPlan, firstName, lastName, collegeId } = registerDto;
        const user = await this.usersService.create(
            email,
            password,
            role,
            subscriptionPlan,
            firstName,
            lastName,
            collegeId,
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
            collegeId: user.collegeId,
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password, role } = loginDto;

        const user = await this.usersService.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
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
        const payload = { sub: user.id, email: user.email, role: user.role, collegeId: user.collegeId };
        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                subscriptionPlan: user.subscriptionPlan,
                subscriptionStatus: user.subscriptionStatus,
                subscriptionEndDate: user.subscriptionEndDate,
                firstName: user.firstName,
                lastName: user.lastName,
                collegeId: user.collegeId,
            },
        };
    }
}
