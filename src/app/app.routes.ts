import { Routes } from '@angular/router';
import { appLabels } from './core/content/app-labels';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/layout/public-shell/public-shell').then((m) => m.PublicShell),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/consumer/home/home').then((m) => m.Home),
      },
      {
        path: 'events',
        loadComponent: () => import('./features/consumer/events-list/events-list').then((m) => m.EventsList),
        data: appLabels.routes.eventsList,
      },
      {
        path: 'events/:eventSlug',
        loadComponent: () => import('./features/consumer/event-detail/event-detail').then((m) => m.EventDetail),
        data: appLabels.routes.eventDetail,
      },
      {
        path: 'checkout/:eventId',
        loadComponent: () => import('./features/consumer/checkout-page/checkout-page').then((m) => m.CheckoutPage),
        data: appLabels.routes.checkout,
      },
      {
        path: 'checkout/:eventId/confirmation/:orderId',
        loadComponent: () => import('./features/consumer/confirmation/confirmation').then((m) => m.Confirmation),
        data: appLabels.routes.confirmation,
      },
      {
        path: 'my-tickets',
        loadComponent: () => import('./features/consumer/my-tickets/my-tickets').then((m) => m.MyTickets),
        data: appLabels.routes.myTickets,
      },
      {
        path: 'my-tickets/:ticketId',
        loadComponent: () => import('./features/consumer/ticket-detail/ticket-detail').then((m) => m.TicketDetail),
        data: appLabels.routes.ticketDetail,
      },
      {
        path: 'profile',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: appLabels.routes.profile,
      },
    ],
  },
  {
    path: 'organizer',
    loadComponent: () => import('./core/layout/organizer-shell/organizer-shell').then((m) => m.OrganizerShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/organizer/dashboard/dashboard').then((m) => m.Dashboard),
        data: appLabels.routes.organizerDashboard,
      },
      {
        path: 'events',
        loadComponent: () => import('./features/organizer/events/events').then((m) => m.Events),
        data: appLabels.routes.organizerEvents,
      },
      {
        path: 'events/new',
        loadComponent: () => import('./features/organizer/event-form/event-form').then((m) => m.EventForm),
        data: appLabels.routes.organizerNewEvent,
      },
      {
        path: 'events/:eventId',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: appLabels.routes.organizerEventDetail,
      },
      {
        path: 'events/:eventId/edit',
        loadComponent: () => import('./features/organizer/event-form/event-form').then((m) => m.EventForm),
        data: appLabels.routes.organizerEditEvent,
      },
      {
        path: 'events/:eventId/ticket-types',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: appLabels.routes.organizerTicketTypes,
      },
      {
        path: 'events/:eventId/orders',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: appLabels.routes.organizerOrders,
      },
      {
        path: 'events/:eventId/attendees',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: appLabels.routes.organizerAttendees,
      },
      {
        path: 'events/:eventId/reports',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: appLabels.routes.organizerReports,
      },
    ],
  },
  {
    path: 'scan',
    loadComponent: () => import('./core/layout/scanner-shell/scanner-shell').then((m) => m.ScannerShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'events' },
      {
        path: 'events',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: appLabels.routes.scannerEvents,
      },
      {
        path: 'events/:eventId',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: appLabels.routes.scannerEventSummary,
      },
      {
        path: 'events/:eventId/scanner',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: appLabels.routes.scannerPage,
      },
      {
        path: 'events/:eventId/attendees',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: appLabels.routes.scannerAttendees,
      },
      {
        path: 'events/:eventId/stats',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: appLabels.routes.scannerStats,
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./shared/ui/not-found/not-found').then((m) => m.NotFound),
  },
];
