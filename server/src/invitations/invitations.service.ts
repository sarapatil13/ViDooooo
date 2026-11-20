import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { AuthenticatedUser } from '../auth/firebase-admin.service';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService
  ) {}

  async getPendingInvitations(user: AuthenticatedUser) {
    return this.prisma.teamInvitation.findMany({
      where: {
        inviteeEmail: user.email.toLowerCase(),
        status: 'pending',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInvitation(teamId: string, inviteeEmail: string, user: AuthenticatedUser) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team) {
      throw new NotFoundException('Team workspace not found');
    }

    if (team.leadId !== user.uid) {
      throw new ForbiddenException('Permission denied: Only the Team Lead can invite members');
    }

    const normalizedEmail = inviteeEmail.trim().toLowerCase();

    // Check if already a member
    if (team.members.some((m) => m.email.toLowerCase() === normalizedEmail)) {
      throw new BadRequestException('This user is already a member of the team');
    }

    // Check if pending invitation exists
    const existing = await this.prisma.teamInvitation.findFirst({
      where: {
        teamId,
        inviteeEmail: normalizedEmail,
        status: 'pending',
      },
    });

    if (existing) {
      throw new BadRequestException('An invitation is already pending for this email');
    }

    const invitation = await this.prisma.teamInvitation.create({
      data: {
        teamId,
        teamName: team.name,
        inviterId: user.uid,
        inviterName: user.name,
        inviterEmail: user.email,
        inviteeEmail: normalizedEmail,
        status: 'pending',
      },
    });

    this.events.broadcast({
      type: 'invitation.created',
      payload: invitation,
    });

    return invitation;
  }

  async respondToInvitation(
    invitationId: string,
    accept: boolean,
    user: AuthenticatedUser
  ) {
    const invite = await this.prisma.teamInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }

    if (invite.inviteeEmail.toLowerCase() !== user.email.toLowerCase()) {
      throw new ForbiddenException('You cannot respond to an invitation for another user');
    }

    if (invite.status !== 'pending') {
      throw new BadRequestException(`Invitation is already ${invite.status}`);
    }

    const updated = await this.prisma.teamInvitation.update({
      where: { id: invitationId },
      data: {
        status: accept ? 'accepted' : 'rejected',
      },
    });

    if (accept) {
      // Add member to team
      await this.prisma.teamMember.upsert({
        where: {
          teamId_userId: {
            teamId: invite.teamId,
            userId: user.uid,
          },
        },
        create: {
          teamId: invite.teamId,
          userId: user.uid,
          email: user.email,
          name: user.name,
          role: 'member',
        },
        update: {},
      });
    }

    this.events.broadcast({
      type: 'invitation.responded',
      payload: {
        invitation: updated,
        accepted: accept,
        user,
      },
    });

    return updated;
  }
}
