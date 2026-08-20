import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavComponent } from './nav.component';

describe('NavComponent', () => {
  it('renders links to Programme, Course, and Natation', async () => {
    await TestBed.configureTestingModule({
      imports: [NavComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Programme');
    expect(compiled.textContent).toContain('Musculation');
    expect(compiled.textContent).toContain('Course');
    expect(compiled.textContent).toContain('Natation');
  });
});
