import { Component, Input } from '@angular/core';

export type IconName =
  | 'chevron-right'
  | 'calendar'
  | 'dumbbell'
  | 'waves'
  | 'trending-up'
  | 'running'
  | 'check-circle'
  | 'home';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      @switch (name) {
        @case ('chevron-right') {
          <path d="M9 6l6 6-6 6" />
        }
        @case ('calendar') {
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="8" y1="3" x2="8" y2="7" />
          <line x1="16" y1="3" x2="16" y2="7" />
        }
        @case ('dumbbell') {
          <rect x="2" y="9" width="4" height="6" rx="1" />
          <rect x="18" y="9" width="4" height="6" rx="1" />
          <line x1="6" y1="12" x2="18" y2="12" />
        }
        @case ('waves') {
          <path d="M2 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0 4-2 6 0" />
          <path d="M2 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0 4-2 6 0" />
        }
        @case ('trending-up') {
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M15 7h6v6" />
        }
        @case ('running') {
          <g fill="currentColor" stroke="none">
            <g transform="rotate(-14 12 12) translate(0 -1)">
              <path
                d="M4 10 L7 7 L9 9 L12 6 L17 10 L22 13 Q21 15.5 18 15.5 L6 15.5 Q4 15.5 4 13 Z"
              />
            </g>
            <rect x="1" y="19" width="8" height="1.6" rx="0.8" />
            <rect x="0" y="21.8" width="12" height="1.6" rx="0.8" />
          </g>
        }
        @case ('check-circle') {
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12l3 3 5-6" />
        }
        @case ('home') {
          <path d="M4 11.5L12 4l8 7.5" />
          <path d="M6 10v9h12v-9" />
          <path d="M10 19v-5h4v5" />
        }
      }
    </svg>
  `,
})
export class IconComponent {
  @Input() name: IconName = 'chevron-right';
  @Input() size = 18;
}
