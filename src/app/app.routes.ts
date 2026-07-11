import { Routes } from '@angular/router';
import { demoRoleGuard } from './core/auth/demo-role-guard';
import { appLabels } from './core/content/app-labels';

const routeMetadata = {
  home: { title: 'Bolexa | Tickets para Venezuela' },
  eventsList: { title: 'Eventos | Bolexa', data: appLabels.routes.eventsList },
  eventDetail: { title: 'Detalle de evento | Bolexa', data: appLabels.routes.eventDetail },
  checkout: { title: 'Checkout | Bolexa', data: appLabels.routes.checkout },
  confirmation: { title: 'Confirmacion | Bolexa', data: appLabels.routes.confirmation },
  myTickets: { title: 'Mis tickets | Bolexa', data: appLabels.routes.myTickets },
  ticketDetail: { title: 'Ticket QR | Bolexa', data: appLabels.routes.ticketDetail },
  profile: { title: 'Perfil | Bolexa', data: appLabels.routes.profile },
  sell: { title: 'Vende tu evento | Bolexa', data: appLabels.routes.sell },
  accessDenied: { title: 'Acceso denegado | Bolexa' },
  organizerShell: { data: { requiredRole: 'organizer' } },
  organizerDashboard: {
    title: 'Dashboard organizador | Bolexa',
    data: appLabels.routes.organizerDashboard,
  },
  organizerEvents: {
    title: 'Eventos organizador | Bolexa',
    data: appLabels.routes.organizerEvents,
  },
  organizerNewEvent: { title: 'Crear evento | Bolexa', data: appLabels.routes.organizerNewEvent },
  organizerEventDetail: {
    title: 'Evento organizador | Bolexa',
    data: appLabels.routes.organizerEventDetail,
  },
  organizerEditEvent: {
    title: 'Editar evento | Bolexa',
    data: appLabels.routes.organizerEditEvent,
  },
  organizerTicketTypes: {
    title: 'Tipos de ticket | Bolexa',
    data: appLabels.routes.organizerTicketTypes,
  },
  organizerOrders: { title: 'Ordenes | Bolexa', data: appLabels.routes.organizerOrders },
  organizerAttendees: { title: 'Asistentes | Bolexa', data: appLabels.routes.organizerAttendees },
  organizerReports: { title: 'Reportes | Bolexa', data: appLabels.routes.organizerReports },
  scannerShell: { data: { requiredRole: 'scanner' } },
  scannerEvents: { title: 'Eventos scanner | Bolexa', data: appLabels.routes.scannerEvents },
  scannerEventSummary: {
    title: 'Resumen scanner | Bolexa',
    data: appLabels.routes.scannerEventSummary,
  },
  scannerPage: { title: 'Scanner QR | Bolexa', data: appLabels.routes.scannerPage },
  scannerAttendees: { title: 'Busqueda manual | Bolexa', data: appLabels.routes.scannerAttendees },
  scannerStats: { title: 'Stats scanner | Bolexa', data: appLabels.routes.scannerStats },
  notFound: { title: 'Pagina no encontrada | Bolexa' },
} as const;

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/public-shell/public-shell').then((m) => m.PublicShell),
    children: [
      {
        path: '',
        title: routeMetadata.home.title,
        loadComponent: () => import('./features/consumer/home/home').then((m) => m.Home),
      },
      {
        path: 'events',
        title: routeMetadata.eventsList.title,
        loadComponent: () =>
          import('./features/consumer/events-list/events-list').then((m) => m.EventsList),
        data: routeMetadata.eventsList.data,
      },
      {
        path: 'events/:eventSlug',
        title: routeMetadata.eventDetail.title,
        loadComponent: () =>
          import('./features/consumer/event-detail/event-detail').then((m) => m.EventDetail),
        data: routeMetadata.eventDetail.data,
      },
      {
        path: 'checkout/:eventId',
        title: routeMetadata.checkout.title,
        canMatch: [demoRoleGuard],
        data: { requiredRole: 'consumer', ...routeMetadata.checkout.data },
        loadComponent: () =>
          import('./features/consumer/checkout-page/checkout-page').then((m) => m.CheckoutPage),
      },
      {
        path: 'checkout/:eventId/confirmation/:orderId',
        title: routeMetadata.confirmation.title,
        canMatch: [demoRoleGuard],
        data: { requiredRole: 'consumer', ...routeMetadata.confirmation.data },
        loadComponent: () =>
          import('./features/consumer/confirmation/confirmation').then((m) => m.Confirmation),
      },
      {
        path: 'my-tickets',
        title: routeMetadata.myTickets.title,
        canMatch: [demoRoleGuard],
        data: { requiredRole: 'consumer', ...routeMetadata.myTickets.data },
        loadComponent: () =>
          import('./features/consumer/my-tickets/my-tickets').then((m) => m.MyTickets),
      },
      {
        path: 'my-tickets/:ticketId',
        title: routeMetadata.ticketDetail.title,
        canMatch: [demoRoleGuard],
        data: { requiredRole: 'consumer', ...routeMetadata.ticketDetail.data },
        loadComponent: () =>
          import('./features/consumer/ticket-detail/ticket-detail').then((m) => m.TicketDetail),
      },
      {
        path: 'profile',
        title: routeMetadata.profile.title,
        loadComponent: () =>
          import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: routeMetadata.profile.data,
      },
      {
        path: 'sell',
        title: routeMetadata.sell.title,
        loadComponent: () =>
          import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: routeMetadata.sell.data,
      },
      {
        path: 'access-denied',
        title: routeMetadata.accessDenied.title,
        loadComponent: () =>
          import('./shared/ui/access-denied/access-denied').then((m) => m.AccessDenied),
      },
    ],
  },
  {
    path: 'organizer',
    canMatch: [demoRoleGuard],
    data: routeMetadata.organizerShell.data,
    loadComponent: () =>
      import('./core/layout/organizer-shell/organizer-shell').then((m) => m.OrganizerShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: routeMetadata.organizerDashboard.title,
        loadComponent: () =>
          import('./features/organizer/dashboard/dashboard').then((m) => m.Dashboard),
        data: routeMetadata.organizerDashboard.data,
      },
      {
        path: 'events',
        title: routeMetadata.organizerEvents.title,
        loadComponent: () => import('./features/organizer/events/events').then((m) => m.Events),
        data: routeMetadata.organizerEvents.data,
      },
      {
        path: 'events/new',
        title: routeMetadata.organizerNewEvent.title,
        loadComponent: () =>
          import('./features/organizer/event-form/event-form').then((m) => m.EventForm),
        data: routeMetadata.organizerNewEvent.data,
      },
      {
        path: 'events/:eventId',
        title: routeMetadata.organizerEventDetail.title,
        loadComponent: () =>
          import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: routeMetadata.organizerEventDetail.data,
      },
      {
        path: 'events/:eventId/edit',
        title: routeMetadata.organizerEditEvent.title,
        loadComponent: () =>
          import('./features/organizer/event-form/event-form').then((m) => m.EventForm),
        data: routeMetadata.organizerEditEvent.data,
      },
      {
        path: 'events/:eventId/ticket-types',
        title: routeMetadata.organizerTicketTypes.title,
        loadComponent: () =>
          import('./features/organizer/ticket-types/ticket-types').then((m) => m.TicketTypes),
        data: routeMetadata.organizerTicketTypes.data,
      },
      {
        path: 'events/:eventId/orders',
        title: routeMetadata.organizerOrders.title,
        loadComponent: () => import('./features/organizer/orders/orders').then((m) => m.Orders),
        data: routeMetadata.organizerOrders.data,
      },
      {
        path: 'events/:eventId/attendees',
        title: routeMetadata.organizerAttendees.title,
        loadComponent: () =>
          import('./features/organizer/attendees/attendees').then((m) => m.Attendees),
        data: routeMetadata.organizerAttendees.data,
      },
      {
        path: 'events/:eventId/reports',
        title: routeMetadata.organizerReports.title,
        loadComponent: () => import('./features/organizer/reports/reports').then((m) => m.Reports),
        data: routeMetadata.organizerReports.data,
      },
    ],
  },
  {
    path: 'scan',
    canMatch: [demoRoleGuard],
    data: routeMetadata.scannerShell.data,
    loadComponent: () =>
      import('./core/layout/scanner-shell/scanner-shell').then((m) => m.ScannerShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'events' },
      {
        path: 'events',
        title: routeMetadata.scannerEvents.title,
        loadComponent: () => import('./features/scanner/events/events').then((m) => m.Events),
        data: routeMetadata.scannerEvents.data,
      },
      {
        path: 'events/:eventId',
        title: routeMetadata.scannerEventSummary.title,
        loadComponent: () =>
          import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: routeMetadata.scannerEventSummary.data,
      },
      {
        path: 'events/:eventId/scanner',
        title: routeMetadata.scannerPage.title,
        loadComponent: () =>
          import('./features/scanner/scanner-page/scanner-page').then((m) => m.ScannerPage),
        data: routeMetadata.scannerPage.data,
      },
      {
        path: 'events/:eventId/attendees',
        title: routeMetadata.scannerAttendees.title,
        loadComponent: () =>
          import('./features/scanner/attendees/attendees').then((m) => m.Attendees),
        data: routeMetadata.scannerAttendees.data,
      },
      {
        path: 'events/:eventId/stats',
        title: routeMetadata.scannerStats.title,
        loadComponent: () => import('./features/scanner/stats/stats').then((m) => m.Stats),
        data: routeMetadata.scannerStats.data,
      },
    ],
  },
  {
    path: '**',
    title: routeMetadata.notFound.title,
    loadComponent: () => import('./shared/ui/not-found/not-found').then((m) => m.NotFound),
  },
];
