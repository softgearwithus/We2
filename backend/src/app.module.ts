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
import { ProjectLabsModule } from './project-labs/project-labs.module';
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
import { ProjectLab } from './project-labs/entities/project-lab.entity';
import { ProjectLabSubmission } from './project-labs/entities/project-lab-submission.entity';
import { InterviewSession } from './interviews/entities/interview-session.entity';
import { DsaProblem } from './dsa/entities/dsa-problem.entity';
import { Submission } from './dsa/entities/submission.entity';
import { DsaUserState } from './dsa/entities/dsa-user-state.entity';
import { DsaTrainingSession } from './dsa/entities/dsa-training-session.entity';
import { DsaProblemInsight } from './dsa/entities/dsa-problem-insight.entity';
import { SqlModule } from './sql/sql.module';
import { SqlProblem } from './sql/entities/sql-problem.entity';
import { SqlSubmission } from './sql/entities/sql-submission.entity';
import { SqlUserState } from './sql/entities/sql-user-state.entity';
import { SqlTrainingSession } from './sql/entities/sql-training-session.entity';
import { SqlProblemInsight } from './sql/entities/sql-problem-insight.entity';
import { Interview } from './interview/entities/interview.entity';
import { CollegesModule } from './colleges/colleges.module';
import { College } from './colleges/entities/college.entity';
import { CollegeStaff } from './colleges/entities/college-staff.entity';
import { StudentCohort } from './colleges/entities/student-cohort.entity';
import { CollegeStudent } from './colleges/entities/college-student.entity';
import { AdminModule } from './admin/admin.module';
import { AdminSettingsModule } from './admin-settings/admin-settings.module';
import { AdminActivityLog } from './admin/entities/admin-activity-log.entity';
import { AdminUpdateFlag } from './admin-settings/entities/admin-update-flag.entity';
import { PlatformSettings } from './admin-settings/entities/platform-settings.entity';
import { InstituteModule } from './institute/institute.module';
import { MarketRadarModule } from './market-radar/market-radar.module';
import { MarketRadar } from './market-radar/entities/market-radar.entity';
import { MentorsModule } from './mentors/mentors.module';
import { MentorProfile } from './mentors/entities/mentor-profile.entity';
import { MentorApplication } from './mentors/entities/mentor-application.entity';
import { MentorSession } from './mentors/entities/mentor-session.entity';
import { MentorPayout } from './mentors/entities/mentor-payout.entity';
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
import { UsageModule } from './usage/usage.module';
import { UserSectionUsage } from './usage/entities/user-section-usage.entity';
import { PreparationModule } from './preparation/preparation.module';
import { PreparationProgress } from './preparation/entities/preparation-progress.entity';
import { resolveDbConfig } from './common/db-config';

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
           ProjectLab,
           ProjectLabSubmission,
          InterviewSession,
          Interview,
          DsaProblem,
          Submission,
          DsaUserState,
          DsaTrainingSession,
          DsaProblemInsight,
          SqlProblem,
          SqlSubmission,
          SqlUserState,
          SqlTrainingSession,
          SqlProblemInsight,
          CourseContent,
          UserGamification,
          Badge,
          UserBadge,
          Resume,
          McqQuestion,
          WriteXQuestion,
          UserSectionUsage,
          PreparationProgress,
          College,
          CollegeStaff,
          StudentCohort,
          CollegeStudent,
           AdminActivityLog,
           AdminUpdateFlag,
           PlatformSettings,
          MarketRadar,
          MentorProfile,
          MentorApplication,
          MentorSession,
          MentorPayout,
        ];

        if (dbType === 'postgres') {
          const dbConfig = resolveDbConfig(configService);
          return {
            type: 'postgres',
            ...dbConfig,
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
     ProjectLabsModule,
    DsaModule,
    SqlModule,
    InterviewModule,
    CourseContentModule,
    AiModule,
    GamificationModule,
    AnalyticsModule,
    CollegesModule,
     AdminModule,
     AdminSettingsModule,
    InstituteModule,
    MarketRadarModule,
    MentorsModule,
    ResumeModule,
    McqsModule,
    WriteXModule,
    UsageModule,
    PreparationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
