import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { AuthenticatedUser } from '../auth/firebase-admin.service';

export interface CreateTaskDto {
  title: string;
  description?: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  milestoneId?: string;
  assignee: {
    userId: string;
    name: string;
    email: string;
  };
}

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService
  ) {}

  async getTeamTasks(teamId: string, user: AuthenticatedUser) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team) {
      throw new NotFoundException('Team workspace not found');
    }

    const isMember = team.leadId === user.uid || team.members.some((m) => m.userId === user.uid);
    if (!isMember) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.teamTask.findMany({
      where: { teamId },
      include: {
        checkpoints: { orderBy: { timestamp: 'desc' } },
        milestone: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTeamTask(teamId: string, dto: CreateTaskDto, user: AuthenticatedUser) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team) {
      throw new NotFoundException('Team workspace not found');
    }

    if (team.leadId !== user.uid) {
      throw new ForbiddenException('Permission denied: Only the Team Lead can assign tasks');
    }

    const task = await this.prisma.teamTask.create({
      data: {
        teamId,
        title: dto.title.trim(),
        description: dto.description?.trim() || '',
        deadline: dto.deadline,
        priority: dto.priority,
        milestoneId: dto.milestoneId || null,
        assigneeId: dto.assignee.userId,
        assigneeName: dto.assignee.name,
        assigneeEmail: dto.assignee.email,
        leadId: team.leadId,
        status: 'active',
        progress: 0,
      },
      include: {
        checkpoints: true,
        milestone: true,
      },
    });

    this.events.broadcast({
      type: 'task.created',
      payload: task,
    });

    return task;
  }

  async updateTaskProgress(
    taskId: string,
    progress: number,
    checkpointNote: string | undefined,
    user: AuthenticatedUser
  ) {
    const task = await this.prisma.teamTask.findUnique({
      where: { id: taskId },
      include: { team: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const isAssignee = task.assigneeId === user.uid;
    const isLead = task.leadId === user.uid || task.team.leadId === user.uid;

    if (!isAssignee && !isLead) {
      throw new ForbiddenException('Permission denied: Only the assigned member or Team Lead can update task progress');
    }

    const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));
    const isNowCompleted = clampedProgress === 100;

    const updated = await this.prisma.teamTask.update({
      where: { id: taskId },
      data: {
        progress: clampedProgress,
        status: isNowCompleted ? 'completed' : 'active',
        completedAt: isNowCompleted ? new Date() : null,
        ...(checkpointNote && checkpointNote.trim()
          ? {
              checkpoints: {
                create: {
                  authorId: user.uid,
                  authorName: user.name,
                  progress: clampedProgress,
                  note: checkpointNote.trim(),
                },
              },
            }
          : {}),
      },
      include: {
        checkpoints: { orderBy: { timestamp: 'desc' } },
        milestone: true,
      },
    });

    this.events.broadcast({
      type: 'task.updated',
      payload: updated,
    });

    return updated;
  }
}
