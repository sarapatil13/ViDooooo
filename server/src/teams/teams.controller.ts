import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/firebase-admin.service';

@Controller('api/teams')
@UseGuards(FirebaseAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  async getTeams(@CurrentUser() user: AuthenticatedUser) {
    return this.teamsService.getTeamsForUser(user);
  }

  @Get(':id')
  async getTeam(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.teamsService.getTeamById(id, user);
  }

  @Post()
  async createTeam(
    @Body() body: { name: string; description?: string },
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.teamsService.createTeam(body.name, body.description || '', user);
  }
}
