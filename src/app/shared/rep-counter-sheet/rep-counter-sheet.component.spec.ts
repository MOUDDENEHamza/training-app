import { TestBed } from '@angular/core/testing';
import { RepCounterSheetComponent } from './rep-counter-sheet.component';

describe('RepCounterSheetComponent', () => {
  async function setup(count: number, total: number) {
    await TestBed.configureTestingModule({
      imports: [RepCounterSheetComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(RepCounterSheetComponent);
    fixture.componentInstance.label = 'Séance 2 – Qualité (mercredi/jeudi)';
    fixture.componentInstance.detail = "5×1000 m à 4'00 récup 1'30";
    fixture.componentInstance.total = total;
    fixture.componentInstance.count = count;
    fixture.detectChanges();
    return fixture;
  }

  it('renders the label, the detail and the count against the total', async () => {
    const fixture = await setup(3, 5);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Séance 2 – Qualité (mercredi/jeudi)');
    expect(text).toContain("5×1000 m à 4'00 récup 1'30");
    expect(fixture.nativeElement.querySelector('.sheet__count-done').textContent.trim()).toBe('3');
    expect(text).toContain('/ 5');
  });

  it('emits increment when the primary button is pressed', async () => {
    const fixture = await setup(2, 5);
    let emitted = false;
    fixture.componentInstance.increment.subscribe(() => (emitted = true));
    fixture.nativeElement.querySelector('.sheet__primary').click();
    expect(emitted).toBeTrue();
  });

  it('disables the primary button once every repetition is done', async () => {
    const fixture = await setup(5, 5);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.sheet__primary');
    expect(button.disabled).toBeTrue();
    expect(button.textContent).toContain('Séance terminée');
  });

  it('emits undo when the undo button is pressed', async () => {
    const fixture = await setup(2, 5);
    let emitted = false;
    fixture.componentInstance.undo.subscribe(() => (emitted = true));
    fixture.nativeElement.querySelector('.sheet__undo').click();
    expect(emitted).toBeTrue();
  });

  it('disables undo when no repetition has been done yet', async () => {
    const fixture = await setup(0, 5);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.sheet__undo');
    expect(button.disabled).toBeTrue();
  });

  it('emits closed when the backdrop is clicked', async () => {
    const fixture = await setup(1, 5);
    let emitted = false;
    fixture.componentInstance.closed.subscribe(() => (emitted = true));
    fixture.nativeElement.querySelector('.sheet-backdrop').click();
    expect(emitted).toBeTrue();
  });
});
