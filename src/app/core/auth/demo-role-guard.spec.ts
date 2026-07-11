import { TestBed } from '@angular/core/testing';
import { provideRouter, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { MockAuth } from './mock-auth';
import { demoRoleGuard } from './demo-role-guard';

describe('demoRoleGuard', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('allows matching when the current demo role matches the required role', () => {
    TestBed.inject(MockAuth).switchRole('organizer');

    const result = TestBed.runInInjectionContext(() =>
      demoRoleGuard({ data: { requiredRole: 'organizer' } } as Route, [] as UrlSegment[]),
    );

    expect(result).toBe(true);
  });

  it('redirects to access denied when the current demo role does not match', () => {
    TestBed.inject(MockAuth).switchRole('consumer');

    const result = TestBed.runInInjectionContext(() =>
      demoRoleGuard({ data: { requiredRole: 'scanner' } } as Route, [] as UrlSegment[]),
    );

    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe(
      '/access-denied?requiredRole=scanner',
    );
  });
});
