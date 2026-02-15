import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { SimulationsModule } from './simulations/simulations.module';
import { TasksModule } from './tasks/tasks.module';
import { TeamsModule } from './teams/teams.module';
import { PerformanceModule } from './performance/performance.module';
import { AchievementsModule } from './achievements/achievements.module';
import { InterviewsModule } from './interviews/interviews.module';
import { CertificationsModule } from './certifications/certifications.module';
import { ProjectsModule } from './projects/projects.module';
import { DsaModule } from './dsa/dsa.module';
import { User } from './users/user.entity';
import { Simulation } from './simulations/entities/simulation.entity';
import { Task } from './tasks/entities/task.entity';
import { Team } from './teams/entities/team.entity';
import { TeamMember } from './teams/entities/team-member.entity';
import { Performance } from './performance/entities/performance.entity';
import { Achievement } from './achievements/entities/achievement.entity';
import { Certification } from './certifications/entities/certification.entity';
import { Project } from './projects/entities/project.entity';
import { InterviewSession } from './interviews/entities/interview-session.entity';
import { DsaProblem } from './dsa/entities/dsa-problem.entity';
import { Submission } from './dsa/entities/submission.entity';
import { Interview } from './interview/entities/interview.entity';
import { CourseContent } from './course-content/entities/course-content.entity';
import { InterviewModule } from './interview/interview.module';
import { CourseContentModule } from './course-content/course-content.module';
import { AiModule } from './ai/ai.module';
import { GamificationModule } from './gamification/gamification.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UserGamification } from './gamification/entities/user-gamification.entity';
import { Badge } from './gamification/entities/badge.entity';
import { UserBadge } from './gamification/entities/user-badge.entity';
import { ResumeModule } from './resume/resume.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 120,
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>('DB_TYPE') || 'sqlite';
        const entities = [
          User,
          Simulation,
          Task,
          Team,
          TeamMember,
          Performance,
          Achievement,
          Certification,
          Project,
          InterviewSession,
          Interview,
          DsaProblem,
          Submission,
          CourseContent,
          UserGamification,
          Badge,
          UserBadge,
        ];

        if (dbType === 'postgres') {
          return {
            type: 'postgres',
            host: configService.get<string>('DB_HOST') || 'localhost',
            port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
            username: configService.get<string>('DB_USER') || 'admin',
            password: configService.get<string>('DB_PASSWORD') || 'password',
            database: configService.get<string>('DB_NAME') || 'college_prep_db',
            entities,
            synchronize: true,
            logging: false,
          };
        }

        return {
          type: 'sqlite',
          database: configService.get<string>('DB_SQLITE_PATH') || 'database.sqlite',
          entities,
          synchronize: true,
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    HealthModule,
    SimulationsModule,
    TasksModule,
    TeamsModule,
    PerformanceModule,
    AchievementsModule,
    InterviewsModule,
    CertificationsModule,
    ProjectsModule,
    DsaModule,
    InterviewModule,
    CourseContentModule,
    AiModule,
    GamificationModule,
    AnalyticsModule,
    ResumeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
