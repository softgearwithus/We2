import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { College } from './entities/college.entity';
import { CollegeStaff } from './entities/college-staff.entity';
import { StudentCohort } from './entities/student-cohort.entity';
import { CollegeStudent } from './entities/college-student.entity';
import { AdminActivityLog } from '../admin/entities/admin-activity-log.entity';
import { CreateCollegeDto } from './dto/create-college.dto';
import { UpdateCollegeDto } from './dto/update-college.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { User, UserRole } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CollegesService {
  constructor(
    @InjectRepository(College)
    private collegesRepo: Repository<College>,
    @InjectRepository(CollegeStaff)
    private staffRepo: Repository<CollegeStaff>,
    @InjectRepository(StudentCohort)
    private cohortRepo: Repository<StudentCohort>,
    @InjectRepository(CollegeStudent)
    private studentRepo: Repository<CollegeStudent>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(AdminActivityLog)
    private adminLogRepo: Repository<AdminActivityLog>,
  ) {}

  async findAll() {
    return this.collegesRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const college = await this.collegesRepo.findOne({ where: { id } });
    if (!college) throw new NotFoundException('College not found');
    return college;
  }

  async create(payload: CreateCollegeDto) {
    const college = this.collegesRepo.create({
      code: payload.code,
      name: payload.name,
      location: payload.location || null,
      type: payload.type || null,
      years: payload.years || [],
      departments: payload.departments || [],
      adminEmail: payload.adminEmail || null,
      status: 'Active',
      studentCount: 0,
    });
    const saved = await this.collegesRepo.save(college);
    await this.adminLogRepo.save(
      this.adminLogRepo.create({
        actorId: null,
        actorName: 'System',
        action: 'College Created',
        target: saved.name,
        severity: 'info',
      }),
    );
    return saved;
  }

  async update(id: string, payload: UpdateCollegeDto) {
    const college = await this.findOne(id);
    Object.assign(college, {
      name: payload.name ?? college.name,
      code: payload.code ?? college.code,
      location: payload.location ?? college.location,
      type: payload.type ?? college.type,
      years: payload.years ?? college.years,
      departments: payload.departments ?? college.departments,
      adminEmail: payload.adminEmail ?? college.adminEmail,
    });
    const saved = await this.collegesRepo.save(college);
    await this.adminLogRepo.save(
      this.adminLogRepo.create({
        actorId: null,
        actorName: 'System',
        action: 'College Updated',
        target: saved.name,
        severity: 'info',
      }),
    );
    return saved;
  }

  async remove(id: string) {
    const college = await this.findOne(id);
    await this.collegesRepo.remove(college);
    await this.adminLogRepo.save(
      this.adminLogRepo.create({
        actorId: null,
        actorName: 'System',
        action: 'College Deleted',
        target: college.name,
        severity: 'warning',
      }),
    );
    return { success: true };
  }

  async listStaff(collegeId: string) {
    return this.staffRepo.find({
      where: { collegeId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  private generateCredentialId(collegeCode: string, role: string) {
    const suffix =
      role === UserRole.COLLEGE_ADMIN
        ? 'ADM'
        : role === UserRole.MENTOR
          ? 'MTR'
          : 'HOD';
    return `${collegeCode}-${suffix}-${Date.now().toString().slice(-4)}`;
  }

  private generatePassword() {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async addStaff(collegeId: string, payload: CreateStaffDto) {
    const college = await this.findOne(collegeId);
    const role = payload.role as UserRole;
    const tempPassword = this.generatePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    const staff = this.staffRepo.create({
      collegeId,
      name: payload.name,
      email: payload.email.toLowerCase().trim(),
      role,
      roleLabel: payload.roleLabel || payload.role,
      department: payload.department || null,
      year: payload.year || null,
      credentialId: this.generateCredentialId(college.code, role),
      tempPassword,
      isActive: true,
    });
    const saved = await this.staffRepo.save(staff);
    const existingUser = await this.userRepo.findOne({
      where: { email: saved.email },
    });
    if (existingUser) {
      existingUser.collegeId = collegeId;
      existingUser.department = payload.department || null;
      existingUser.year = payload.year || null;
      existingUser.role = role;
      existingUser.credentialId = saved.credentialId;
      await this.userRepo.save(existingUser);
      saved.userId = existingUser.id;
      await this.staffRepo.save(saved);
    } else {
      const createdUser = await this.userRepo.save(
        this.userRepo.create({
          email: saved.email,
          password: hashedPassword,
          role,
          collegeId,
          department: payload.department || null,
          year: payload.year || null,
          credentialId: saved.credentialId,
          subscriptionPlan: 'free',
          subscriptionStatus: 'inactive',
          isActive: true,
        }),
      );
      saved.userId = createdUser.id;
      await this.staffRepo.save(saved);
    }
    await this.adminLogRepo.save(
      this.adminLogRepo.create({
        actorId: null,
        actorName: 'System',
        action: 'Staff Added',
        target: saved.name,
        severity: 'info',
      }),
    );
    return saved;
  }

  async removeStaff(collegeId: string, staffId: string) {
    const staff = await this.staffRepo.findOne({
      where: { id: staffId, collegeId },
    });
    if (!staff) throw new NotFoundException('Staff not found');
    staff.isActive = false;
    const saved = await this.staffRepo.save(staff);
    await this.adminLogRepo.save(
      this.adminLogRepo.create({
        actorId: null,
        actorName: 'System',
        action: 'Staff Deactivated',
        target: saved.name,
        severity: 'warning',
      }),
    );
    return saved;
  }

  async listCohorts(collegeId: string) {
    return this.cohortRepo.find({
      where: { collegeId },
      order: { createdAt: 'DESC' },
    });
  }

  async createCohort(collegeId: string, payload: CreateCohortDto) {
    const college = await this.findOne(collegeId);
    const deptCode = payload.department.slice(0, 3).toUpperCase();
    const cohortCode = `${college.code}-${deptCode}-${payload.year}`;

    const credentials = Array.from({ length: payload.count }).map((_, idx) => {
      const count = String(idx + 1).padStart(3, '0');
      return {
        uid: `${cohortCode}-${count}`,
        password: this.generatePassword(),
      };
    });

    const cohort = this.cohortRepo.create({
      collegeId,
      code: cohortCode,
      year: payload.year,
      department: payload.department,
      count: payload.count,
      credentials,
    });
    const saved = await this.cohortRepo.save(cohort);

    await Promise.all(
      credentials.map(async (credential) => {
        const email = `${credential.uid.toLowerCase()}@student.emble.in`;
        const hashedPassword = await bcrypt.hash(credential.password, 12);
        const existingUser = await this.userRepo.findOne({
          where: [{ credentialId: credential.uid }, { email }],
        });
        if (existingUser) {
          existingUser.collegeId = collegeId;
          existingUser.department = payload.department;
          existingUser.year = payload.year;
          existingUser.role = UserRole.STUDENT;
          existingUser.credentialId = credential.uid;
          if (existingUser.email !== email) {
            existingUser.email = email;
          }
          await this.userRepo.save(existingUser);
          return;
        }

        await this.userRepo.save(
          this.userRepo.create({
            email,
            password: hashedPassword,
            role: UserRole.STUDENT,
            collegeId,
            department: payload.department,
            year: payload.year,
            credentialId: credential.uid,
            subscriptionPlan: 'free',
            subscriptionStatus: 'inactive',
            isActive: true,
          }),
        );
      }),
    );

    college.studentCount = (college.studentCount || 0) + payload.count;
    await this.collegesRepo.save(college);

    await this.adminLogRepo.save(
      this.adminLogRepo.create({
        actorId: null,
        actorName: 'System',
        action: 'Student Cohort Generated',
        target: `${college.name} ${cohort.code}`,
        severity: 'info',
        metadata: { count: payload.count },
      }),
    );

    return saved;
  }

  async getCohortExport(collegeId: string, cohortId: string) {
    const cohort = await this.cohortRepo.findOne({
      where: { id: cohortId, collegeId },
    });
    if (!cohort) throw new NotFoundException('Cohort not found');
    return cohort;
  }

  async deleteCohort(collegeId: string, cohortId: string) {
    const cohort = await this.cohortRepo.findOne({
      where: { id: cohortId, collegeId },
    });
    if (!cohort) throw new NotFoundException('Cohort not found');
    await this.cohortRepo.remove(cohort);
    await this.adminLogRepo.save(
      this.adminLogRepo.create({
        actorId: null,
        actorName: 'System',
        action: 'Student Cohort Deleted',
        target: cohort.code,
        severity: 'warning',
      }),
    );
    return { success: true };
  }

  async getInstituteDashboard(collegeId: string) {
    const college = await this.findOne(collegeId);
    const totalStudents = college.studentCount || 0;
    const placedStudents = await this.studentRepo.count({
      where: { collegeId, status: 'Placed' },
    });
    const placementRate =
      totalStudents > 0
        ? Math.round((placedStudents / totalStudents) * 1000) / 10
        : 0;
    const departmentStats = await this.getDepartmentStats(collegeId);
    return {
      totalStudents,
      placementRate,
      avgPackage: '₹6.5 LPA',
      activeCompanies: 32,
      departmentStats,
      placementChart: [
        { month: 'Jan', placed: 45, offers: 60 },
        { month: 'Feb', placed: 52, offers: 75 },
        { month: 'Mar', placed: 48, offers: 82 },
        { month: 'Apr', placed: 61, offers: 90 },
        { month: 'May', placed: 55, offers: 85 },
        { month: 'Jun', placed: 67, offers: 100 },
        { month: 'Jul', placed: 72, offers: 110 },
      ],
    };
  }

  private async getDepartmentStats(collegeId: string) {
    const students = await this.studentRepo.find({ where: { collegeId } });
    const departments = [...new Set(students.map((s) => s.department))];
    if (!departments.length) {
      return [];
    }
    return departments.map((dept) => {
      const deptStudents = students.filter((s) => s.department === dept);
      const count = deptStudents.length;
      const avgReadiness = count
        ? deptStudents.reduce((acc, s) => acc + s.placementReadiness, 0) / count
        : 0;
      const placedCount = deptStudents.filter(
        (s) => s.status === 'Placed',
      ).length;
      const placementRate = count ? (placedCount / count) * 100 : 0;
      return {
        name: dept,
        studentCount: count,
        avgReadiness: Math.round(avgReadiness),
        placementRate: Math.round(placementRate),
      };
    });
  }

  async getInstituteStudents(
    collegeId: string,
    filters: {
      year?: number;
      department?: string;
      status?: string;
      search?: string;
      scopeDepartment?: string | null;
      scopeYear?: string | null;
    },
  ) {
    const query = this.studentRepo
      .createQueryBuilder('student')
      .where('student.collegeId = :collegeId', { collegeId });
    if (filters.scopeDepartment) {
      query.andWhere('student.department = :scopeDepartment', {
        scopeDepartment: filters.scopeDepartment,
      });
    }
    if (filters.scopeYear) {
      query.andWhere('student.year = :scopeYear', {
        scopeYear: Number(filters.scopeYear),
      });
    }
    if (filters.year) {
      query.andWhere('student.year = :year', { year: filters.year });
    }
    if (filters.department) {
      query.andWhere('student.department = :department', {
        department: filters.department,
      });
    }
    if (filters.status) {
      query.andWhere('student.status = :status', { status: filters.status });
    }
    if (filters.search) {
      query.andWhere('student.name ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }
    const results = await query.getMany();
    if (results.length > 0) {
      return results;
    }

    const placeholder = this.studentRepo.create({
      collegeId,
      uid: `STU-${Date.now().toString().slice(-6)}`,
      name: 'Sample Student',
      department: filters.department || 'Computer Science',
      year: filters.year || 3,
      cgpa: 8.2,
      attendance: 84,
      placementReadiness: 72,
      skills: { coding: 72, aptitude: 68, communication: 70, core: 75 },
      status: filters.status || 'Looking',
    });
    await this.studentRepo.save(placeholder);
    return [placeholder];
  }

  async getInstitutePlacements(collegeId: string) {
    const students = await this.studentRepo.find({ where: { collegeId } });
    const total = students.length || 1;
    const avgCoding =
      students.reduce((acc, s) => acc + (s.skills?.coding || 0), 0) / total;
    const avgAptitude =
      students.reduce((acc, s) => acc + (s.skills?.aptitude || 0), 0) / total;
    const avgCommunication =
      students.reduce((acc, s) => acc + (s.skills?.communication || 0), 0) /
      total;
    const avgCore =
      students.reduce((acc, s) => acc + (s.skills?.core || 0), 0) / total;
    return {
      readiness: {
        coding: Math.round(avgCoding),
        aptitude: Math.round(avgAptitude),
        communication: Math.round(avgCommunication),
        core: Math.round(avgCore),
      },
      resumeQuality: [
        { name: 'High Impact', value: 35, color: '#10b981' },
        { name: 'Good', value: 45, color: '#6366f1' },
        { name: 'Average', value: 15, color: '#f59e0b' },
        { name: 'Needs Work', value: 5, color: '#ef4444' },
      ],
      mockInterviewTrends: [
        { week: 'W1', interviews: 24, avgScore: 65 },
        { week: 'W2', interviews: 35, avgScore: 68 },
        { week: 'W3', interviews: 42, avgScore: 72 },
        { week: 'W4', interviews: 38, avgScore: 70 },
        { week: 'W5', interviews: 55, avgScore: 75 },
        { week: 'W6', interviews: 62, avgScore: 78 },
      ],
    };
  }

  async getInstituteSkills(collegeId: string) {
    return {
      departments: ['Comp Sci', 'Mech', 'Electronics', 'Civil'],
      skills: ['Coding', 'Aptitude', 'Comm', 'Projects', 'Core'],
      data: [
        [85, 70, 65, 80, 75],
        [45, 60, 55, 70, 85],
        [60, 75, 60, 75, 80],
        [40, 55, 50, 65, 80],
      ],
      weakAreas: [
        {
          topic: 'Dynamic Programming',
          domain: 'Coding',
          severity: 'High',
          impacted: 'CS, ECE',
          action: 'Schedule Workshop',
        },
        {
          topic: 'Verbal Reasoning',
          domain: 'Aptitude',
          severity: 'Medium',
          impacted: 'All Depts',
          action: 'Assign Practice Test',
        },
        {
          topic: 'Thermodynamics',
          domain: 'Core',
          severity: 'High',
          impacted: 'Mech',
          action: 'Remedial Classes',
        },
        {
          topic: 'System Design',
          domain: 'Coding',
          severity: 'Medium',
          impacted: 'CS',
          action: 'Guest Lecture',
        },
      ],
    };
  }

  async getInstituteReports(collegeId: string) {
    const students = await this.studentRepo.find({ where: { collegeId } });
    const topStudents = [...students]
      .sort((a, b) => b.placementReadiness - a.placementReadiness)
      .slice(0, 5);
    const departments = [...new Set(students.map((s) => s.department))];
    const deptPerformance = departments
      .map((dept) => {
        const deptStudents = students.filter((s) => s.department === dept);
        const avg =
          deptStudents.reduce((acc, s) => acc + s.placementReadiness, 0) /
          (deptStudents.length || 1);
        return { name: dept, score: Math.round(avg * 10) / 10 };
      })
      .sort((a, b) => b.score - a.score);

    return { topStudents, deptPerformance };
  }
}
