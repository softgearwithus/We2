import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { User } from '../../users/user.entity';

@Injectable()
export class LastActiveInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    if (userId) {
      this.usersRepo
        .update({ id: userId }, { lastActiveAt: new Date() })
        .catch(() => null);
    }
    return next.handle();
  }
}
