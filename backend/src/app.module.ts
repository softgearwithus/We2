import { Module } from '@nestjs/common';
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
import { DsaUserState } from './dsa/entities/dsa-user-state.entity';
import { DsaTrainingSession } from './dsa/entities/dsa-training-session.entity';
import { DsaProblemInsight } from './dsa/entities/dsa-problem-insight.entity';
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
import { Resume } from './resume/entities/resume.entity';
import { McqsModule } from './mcqs/mcqs.module';
import { McqQuestion } from './mcqs/entities/mcq-question.entity';
import { WriteXModule } from './writex/writex.module';
import { WriteXQuestion } from './writex/entities/writex-question.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>('DB_TYPE') || 'postgres';
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
          DsaUserState,
          DsaTrainingSession,
          DsaProblemInsight,
          CourseContent,
          UserGamification,
          Badge,
          UserBadge,
          Resume,
          McqQuestion,
          WriteXQuestion,
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

        throw new Error('SQLite is not supported. Set DB_TYPE=postgres.');
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
    McqsModule,
    WriteXModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
