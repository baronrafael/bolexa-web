import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { MockAuth } from '../../auth/mock-auth';
import { MockDatabase } from '../../../data-access/mock/mock-database';
import { DemoControls } from './demo-controls';

describe('DemoControls', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DemoControls],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('resets demo data back to the seeded mock state', () => {
    const database = TestBed.inject(MockDatabase);
    const auth = TestBed.inject(MockAuth);
    auth.switchRole('scanner');
    database.update((state) => {
      state.orders = [];
      state.events[0].title = 'Changed Event Title';
    });

    const fixture = TestBed.createComponent(DemoControls);
    fixture.detectChanges();

    const demoButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    demoButton.click();
    fixture.detectChanges();

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const resetButton = buttons.find((button) => button.textContent?.includes('Reset demo data'));

    expect(resetButton).toBeTruthy();
    resetButton!.click();
    fixture.detectChanges();

    const state = database.snapshot();
    expect(state.orders).toHaveLength(2);
    expect(state.events[0].title).toBe('Caracas Music Fest');
    expect(auth.currentRole()).toBe('consumer');
    expect(fixture.nativeElement.textContent).not.toContain('Reset demo data');
  });

  it('closes the menu from the close button', () => {
    const fixture = TestBed.createComponent(DemoControls);
    fixture.detectChanges();

    const demoButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    demoButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Script demo 5 min');

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const closeButton = buttons.find((button) => button.textContent?.includes('Cerrar'));

    expect(closeButton).toBeTruthy();
    closeButton!.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Script demo 5 min');
  });
});
