import { Routes } from '@angular/router';
import { WeeklyOverviewComponent } from './pages/weekly-overview/weekly-overview.component';
import { StrengthProgramComponent } from './pages/strength-program/strength-program.component';
import { StrengthSessionDetailComponent } from './pages/strength-session-detail/strength-session-detail.component';
import { RunningProgramComponent } from './pages/running-program/running-program.component';
import { SwimmingProgramComponent } from './pages/swimming-program/swimming-program.component';

export const routes: Routes = [
  { path: '', component: WeeklyOverviewComponent },
  { path: 'strength', component: StrengthProgramComponent },
  { path: 'strength/:sessionId', component: StrengthSessionDetailComponent },
  { path: 'running', component: RunningProgramComponent },
  { path: 'swimming', component: SwimmingProgramComponent },
  { path: '**', redirectTo: '' },
];
