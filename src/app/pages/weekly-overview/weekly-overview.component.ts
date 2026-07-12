import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WEEK_PLAN } from '../../data/week-plan.data';
import { SEASON_OVERVIEW } from '../../data/season-overview.data';
import { RACE_DATE } from '../../data/running-program.data';
import { DayName } from '../../data/models';
import { daysUntil } from '../../utils/program-progress';
import { IconComponent } from '../../shared/icon/icon.component';

const DAY_NAMES_BY_JS_INDEX: DayName[] = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];

@Component({
  selector: 'app-weekly-overview',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './weekly-overview.component.html',
  styleUrl: './weekly-overview.component.scss',
})
export class WeeklyOverviewComponent {
  readonly weekPlan = WEEK_PLAN;
  readonly seasonOverview = SEASON_OVERVIEW;
  readonly today: DayName = DAY_NAMES_BY_JS_INDEX[new Date().getDay()];

  readonly strengthCount = this.weekPlan.filter((d) => d.strengthSessionId).length;
  readonly runningCount = this.weekPlan.filter((d) => d.cardio?.running).length;
  readonly swimmingCount = this.weekPlan.filter((d) => d.cardio?.swimming).length;
  readonly daysToRace = daysUntil(RACE_DATE);
}
