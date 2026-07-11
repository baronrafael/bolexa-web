import { UserRole } from '../../data-access/models';

export type AppArea = Exclude<UserRole, 'admin'>;

export const DEFAULT_ROUTE_BY_ROLE: Record<UserRole, string> = {
  consumer: '/events',
  organizer: '/organizer/dashboard',
  scanner: '/scan/events',
  admin: '/',
};

export const APP_AREAS: AppArea[] = ['consumer', 'organizer', 'scanner'];
