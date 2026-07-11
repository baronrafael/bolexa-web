import { Attendee, EventDetail, PaymentMethod } from '../models';
import { OrganizerOrder } from '../repositories/organizer-repository';

export interface ReportBar {
  label: string;
  value: number;
  displayValue: string;
  percentage: number;
}

export interface ReportMetricCard {
  title: string;
  value: string | number;
  tone: 'primary' | 'success' | 'warning' | 'neutral';
}

export interface OrganizerReportLabels {
  metrics: {
    revenue: string;
    ticketsSold: string;
    checkedIn: string;
    paidOrders: string;
  };
  labels: {
    sold: string;
    checkedIn: string;
    pending: string;
    orders: string;
    noPaymentMethod: string;
  };
  paymentMethods: Record<PaymentMethod, string>;
}

export interface OrganizerReportReadModel {
  hasReportData: boolean;
  metricCards: ReportMetricCard[];
  revenueByTicketType: ReportBar[];
  ticketsByType: ReportBar[];
  checkInBars: ReportBar[];
  paymentBars: ReportBar[];
}

interface BuildOrganizerReportReadModelInput {
  eventDetail: EventDetail | null;
  orders: OrganizerOrder[];
  attendees: Attendee[];
  labels: OrganizerReportLabels;
  formatMoney: (value: number, currency?: string) => string;
}

export function buildOrganizerReportReadModel({
  eventDetail,
  orders,
  attendees,
  labels,
  formatMoney,
}: BuildOrganizerReportReadModelInput): OrganizerReportReadModel {
  const paidOrders = orders.filter((entry) => entry.order.status === 'paid');
  const totalRevenue = paidOrders.reduce((total, entry) => total + entry.order.total, 0);
  const ticketsSold = attendees.length;
  const checkedInCount = attendees.filter((attendee) => attendee.ticket.status === 'used').length;
  const pendingCount = Math.max(ticketsSold - checkedInCount, 0);
  const ticketTypes = eventDetail?.ticketTypes ?? [];

  return {
    hasReportData: orders.length > 0 || attendees.length > 0 || ticketTypes.length > 0,
    metricCards: [
      {
        title: labels.metrics.revenue,
        value: formatMoney(totalRevenue),
        tone: 'primary',
      },
      {
        title: labels.metrics.ticketsSold,
        value: ticketsSold,
        tone: 'success',
      },
      {
        title: labels.metrics.checkedIn,
        value: checkedInCount,
        tone: 'warning',
      },
      {
        title: labels.metrics.paidOrders,
        value: paidOrders.length,
        tone: 'neutral',
      },
    ],
    revenueByTicketType: withPercentages(
      ticketTypes.map((ticketType) => ({
        label: ticketType.name,
        value: ticketType.price * ticketType.quantitySold,
        displayValue: formatMoney(ticketType.price * ticketType.quantitySold, ticketType.currency),
      })),
    ),
    ticketsByType: withPercentages(
      ticketTypes.map((ticketType) => ({
        label: ticketType.name,
        value: ticketType.quantitySold,
        displayValue: `${ticketType.quantitySold} ${labels.labels.sold}`,
      })),
    ),
    checkInBars: withPercentages([
      {
        label: labels.labels.checkedIn,
        value: checkedInCount,
        displayValue: `${checkedInCount} ${labels.labels.checkedIn}`,
      },
      {
        label: labels.labels.pending,
        value: pendingCount,
        displayValue: `${pendingCount} ${labels.labels.pending}`,
      },
    ]),
    paymentBars: buildPaymentBars(orders, labels),
  };
}

function buildPaymentBars(orders: OrganizerOrder[], labels: OrganizerReportLabels): ReportBar[] {
  const totals = new Map<string, number>();

  for (const entry of orders) {
    const key = entry.order.paymentMethod
      ? labels.paymentMethods[entry.order.paymentMethod]
      : labels.labels.noPaymentMethod;

    totals.set(key, (totals.get(key) ?? 0) + 1);
  }

  return withPercentages(
    [...totals.entries()].map(([label, value]) => ({
      label,
      value,
      displayValue: `${value} ${labels.labels.orders}`,
    })),
  );
}

function withPercentages(items: Array<Omit<ReportBar, 'percentage'>>): ReportBar[] {
  const max = Math.max(...items.map((item) => item.value), 0);

  return items.map((item) => ({
    ...item,
    percentage: max > 0 ? Math.round((item.value / max) * 100) : 0,
  }));
}
