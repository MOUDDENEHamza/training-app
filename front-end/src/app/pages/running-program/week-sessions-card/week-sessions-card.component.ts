import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RunningWeek, RunningWeekSession } from '../../../data/models';
import { TrackingService } from '../../../services/tracking.service';
import { parseRepCount } from '../../../utils/rep-count';
import { runningTrackingKey } from '../running-tracking-key';

/**
 * The current week's sessions, as the fast way into the rep counter.
 * Presentational apart from reading progress: it emits the session to count and
 * lets the page own the counter itself.
 */
@Component({
  selector: 'app-week-sessions-card',
  standalone: true,
  templateUrl: './week-sessions-card.component.html',
  styleUrl: './week-sessions-card.component.scss',
})
export class WeekSessionsCardComponent {
  @Input({ required: true }) phaseId!: string;
  @Input({ required: true }) week!: RunningWeek;
  @Input() todaysLabel: string | null = null;

  @Output() count = new EventEmitter<RunningWeekSession>();

  private readonly tracking = inject(TrackingService);

  repCount(content: string): number | null {
    return parseRepCount(content);
  }

  doneReps(label: string): number {
    return this.tracking.entry(runningTrackingKey(this.phaseId, this.week.id, label)).reps ?? 0;
  }
}
