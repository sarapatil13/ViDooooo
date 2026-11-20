import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { AuthenticatedUser } from '../auth/firebase-admin.service';

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService
  ) {}

  async getTeamsForUser(user: AuthenticatedUser) {
    return this.prisma.team.findMany({
      where: {
        OR: [
          { leadId: user.uid },
          { members: { some: { userId: user.uid } } },
        ],
      },
      include: {
        members: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTeamById(teamId: string, user: AuthenticatedUser) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        milestones: { orderBy: { orderIndex: 'asc' } },
        tasks: {
          include: { checkpoints: { orderBy: { timestamp: 'desc' } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team workspace not found');
    }

    const isMember = team.leadId === user.uid || team.members.some((m) => m.userId === user.uid);
    if (!isMember) {
      throw new ForbiddenException('Access denied: You are not a member of this team');
    }

    return team;
  }

  async createTeam(name: string, description: string, user: AuthenticatedUser) {
    const team = await this.prisma.team.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        leadId: user.uid,
        leadEmail: user.email,
        members: {
          create: {
            userId: user.uid,
            email: user.email,
            name: user.name,
            role: 'lead',
          },
        },
      },
      include: {
        members: true,
      },
    });

    this.events.broadcast({
      type: 'team.created',
      payload: team,
    });

    return team;
  }
}
