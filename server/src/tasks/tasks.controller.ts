import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TasksService, CreateTaskDto } from './tasks.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/firebase-admin.service';

@Controller('api')
@UseGuards(FirebaseAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('teams/:teamId/tasks')
  async getTeamTasks(
    @Param('teamId') teamId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.tasksService.getTeamTasks(teamId, user);
  }

  @Post('teams/:teamId/tasks')
  async createTeamTask(
    @Param('teamId') teamId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.tasksService.createTeamTask(teamId, dto, user);
  }

  @Patch('tasks/:id/progress')
  async updateProgress(
    @Param('id') id: string,
    @Body() body: { progress: number; checkpointNote?: string },
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.tasksService.updateTaskProgress(
      id,
      body.progress,
      body.checkpointNote,
      user
    );
  }
}
