import { Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { STRENGTH_SESSIONS } from '../../data/strength-sessions.data';
import { ExerciseGroup, StrengthSession } from '../../data/models';
import { TrackingService } from '../../services/tracking.service';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-strength-session-detail',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './strength-session-detail.component.html',
  styleUrl: './strength-session-detail.component.scss',
})
export class StrengthSessionDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly tracking = inject(TrackingService);

  private readonly sessionId: Signal<string> = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('sessionId') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('sessionId') ?? '' }
  );

  readonly session = computed<StrengthSession | undefined>(() => {
    const found = STRENGTH_SESSIONS.find((s) => s.id === this.sessionId());
    if (!found) {
      this.router.navigate(['/']);
    }
    return found;
  });

  groupWeeks(group: ExerciseGroup): string[] {
    const seen: string[] = [];
    for (const exercise of group.exercises) {
      for (const entry of exercise.weeks) {
        if (!seen.includes(entry.week)) {
          seen.push(entry.week);
        }
      }
    }
    return seen;
  }

  plannedValue(group: ExerciseGroup, exerciseId: string, week: string): string | null {
    const exercise = group.exercises.find((e) => e.id === exerciseId);
    return exercise?.weeks.find((w) => w.week === week)?.value ?? null;
  }

  trackingKey(exerciseId: string, week: string): string {
    return `strength:${this.sessionId()}:${exerciseId}:${week}`;
  }

  onActualInput(exerciseId: string, week: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.tracking.setActual(this.trackingKey(exerciseId, week), value);
  }
}
