import { Injectable, MessageEvent } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AppEvent {
  type: string;
  payload: any;
}

@Injectable()
export class EventsService {
  private readonly events$ = new Subject<AppEvent>();

  broadcast(event: AppEvent): void {
    this.events$.next(event);
  }

  getEventStream(): Observable<MessageEvent> {
    return this.events$.asObservable().pipe(
      map((event) => ({
        data: JSON.stringify(event),
      } as MessageEvent))
    );
  }
}
