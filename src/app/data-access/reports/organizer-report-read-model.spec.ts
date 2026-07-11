import { Attendee, EventDetail, PaymentMethod } from '../models';
import { OrganizerOrder } from '../repositories/organizer-repository';
import {
  buildOrganizerReportReadModel,
  OrganizerReportLabels,
} from './organizer-report-read-model';

const labels: OrganizerReportLabels = {
  metrics: {
    revenue: 'Revenue total',
    ticketsSold: 'Tickets vendidos',
    checkedIn: 'Check-ins',
    paidOrders: 'Ordenes pagadas',
  },
  labels: {
    sold: 'vendidos',
    checkedIn: 'ingresados',
    pending: 'pendientes',
    orders: 'ordenes',
    noPaymentMethod: 'Sin metodo',
  },
  paymentMethods: {
    bank_transfer: 'Transferencia bancaria',
    binance: 'Binance/USDT',
    card: 'Tarjeta',
    manual: 'Pago manual',
    pago_movil: 'Pago movil',
    zelle: 'Zelle',
  },
};

describe('buildOrganizerReportReadModel', () => {
  it('calculates revenue metrics and ticket type bars', () => {
    const report = buildOrganizerReportReadModel({
      eventDetail: eventDetail(),
      orders: [order('paid', 120, 'zelle'), order('manual_review', 80, 'manual')],
      attendees: [attendee('valid'), attendee('used'), attendee('used')],
      labels,
      formatMoney,
    });

    expect(report.hasReportData).toBe(true);
    expect(report.metricCards).toEqual([
      { title: 'Revenue total', value: 'USD 120.00', tone: 'primary' },
      { title: 'Tickets vendidos', value: 3, tone: 'success' },
      { title: 'Check-ins', value: 2, tone: 'warning' },
      { title: 'Ordenes pagadas', value: 1, tone: 'neutral' },
    ]);
    expect(report.revenueByTicketType).toEqual([
      { label: 'General', value: 100, displayValue: 'USD 100.00', percentage: 100 },
      { label: 'VIP', value: 50, displayValue: 'USD 50.00', percentage: 50 },
    ]);
    expect(report.ticketsByType).toEqual([
      { label: 'General', value: 5, displayValue: '5 vendidos', percentage: 100 },
      { label: 'VIP', value: 1, displayValue: '1 vendidos', percentage: 20 },
    ]);
  });

  it('calculates check-in progress and payment breakdown bars', () => {
    const report = buildOrganizerReportReadModel({
      eventDetail: eventDetail(),
      orders: [
        order('paid', 50, 'pago_movil'),
        order('paid', 40, 'pago_movil'),
        order('pending', 20),
      ],
      attendees: [attendee('used'), attendee('valid'), attendee('valid')],
      labels,
      formatMoney,
    });

    expect(report.checkInBars).toEqual([
      { label: 'ingresados', value: 1, displayValue: '1 ingresados', percentage: 50 },
      { label: 'pendientes', value: 2, displayValue: '2 pendientes', percentage: 100 },
    ]);
    expect(report.paymentBars).toEqual([
      { label: 'Pago movil', value: 2, displayValue: '2 ordenes', percentage: 100 },
      { label: 'Sin metodo', value: 1, displayValue: '1 ordenes', percentage: 50 },
    ]);
  });

  it('returns empty report state without event data, orders or attendees', () => {
    const report = buildOrganizerReportReadModel({
      eventDetail: null,
      orders: [],
      attendees: [],
      labels,
      formatMoney,
    });

    expect(report.hasReportData).toBe(false);
    expect(report.metricCards[0].value).toBe('USD 0.00');
    expect(report.revenueByTicketType).toEqual([]);
    expect(report.ticketsByType).toEqual([]);
    expect(report.paymentBars).toEqual([]);
    expect(report.checkInBars).toEqual([
      { label: 'ingresados', value: 0, displayValue: '0 ingresados', percentage: 0 },
      { label: 'pendientes', value: 0, displayValue: '0 pendientes', percentage: 0 },
    ]);
  });
});

function eventDetail(): EventDetail {
  return {
    event: { id: 'event-1' },
    organizer: { id: 'organizer-1' },
    venue: { id: 'venue-1' },
    ticketTypes: [
      { id: 'general', name: 'General', price: 20, quantitySold: 5, currency: 'USD' },
      { id: 'vip', name: 'VIP', price: 50, quantitySold: 1, currency: 'USD' },
    ],
  } as EventDetail;
}

function order(
  status: OrganizerOrder['order']['status'],
  total: number,
  paymentMethod?: PaymentMethod,
): OrganizerOrder {
  return {
    order: {
      id: crypto.randomUUID(),
      status,
      total,
      paymentMethod,
    },
  } as OrganizerOrder;
}

function attendee(status: Attendee['ticket']['status']): Attendee {
  return {
    ticket: { id: crypto.randomUUID(), status },
  } as Attendee;
}

function formatMoney(value: number, currency = 'USD'): string {
  return `${currency} ${value.toFixed(2)}`;
}
