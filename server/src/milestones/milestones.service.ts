import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { AuthenticatedUser } from '../auth/firebase-admin.service';

@Injectable()
export class MilestonesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService
  ) {}

  async getMilestones(teamId: string, user: AuthenticatedUser) {
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

    return this.prisma.teamMilestone.findMany({
      where: { teamId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async createMilestone(
    teamId: string,
    title: string,
    targetDate: string,
    orderIndex: number,
    user: AuthenticatedUser
  ) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException('Team workspace not found');
    }

    if (team.leadId !== user.uid) {
      throw new ForbiddenException('Permission denied: Only the Team Lead can create milestones');
    }

    const milestone = await this.prisma.teamMilestone.create({
      data: {
        teamId,
        title: title.trim(),
        targetDate,
        orderIndex,
        status: 'upcoming',
      },
    });

    this.events.broadcast({
      type: 'milestone.created',
      payload: milestone,
    });

    return milestone;
  }

  async updateMilestoneStatus(
    milestoneId: string,
    status: 'completed' | 'active' | 'upcoming',
    user: AuthenticatedUser
  ) {
    const milestone = await this.prisma.teamMilestone.findUnique({
      where: { id: milestoneId },
      include: { team: true },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (milestone.team.leadId !== user.uid) {
      throw new ForbiddenException('Permission denied: Only the Team Lead can modify milestone status');
    }

    const updated = await this.prisma.teamMilestone.update({
      where: { id: milestoneId },
      data: { status },
    });

    this.events.broadcast({
      type: 'milestone.updated',
      payload: updated,
    });

    return updated;
  }
}
