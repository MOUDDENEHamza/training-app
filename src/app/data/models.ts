export type DayName =
  | 'Lundi'
  | 'Mardi'
  | 'Mercredi'
  | 'Jeudi'
  | 'Vendredi'
  | 'Samedi'
  | 'Dimanche';

export type StrengthTheme = 'red' | 'green' | 'purple' | 'orange';

export interface CardioRef {
  label: string;
  running: boolean;
  swimming: boolean;
}

export interface WeekDay {
  day: DayName;
  strengthSessionId: string | null;
  strengthLabel: string | null;
  cardio: CardioRef | null;
}

export interface WeeklyPrescription {
  week: string;
  value: string;
}

export interface Exercise {
  id: string;
  name: string;
  scheme: string;
  weeks: WeeklyPrescription[];
}

export interface ExerciseGroup {
  title: string;
  exercises: Exercise[];
}

export interface StrengthSession {
  id: string;
  name: string;
  day: DayName;
  theme: StrengthTheme;
  intro: string;
  groups: ExerciseGroup[];
}

export interface TractionPhase {
  phase: string;
  duree: string;
  format: string;
  objectif: string;
}

export interface PaceRow {
  allure: string;
  minKm: string;
  kmh: string;
  usage: string;
}

export interface RunningWeekSession {
  label: string;
  content: string;
}

export interface RunningWeek {
  id: string;
  dateRange: string;
  sessions: RunningWeekSession[];
}

export interface RunningPhase {
  id: string;
  title: string;
  period: string;
  duration: string;
  objective: string;
  columns: string[];
  weeks: RunningWeek[];
}

export interface SplitTarget {
  distance: string;
  time: string;
}

export interface RunningProgram {
  objective: string;
  targetTime: string;
  paces: PaceRow[];
  phases: RunningPhase[];
  raceStrategy: string;
  splitTargets: SplitTarget[];
}

export interface EquipmentItem {
  name: string;
  utility: string;
  priority: string;
}

export interface TechniqueKey {
  title: string;
  description: string;
}

export interface DrillItem {
  name: string;
  description: string;
  goal: string;
}

export interface SwimSeance {
  label: string;
  content: string[];
}

export interface SwimPhase {
  id: string;
  title: string;
  period: string;
  seanceA: SwimSeance;
  seanceB: SwimSeance;
  volume: string;
}

export interface SwimmingProgram {
  equipment: EquipmentItem[];
  techniqueKeys: TechniqueKey[];
  drills: DrillItem[];
  phases: SwimPhase[];
  tips: string[];
}

export interface SeasonOverviewRow {
  period: string;
  running: string;
  swimming: string;
  strength: string;
}
