import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { UserRole } from '../../data-access/models';
import { MockAuth } from './mock-auth';

export const demoRoleGuard: CanMatchFn = (route) => {
  const requiredRole = route.data?.['requiredRole'] as UserRole | undefined;

  if (!requiredRole || inject(MockAuth).hasRole(requiredRole)) {
    return true;
  }

  return inject(Router).createUrlTree(['/access-denied'], {
    queryParams: { requiredRole },
  });
};
