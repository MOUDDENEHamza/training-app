import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { WeeklyOverviewComponent } from './weekly-overview.component';

describe('WeeklyOverviewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyOverviewComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders all 7 days of the week', () => {
    const fixture = TestBed.createComponent(WeeklyOverviewComponent);
    fixture.detectChanges();
    const cols = fixture.nativeElement.querySelectorAll('.week-grid .day-col');
    expect(cols.length).toBe(7);
  });

  it('links each strength day to its detail page', () => {
    const fixture = TestBed.createComponent(WeeklyOverviewComponent);
    fixture.detectChanges();
    const links: HTMLAnchorElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('a.tag[href^="/strength/"]')
    );
    expect(links.length).toBe(4);
    expect(links.map((a) => a.getAttribute('href'))).toContain('/strength/pecs-triceps');
  });

  it("highlights exactly today's column, matching the computed day name", () => {
    const fixture = TestBed.createComponent(WeeklyOverviewComponent);
    fixture.detectChanges();
    const todayCols = fixture.nativeElement.querySelectorAll('.week-grid .day-col.is-today');
    expect(todayCols.length).toBe(1);
    expect(todayCols[0].textContent).toContain(fixture.componentInstance.today);
    expect(todayCols[0].textContent).toContain("Aujourd'hui");
  });

  it('links running days to the phases section without opening the counter', () => {
    const fixture = TestBed.createComponent(WeeklyOverviewComponent);
    fixture.detectChanges();

    const links: HTMLAnchorElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.week-grid a.tag--running')
    );
    expect(links.length).toBe(3);

    for (const link of links) {
      const href = link.getAttribute('href') ?? '';
      expect(href).toContain('#phases');
      expect(href).not.toContain('session=today');
    }
  });

  it('shows accurate weekly session counts in the stats row', () => {
    const fixture = TestBed.createComponent(WeeklyOverviewComponent);
    fixture.detectChanges();
    const values: string[] = Array.from(
      fixture.nativeElement.querySelectorAll('.stat-tile__value')
    ).map((el) => (el as HTMLElement).textContent?.trim() ?? '');
    expect(values).toContain('4');
    expect(values).toContain('3');
    expect(values).toContain('2');
  });
});
