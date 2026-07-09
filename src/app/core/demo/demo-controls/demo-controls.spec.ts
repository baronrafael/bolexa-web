import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
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
    database.update((state) => {
      state.orders = [];
      state.events[0].title = 'Changed Event Title';
    });

    const fixture = TestBed.createComponent(DemoControls);
    fixture.detectChanges();

    const resetButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    resetButton.click();
    fixture.detectChanges();

    const state = database.snapshot();
    expect(state.orders).toHaveLength(2);
    expect(state.events[0].title).toBe('Caracas Music Fest');
    expect(fixture.nativeElement.textContent).toContain('Data demo reiniciada.');
  });
});
