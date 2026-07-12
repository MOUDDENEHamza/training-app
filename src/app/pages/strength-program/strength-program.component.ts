import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  STRENGTH_SESSIONS,
  STRENGTH_PRINCIPLES,
  STRENGTH_NOTES,
  TRACTION_PROGRESSION,
} from '../../data/strength-sessions.data';
import { WEEK_PLAN } from '../../data/week-plan.data';
import { nextStrengthSession } from '../../utils/program-progress';
import { IconComponent } from '../../shared/icon/icon.component';

function totalWeeks(durations: string[]): number {
  return durations.reduce((sum, d) => sum + (parseInt(d, 10) || 0), 0);
}

@Component({
  selector: 'app-strength-program',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './strength-program.component.html',
  styleUrl: './strength-program.component.scss',
})
export class StrengthProgramComponent {
  readonly sessions = STRENGTH_SESSIONS;
  readonly principles = STRENGTH_PRINCIPLES;
  readonly notes = STRENGTH_NOTES;
  readonly tractionProgression = TRACTION_PROGRESSION;

  readonly nextSession = nextStrengthSession(WEEK_PLAN);
  readonly tractionTotalWeeks = totalWeeks(TRACTION_PROGRESSION.map((p) => p.duree));
}
