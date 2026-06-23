import { Routes } from '@angular/router';

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
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Marketplace',
          title: 'Eventos en Venezuela',
          description: 'Listado publico con busqueda, filtros por ciudad, categoria y fecha.',
        },
      },
      {
        path: 'events/:eventSlug',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Detalle de evento',
          title: 'Evento, tickets y CTA de compra',
          description: 'Pantalla preparada para cargar evento por slug y seleccionar tipos de ticket.',
          primaryLink: '/checkout/event-caracas-music-fest',
          primaryLabel: 'Ir al checkout demo',
        },
      },
      {
        path: 'checkout/:eventId',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Checkout',
          title: 'Pago venezolano simulado',
          description: 'Flujo listo para Pago movil, Zelle, Binance/USDT, transferencia y pago manual.',
          primaryLink: '/checkout/event-caracas-music-fest/confirmation/order-1001',
          primaryLabel: 'Ver confirmacion demo',
        },
      },
      {
        path: 'checkout/:eventId/confirmation/:orderId',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Confirmacion',
          title: 'Orden confirmada',
          description: 'Estado de compra, resumen de tickets y enlace a Mis tickets.',
          primaryLink: '/my-tickets',
          primaryLabel: 'Ver mis tickets',
        },
      },
      {
        path: 'my-tickets',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Mis tickets',
          title: 'Tickets del comprador demo',
          description: 'Listado de tickets validos, usados y futuros del usuario mock.',
          primaryLink: '/my-tickets/ticket-1001',
          primaryLabel: 'Abrir ticket QR demo',
        },
      },
      {
        path: 'my-tickets/:ticketId',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Ticket QR',
          title: 'Ticket oficial Bolexa',
          description: 'Detalle con QR, titular, tipo de ticket, estado e instrucciones de entrada.',
        },
      },
      {
        path: 'profile',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Perfil',
          title: 'Perfil del usuario demo',
          description: 'Datos basicos y preferencias del comprador.',
        },
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
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Organizador',
          title: 'Dashboard de ventas',
          description: 'Metricas de revenue, tickets vendidos, check-ins, eventos proximos y ordenes recientes.',
          primaryLink: '/organizer/events',
          primaryLabel: 'Ver eventos',
        },
      },
      {
        path: 'events',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Organizador',
          title: 'Gestion de eventos',
          description: 'Tabla de eventos con estados, ventas, acciones y acceso a configuracion.',
          primaryLink: '/organizer/events/new',
          primaryLabel: 'Crear evento demo',
        },
      },
      {
        path: 'events/new',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Organizador',
          title: 'Crear evento',
          description: 'Formulario mock para datos basicos, venue, fecha, categoria, cover y estado.',
        },
      },
      {
        path: 'events/:eventId',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Organizador',
          title: 'Detalle operativo del evento',
          description: 'Resumen del evento y accesos a tickets, ordenes, asistentes y reportes.',
        },
      },
      {
        path: 'events/:eventId/edit',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Organizador',
          title: 'Editar evento',
          description: 'Formulario de edicion conectado al mock store.',
        },
      },
      {
        path: 'events/:eventId/ticket-types',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Organizador',
          title: 'Tipos de ticket',
          description: 'Inventario, precios, cantidades y estados de venta.',
        },
      },
      {
        path: 'events/:eventId/orders',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Organizador',
          title: 'Ordenes del evento',
          description: 'Ordenes por comprador, estado, total, metodo de pago y fecha.',
        },
      },
      {
        path: 'events/:eventId/attendees',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Organizador',
          title: 'Asistentes',
          description: 'Listado de asistentes, tipo de ticket, estado de check-in y export CSV.',
        },
      },
      {
        path: 'events/:eventId/reports',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Organizador',
          title: 'Reportes',
          description: 'Revenue, tickets vendidos, pagos y progreso de entrada por evento.',
        },
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
        data: {
          eyebrow: 'Scanner',
          title: 'Seleccion de evento',
          description: 'Lista de eventos asignados con progreso de entrada.',
          primaryLink: '/scan/events/event-caracas-music-fest/scanner',
          primaryLabel: 'Abrir scanner demo',
        },
      },
      {
        path: 'events/:eventId',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Scanner',
          title: 'Resumen de evento',
          description: 'Contexto operativo antes de empezar a validar tickets.',
        },
      },
      {
        path: 'events/:eventId/scanner',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Scanner',
          title: 'Validacion QR',
          description: 'Camara placeholder, input manual de QR y estados valido/usado/invalido.',
        },
      },
      {
        path: 'events/:eventId/attendees',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Scanner',
          title: 'Busqueda manual',
          description: 'Fallback por nombre o email cuando no se puede escanear el QR.',
        },
      },
      {
        path: 'events/:eventId/stats',
        loadComponent: () => import('./shared/ui/route-placeholder/route-placeholder').then((m) => m.RoutePlaceholder),
        data: {
          eyebrow: 'Scanner',
          title: 'Stats de entrada',
          description: 'Total de tickets, ingresados, pendientes y ultimos check-ins.',
        },
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./shared/ui/not-found/not-found').then((m) => m.NotFound),
  },
];
