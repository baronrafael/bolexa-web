import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { DemoRoleSwitcher } from './demo-role-switcher';
import { MockAuth } from '../mock-auth';

describe('DemoRoleSwitcher', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DemoRoleSwitcher],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('closes the menu and navigates after selecting an area', async () => {
    const fixture = TestBed.createComponent(DemoRoleSwitcher);
    const auth = TestBed.inject(MockAuth);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Carlos Entrada');

    const options = Array.from(
      fixture.nativeElement.querySelectorAll('[role="menuitemradio"]'),
    ) as HTMLButtonElement[];
    const scannerOption = options.find((option) => option.textContent?.includes('Scanner'));

    expect(scannerOption).toBeTruthy();
    scannerOption!.click();
    fixture.detectChanges();

    expect(auth.currentRole()).toBe('scanner');
    expect(navigateSpy).toHaveBeenCalledWith('/scan/events');
    expect(fixture.nativeElement.querySelector('[role="menuitemradio"]')).toBeNull();
  });
});
