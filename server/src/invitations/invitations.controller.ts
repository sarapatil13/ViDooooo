import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/firebase-admin.service';

@Controller('api')
@UseGuards(FirebaseAuthGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get('invitations/pending')
  async getPendingInvitations(@CurrentUser() user: AuthenticatedUser) {
    return this.invitationsService.getPendingInvitations(user);
  }

  @Post('teams/:teamId/invitations')
  async createInvitation(
    @Param('teamId') teamId: string,
    @Body('inviteeEmail') inviteeEmail: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.invitationsService.createInvitation(teamId, inviteeEmail, user);
  }

  @Post('invitations/:id/respond')
  async respondToInvitation(
    @Param('id') id: string,
    @Body('accept') accept: boolean,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.invitationsService.respondToInvitation(id, accept, user);
  }
}
