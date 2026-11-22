import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MilestonesService } from './milestones.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/firebase-admin.service';

@Controller('api')
@UseGuards(FirebaseAuthGuard)
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Get('teams/:teamId/milestones')
  async getMilestones(
    @Param('teamId') teamId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.milestonesService.getMilestones(teamId, user);
  }

  @Post('teams/:teamId/milestones')
  async createMilestone(
    @Param('teamId') teamId: string,
    @Body() body: { title: string; targetDate: string; orderIndex?: number },
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.milestonesService.createMilestone(
      teamId,
      body.title,
      body.targetDate,
      body.orderIndex ?? 0,
      user
    );
  }

  @Patch('milestones/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'completed' | 'active' | 'upcoming',
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.milestonesService.updateMilestoneStatus(id, status, user);
  }
}
