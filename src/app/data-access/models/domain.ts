export type UserRole = 'consumer' | 'organizer' | 'scanner' | 'admin';
export type OrganizerStatus = 'pending' | 'active' | 'suspended';
export type EventCategory = 'concert' | 'sports' | 'running' | 'theater' | 'conference' | 'party' | 'festival' | 'other';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type Currency = 'USD' | 'VES';
export type TicketTypeStatus = 'active' | 'paused' | 'sold_out';
export type PaymentMethod = 'card' | 'zelle' | 'pago_movil' | 'binance' | 'bank_transfer' | 'manual';
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'expired' | 'refunded' | 'manual_review' | 'failed';
export type TicketStatus = 'valid' | 'used' | 'cancelled' | 'refunded';
export type CheckInStatus = 'accepted' | 'rejected' | 'duplicate';
export type PromoCodeStatus = 'active' | 'expired' | 'disabled';
export type ScanResultStatus = 'accepted' | 'already_used' | 'invalid_ticket' | 'wrong_event' | 'cancelled' | 'refunded';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  organizerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organizer {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: OrganizerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  organizerId: string;
  venueId: string;
  title: string;
  slug: string;
  description: string;
  category: EventCategory;
  coverImageUrl?: string;
  startsAt: string;
  endsAt?: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  currency: Currency;
  quantityTotal: number;
  quantitySold: number;
  saleStartsAt?: string;
  saleEndsAt?: string;
  status: TicketTypeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
  currency: Currency;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  eventId: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  status: OrderStatus;
  subtotal: number;
  fees: number;
  total: number;
  currency: Currency;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  orderId: string;
  eventId: string;
  ticketTypeId: string;
  userId: string;
  holderName: string;
  holderEmail: string;
  qrCode: string;
  status: TicketStatus;
  checkedInAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  ticketId: string;
  eventId: string;
  scannerUserId: string;
  status: CheckInStatus;
  reason?: string;
  createdAt: string;
}

export interface PromoCode {
  id: string;
  eventId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  status: PromoCodeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  query?: string;
  category?: EventCategory;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EventDetail {
  event: Event;
  organizer: Organizer;
  venue: Venue;
  ticketTypes: TicketType[];
}

export interface CreateOrderInput {
  userId: string;
  eventId: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  items: Array<{
    ticketTypeId: string;
    quantity: number;
  }>;
}

export interface PayOrderInput {
  orderId: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  result: 'approved' | 'manual_review' | 'failed';
}

export interface Attendee {
  ticket: Ticket;
  ticketType: TicketType;
  order: Order;
  user: User;
}

export interface OrganizerDashboardSummary {
  totalRevenue: number;
  ticketsSold: number;
  checkIns: number;
  upcomingEvents: EventDetail[];
  recentOrders: Order[];
}

export interface ScannerEventSummary extends EventDetail {
  totalTickets: number;
  checkedInTickets: number;
}

export interface ScanResult {
  status: ScanResultStatus;
  message: string;
  ticket?: Ticket;
  ticketType?: TicketType;
  holderName?: string;
  checkedInAt?: string;
}

export interface MockDatabaseState {
  users: User[];
  organizers: Organizer[];
  venues: Venue[];
  events: Event[];
  ticketTypes: TicketType[];
  orders: Order[];
  orderItems: OrderItem[];
  tickets: Ticket[];
  checkIns: CheckIn[];
  promoCodes: PromoCode[];
}
