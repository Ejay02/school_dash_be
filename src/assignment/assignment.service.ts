import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAssignmentInput } from './input/create.assignment.input';
import { EditAssignmentInput } from './input/edit.assignment.input';
import { Roles } from 'src/shared/enum/role';
import { Server } from 'socket.io';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import {
  PaginatedResponse,
  PaginationParams,
} from 'src/shared/pagination/types/pagination.types';
import { PrismaQueryBuilder } from 'src/shared/pagination/utils/prisma.pagination';

@Injectable()
@WebSocketGateway()
export class AssignmentService {
  constructor(private prisma: PrismaService) {}
  @WebSocketServer()
  private readonly server: Server;

  async getAllAssignments(
    userId: string,
    role: Roles,
    params: PaginationParams,
  ): Promise<PaginatedResponse<any>> {
    try {
      let baseQuery: any = {};

      // Admin and super admin can see all assignments with full details
      if ([Roles.SUPER_ADMIN, Roles.ADMIN].includes(role)) {
        baseQuery = {
          include: {
            teacher: true,
            subject: true,
            class: true,
            submissions: true,
          },
        };
      }

      // Teachers can only see assignments they created
      else if (role === Roles.TEACHER) {
        baseQuery = {
          where: {
            teacherId: userId,
          },
          include: {
            teacher: true,
            subject: true,
            class: true,
            submissions: true,
          },
        };
      }

      // Students can only see assignments for their class
      else if (role === Roles.STUDENT) {
        const student = await this.prisma.student.findUnique({
          where: { id: userId },
          select: { classId: true },
        });

        if (!student) {
          throw new NotFoundException('Student not found');
        }

        baseQuery = {
          where: {
            classId: student.classId,
          },
          include: {
            teacher: true,
            subject: true,
            class: true,
            submissions: {
              where: {
                studentId: userId,
              },
            },
          },
        };
      }

      // Parents can see limited assignment information for their children
      else if (role === Roles.PARENT) {
        const children = await this.prisma.student.findMany({
          where: { parentId: userId },
          select: {
            id: true,
            classId: true,
          },
        });

        if (!children.length) {
          throw new NotFoundException('No children found for this parent');
        }

        const childrenClassIds = children.map((child) => child.classId);
        const childrenIds = children.map((child) => child.id);

        baseQuery = {
          where: {
            classId: {
              in: childrenClassIds,
            },
          },
          select: {
            id: true,
            title: true,
            startDate: true,
            dueDate: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
            submissions: {
              where: {
                studentId: {
                  in: childrenIds,
                },
              },
              select: {
                status: true,
                submissionDate: true,
                studentId: true,
              },
            },
          },
        };
      } else {
        throw new ForbiddenException(
          'You do not have permission to view assignments',
        );
      }

      // Define searchable fields
      const searchFields = ['title', 'description'];

      // Use the PrismaQueryBuilder to handle pagination and search
      return await PrismaQueryBuilder.paginateResponse(
        this.prisma.assignment,
        baseQuery,
        params,
        searchFields,
      );
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException('Failed to fetch assignments');
    }
  }

  async getAssignmentById(assignmentId: string) {
    try {
      return await this.prisma.assignment.findUnique({
        where: {
          id: assignmentId,
        },
        include: {
          results: true,
          submissions: true,
        },
      });
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException('Failed to fetch assignment');
    }
  }

  async createAssignment(teacherId: string, input: CreateAssignmentInput) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const subject = await tx.subject.findFirst({
          where: {
            id: input.subjectId,
            classId: input.classId,
          },
        });

        if (!subject) {
          throw new NotFoundException('Subject not found in this class');
        }

        // check for dupe
        const existintAssignment = await tx.assignment.findFirst({
          where: {
            title: input.title,
          },
        });

        if (existintAssignment) {
          throw new ConflictException(
            `Assignment with this title: ${input.title} already exists`,
          );
        }

        this.server.emit('createAssignment', {
          message: 'A new assignment has been created!',
          // assignment: newAssignment,
        });

        return await tx.assignment.create({
          data: {
            title: input.title,
            startDate: new Date(input.startDate),
            dueDate: new Date(input.dueDate),
            lessonId: input.lessonId,
            teacherId,
            subjectId: input.subjectId,
            classId: input.classId,
          },
        });
      });
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException('Failed to create assignment');
    }
  }

  async editAssignment(
    assignmentId: string,
    userId: string,
    userRole: Roles,
    editAssignmentInput: EditAssignmentInput,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const assignment = await tx.assignment.findUnique({
          where: {
            id: assignmentId,
          },
          include: {
            teacher: true,
            subject: true,
            class: true,
            lesson: true,
          },
        });

        if (!assignment) {
          throw new NotFoundException('Assignment not found');
        }

        // If user is a teacher, verify they are assigned to the class
        if (userRole === Roles.TEACHER) {
          const teacher = await tx.teacher.findFirst({
            where: { id: userId },
            select: { id: true },
          });

          if (!teacher) {
            throw new ForbiddenException('Teacher not found');
          }

          if (assignment.teacher?.id !== teacher.id) {
            throw new ForbiddenException(
              'You can only edit your own assignments',
            );
          }
        }

        const editData: any = {
          title: editAssignmentInput.title,
          startDate: new Date(editAssignmentInput.startDate),
          dueDate: new Date(editAssignmentInput.dueDate),
          lessonId: editAssignmentInput.lessonId,
          subjectId: editAssignmentInput.subjectId,
          classId: editAssignmentInput.classId,
        };

        // Update the assignment with the provided data
        return await tx.assignment.update({
          where: { id: assignmentId },
          data: editData,
          include: {
            subject: true,
            class: true,
            teacher: true,
            lesson: true,
            results: true,
            submissions: true,
          },
        });
      });
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to edit assignment');
    }
  }
}
