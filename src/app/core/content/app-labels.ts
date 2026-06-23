import { UserRole } from '../../data-access/models';

export const appLabels = {
  brand: {
    name: 'Bolexa',
    scannerName: 'Bolexa Scan',
    homeAriaLabel: 'Bolexa home',
  },
  navigation: {
    primaryAriaLabel: 'Principal',
    organizerAriaLabel: 'Organizador',
    organizerMobileAriaLabel: 'Organizador movil',
    scannerAriaLabel: 'Scanner',
    publicLinks: {
      events: 'Eventos',
      myTickets: 'Mis tickets',
      organizer: 'Organizador',
      scanner: 'Scanner',
    },
    organizerLinks: {
      dashboard: 'Dashboard',
      events: 'Eventos',
      orders: 'Ordenes',
      attendees: 'Asistentes',
      reports: 'Reportes',
    },
    scannerLinks: {
      events: 'Eventos',
      scanner: 'Scanner',
      attendees: 'Asistentes',
      stats: 'Stats',
    },
    actions: {
      sellEvent: 'Vende tu evento',
      viewMarketplace: 'Ver marketplace',
    },
  },
  auth: {
    switcherPrefix: 'Entrar como',
    roleLabels: {
      consumer: 'Comprador',
      organizer: 'Organizador',
      scanner: 'Scanner',
      admin: 'Admin',
    } satisfies Record<UserRole, string>,
  },
  shells: {
    organizer: {
      subtitle: 'Portal organizador',
      demoContext: 'Producciones Avila · Demo',
    },
    scanner: {
      mode: 'Modo operativo',
    },
  },
  home: {
    badge: 'MVP demo · Dark mode first',
    headline: 'La boleteria moderna de Venezuela.',
    description: 'Descubre eventos, compra facil y entra rapido con tickets QR. Bolexa conecta compradores, organizadores y equipos de acceso en una sola plataforma.',
    primaryCta: 'Explorar eventos',
    secondaryCta: 'Ver demo organizador',
    stats: [
      {
        value: '3',
        description: 'Superficies: comprador, organizador y scanner.',
      },
      {
        value: 'QR',
        description: 'Tickets validables para entrada rapida.',
      },
      {
        value: 'VE',
        description: 'Pago movil, Zelle, USDT y pagos manuales.',
      },
    ],
    featured: {
      eyebrow: 'Evento destacado',
      from: 'Desde',
      available: 'Disponibles',
      buyCta: 'Comprar tickets',
    },
    statusCards: [
      {
        eyebrow: 'Scanner',
        title: 'Ticket valido',
        tone: 'success',
      },
      {
        eyebrow: 'Ordenes',
        title: 'Pago manual',
        tone: 'warning',
      },
      {
        eyebrow: 'Dashboard',
        title: 'Ventas en vivo',
        tone: 'primary',
      },
    ],
  },
  routePlaceholder: {
    defaults: {
      eyebrow: 'Bolexa MVP',
      title: 'Pantalla en progreso',
      description: 'Esta ruta ya esta conectada y lista para recibir UI final.',
      primaryLink: '/',
      primaryLabel: 'Volver al inicio',
    },
  },
  notFound: {
    code: '404',
    title: 'Ruta no encontrada',
    description: 'Esta pantalla no existe en el MVP de Bolexa.',
    cta: 'Volver al inicio',
  },
  routes: {
    eventsList: {
      eyebrow: 'Marketplace',
      title: 'Eventos en Venezuela',
      description: 'Listado publico con busqueda, filtros por ciudad, categoria y fecha.',
    },
    eventDetail: {
      eyebrow: 'Detalle de evento',
      title: 'Evento, tickets y CTA de compra',
      description: 'Pantalla preparada para cargar evento por slug y seleccionar tipos de ticket.',
      primaryLink: '/checkout/event-caracas-music-fest',
      primaryLabel: 'Ir al checkout demo',
    },
    checkout: {
      eyebrow: 'Checkout',
      title: 'Pago venezolano simulado',
      description: 'Flujo listo para Pago movil, Zelle, Binance/USDT, transferencia y pago manual.',
      primaryLink: '/checkout/event-caracas-music-fest/confirmation/order-1001',
      primaryLabel: 'Ver confirmacion demo',
    },
    confirmation: {
      eyebrow: 'Confirmacion',
      title: 'Orden confirmada',
      description: 'Estado de compra, resumen de tickets y enlace a Mis tickets.',
      primaryLink: '/my-tickets',
      primaryLabel: 'Ver mis tickets',
    },
    myTickets: {
      eyebrow: 'Mis tickets',
      title: 'Tickets del comprador demo',
      description: 'Listado de tickets validos, usados y futuros del usuario mock.',
      primaryLink: '/my-tickets/ticket-1001',
      primaryLabel: 'Abrir ticket QR demo',
    },
    ticketDetail: {
      eyebrow: 'Ticket QR',
      title: 'Ticket oficial Bolexa',
      description: 'Detalle con QR, titular, tipo de ticket, estado e instrucciones de entrada.',
    },
    profile: {
      eyebrow: 'Perfil',
      title: 'Perfil del usuario demo',
      description: 'Datos basicos y preferencias del comprador.',
    },
    organizerDashboard: {
      eyebrow: 'Organizador',
      title: 'Dashboard de ventas',
      description: 'Metricas de revenue, tickets vendidos, check-ins, eventos proximos y ordenes recientes.',
      primaryLink: '/organizer/events',
      primaryLabel: 'Ver eventos',
    },
    organizerEvents: {
      eyebrow: 'Organizador',
      title: 'Gestion de eventos',
      description: 'Tabla de eventos con estados, ventas, acciones y acceso a configuracion.',
      primaryLink: '/organizer/events/new',
      primaryLabel: 'Crear evento demo',
    },
    organizerNewEvent: {
      eyebrow: 'Organizador',
      title: 'Crear evento',
      description: 'Formulario mock para datos basicos, venue, fecha, categoria, cover y estado.',
    },
    organizerEventDetail: {
      eyebrow: 'Organizador',
      title: 'Detalle operativo del evento',
      description: 'Resumen del evento y accesos a tickets, ordenes, asistentes y reportes.',
    },
    organizerEditEvent: {
      eyebrow: 'Organizador',
      title: 'Editar evento',
      description: 'Formulario de edicion conectado al mock store.',
    },
    organizerTicketTypes: {
      eyebrow: 'Organizador',
      title: 'Tipos de ticket',
      description: 'Inventario, precios, cantidades y estados de venta.',
    },
    organizerOrders: {
      eyebrow: 'Organizador',
      title: 'Ordenes del evento',
      description: 'Ordenes por comprador, estado, total, metodo de pago y fecha.',
    },
    organizerAttendees: {
      eyebrow: 'Organizador',
      title: 'Asistentes',
      description: 'Listado de asistentes, tipo de ticket, estado de check-in y export CSV.',
    },
    organizerReports: {
      eyebrow: 'Organizador',
      title: 'Reportes',
      description: 'Revenue, tickets vendidos, pagos y progreso de entrada por evento.',
    },
    scannerEvents: {
      eyebrow: 'Scanner',
      title: 'Seleccion de evento',
      description: 'Lista de eventos asignados con progreso de entrada.',
      primaryLink: '/scan/events/event-caracas-music-fest/scanner',
      primaryLabel: 'Abrir scanner demo',
    },
    scannerEventSummary: {
      eyebrow: 'Scanner',
      title: 'Resumen de evento',
      description: 'Contexto operativo antes de empezar a validar tickets.',
    },
    scannerPage: {
      eyebrow: 'Scanner',
      title: 'Validacion QR',
      description: 'Camara placeholder, input manual de QR y estados valido/usado/invalido.',
    },
    scannerAttendees: {
      eyebrow: 'Scanner',
      title: 'Busqueda manual',
      description: 'Fallback por nombre o email cuando no se puede escanear el QR.',
    },
    scannerStats: {
      eyebrow: 'Scanner',
      title: 'Stats de entrada',
      description: 'Total de tickets, ingresados, pendientes y ultimos check-ins.',
    },
  },
} as const;
