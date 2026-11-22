import { Controller, Get, Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EventsService } from './events.service';

@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('stream')
  @Sse()
  stream(): Observable<MessageEvent> {
    return this.eventsService.getEventStream();
  }
}
