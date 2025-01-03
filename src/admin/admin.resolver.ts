import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AdminService } from './admin.service';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/shared/enum/role';
import { HasRoles } from 'src/shared/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/shared/auth/guards/roles.guard';
import { Student } from 'src/student/types/student.types';
import { Teacher } from 'src/teacher/types/teacher.types';
import { Admin } from './types/admin.types';
import { Parent } from 'src/parent/types/parent.types';
import { Class } from 'src/class/types/class.types';
import { Grade } from 'src/grade/types/grade.types';
import { Attendance } from 'src/attendance/types/attendance.types';
import { Assignment } from 'src/assignment/types/assignment.types';
import { Announcement } from 'src/announcement/types/announcement.types';
import { Exam } from 'src/exam/types/exam.types';
import { JwtAuthGuard } from 'src/shared/auth/guards/jwtAuth.guard';
import { Event } from 'src/event/types/event.types';

@Resolver()
export class AdminResolver {
  constructor(private adminService: AdminService) {}

  @Query(() => [Student])
  @HasRoles(Roles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllStudents(@Context() context) {
    const userId = context.req.user.userId;
    return this.adminService.getAllStudents(userId);
  }

  @Query(() => [Teacher])
  @HasRoles(Roles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllTeachers(@Context() context) {
    const userId = context.req.user.userId;

    return this.adminService.getAllTeachers(userId);
  }

  @Query(() => [Admin])
  @HasRoles(Roles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllAdmins(@Context() context) {
    const userId = context.req.user.userId;
    return this.adminService.getAllAdmins(userId);
  }

  @Query(() => [Parent])
  @HasRoles(Roles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllParents(@Context() context) {
    return this.adminService.getAllParents(context.req.user.userId);
  }

  @Query(() => [Attendance])
  @HasRoles(Roles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllAttendance(@Context() context) {
    return this.adminService.getAllAttendance(context.req.user.userId);
  }

  @Query(() => [Assignment])
  @HasRoles(Roles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllAssignments(@Context() context) {
    return this.adminService.getAllAssignments(context.req.user.userId);
  }

  @Query(() => [Announcement])
  @HasRoles(Roles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllAnnouncements(@Context() context) {
    return this.adminService.getAllAnnouncements(context.req.user.userId);
  }

  @Query(() => [Class])
  @HasRoles(Roles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllClasses(@Context() context) {
    return this.adminService.getAllClasses(context.req.user.userId);
  }

  @Query(() => [Event])
  @HasRoles(Roles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllEvents(@Context() context) {
    return this.adminService.getAllEvents(context.req.user.userId);
  }

  @Query(() => [Exam])
  @HasRoles(Roles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllExams(@Context() context) {
    return this.adminService.getAllExams(context.req.user.userId);
  }

  @Query(() => [Grade])
  @HasRoles(Roles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllGrades(@Context() context) {
    return this.adminService.getAllGrades(context.req.user.userId);
  }

  @Mutation(() => Admin)
  @HasRoles(Roles.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async assignAdminRole(
    @Context() context,
    @Args('targetId') targetId: string,
    @Args('role') role: Roles,
  ) {
    return this.adminService.assignAdminRole(
      context.req.user.userId,
      targetId,
      role,
    );
  }

  @Mutation(() => Boolean)
  @HasRoles(Roles.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteUser(
    @Context() context,
    @Args('targetId') targetId: string,
  ): Promise<boolean> {
    return this.adminService.deleteUser(context.req.user.userId, targetId);
  }
}
