import { Routes } from '@angular/router';
import { demoRoleGuard } from './core/auth/demo-role-guard';
import { appLabels } from './core/content/app-labels';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/public-shell/public-shell').then((m) => m.PublicShell),
    children: [
      {
        path: '',
        title: 'Bolexa | Tickets para Venezuela',
        loadComponent: () => import('./features/consumer/home/home').then((m) => m.Home),
      },
      {
        path: 'events',
        title: 'Eventos | Bolexa',
        loadComponent: () =>
          import('./features/consumer/events-list/events-list').then((m) => m.EventsList),
        data: appLabels.routes.eventsList,
      },
      {
        path: 'events/:eventSlug',
        title: 'Detalle de evento | Bolexa',
        loadComponent: () =>
          import('./features/consumer/event-detail/event-detail').then((m) => m.EventDetail),
        data: appLabels.routes.eventDetail,
      },
      {
        path: 'checkout/:eventId',
        title: 'Checkout | Bolexa',
        loadComponent: () =>
          import('./features/consumer/checkout-page/checkout-page').then((m) => m.CheckoutPage),
        data: appLabels.routes.checkout,
      },
      {
        path: 'checkout/:eventId/confirmation/:orderId',
        title: 'Confirmacion | Bolexa',
        loadComponent: () =>
          import('./features/consumer/confirmation/confirmation').then((m) => m.Confirmation),
        data: appLabels.routes.confirmation,
      },
      {
        path: 'my-tickets',
        title: 'Mis tickets | Bolexa',
        loadComponent: () =>
          import('./features/consumer/my-tickets/my-tickets').then((m) => m.MyTickets),
        data: appLabels.routes.myTickets,
      },
      {
        path: 'my-tickets/:ticketId',
        title: 'Ticket QR | Bolexa',
        loadComponent: () =>
          import('./features/consumer/ticket-detail/ticket-detail').then((m) => m.TicketDetail),
        data: appLabels.routes.ticketDetail,
      },
      {
        path: 'profile',
        title: 'Perfil | Bolexa',
        loadComponent: () =>
          import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: appLabels.routes.profile,
      },
    ],
  },
  {
    path: 'organizer',
    canMatch: [demoRoleGuard],
    data: { requiredRole: 'organizer' },
    loadComponent: () =>
      import('./core/layout/organizer-shell/organizer-shell').then((m) => m.OrganizerShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard organizador | Bolexa',
        loadComponent: () =>
          import('./features/organizer/dashboard/dashboard').then((m) => m.Dashboard),
        data: appLabels.routes.organizerDashboard,
      },
      {
        path: 'events',
        title: 'Eventos organizador | Bolexa',
        loadComponent: () => import('./features/organizer/events/events').then((m) => m.Events),
        data: appLabels.routes.organizerEvents,
      },
      {
        path: 'events/new',
        title: 'Crear evento | Bolexa',
        loadComponent: () =>
          import('./features/organizer/event-form/event-form').then((m) => m.EventForm),
        data: appLabels.routes.organizerNewEvent,
      },
      {
        path: 'events/:eventId',
        title: 'Evento organizador | Bolexa',
        loadComponent: () =>
          import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: appLabels.routes.organizerEventDetail,
      },
      {
        path: 'events/:eventId/edit',
        title: 'Editar evento | Bolexa',
        loadComponent: () =>
          import('./features/organizer/event-form/event-form').then((m) => m.EventForm),
        data: appLabels.routes.organizerEditEvent,
      },
      {
        path: 'events/:eventId/ticket-types',
        title: 'Tipos de ticket | Bolexa',
        loadComponent: () =>
          import('./features/organizer/ticket-types/ticket-types').then((m) => m.TicketTypes),
        data: appLabels.routes.organizerTicketTypes,
      },
      {
        path: 'events/:eventId/orders',
        title: 'Ordenes | Bolexa',
        loadComponent: () => import('./features/organizer/orders/orders').then((m) => m.Orders),
        data: appLabels.routes.organizerOrders,
      },
      {
        path: 'events/:eventId/attendees',
        title: 'Asistentes | Bolexa',
        loadComponent: () =>
          import('./features/organizer/attendees/attendees').then((m) => m.Attendees),
        data: appLabels.routes.organizerAttendees,
      },
      {
        path: 'events/:eventId/reports',
        title: 'Reportes | Bolexa',
        loadComponent: () => import('./features/organizer/reports/reports').then((m) => m.Reports),
        data: appLabels.routes.organizerReports,
      },
    ],
  },
  {
    path: 'scan',
    canMatch: [demoRoleGuard],
    data: { requiredRole: 'scanner' },
    loadComponent: () =>
      import('./core/layout/scanner-shell/scanner-shell').then((m) => m.ScannerShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'events' },
      {
        path: 'events',
        title: 'Eventos scanner | Bolexa',
        loadComponent: () => import('./features/scanner/events/events').then((m) => m.Events),
        data: appLabels.routes.scannerEvents,
      },
      {
        path: 'events/:eventId',
        title: 'Resumen scanner | Bolexa',
        loadComponent: () =>
          import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: appLabels.routes.scannerEventSummary,
      },
      {
        path: 'events/:eventId/scanner',
        title: 'Scanner QR | Bolexa',
        loadComponent: () =>
          import('./features/scanner/scanner-page/scanner-page').then((m) => m.ScannerPage),
        data: appLabels.routes.scannerPage,
      },
      {
        path: 'events/:eventId/attendees',
        title: 'Busqueda manual | Bolexa',
        loadComponent: () =>
          import('./features/scanner/attendees/attendees').then((m) => m.Attendees),
        data: appLabels.routes.scannerAttendees,
      },
      {
        path: 'events/:eventId/stats',
        title: 'Stats scanner | Bolexa',
        loadComponent: () => import('./features/scanner/stats/stats').then((m) => m.Stats),
        data: appLabels.routes.scannerStats,
      },
    ],
  },
  {
    path: '**',
    title: 'Pagina no encontrada | Bolexa',
    loadComponent: () => import('./shared/ui/not-found/not-found').then((m) => m.NotFound),
  },
];
