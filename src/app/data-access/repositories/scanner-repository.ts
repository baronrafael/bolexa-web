import { inject, Injectable } from '@angular/core';
import { Attendee, ScanResult, ScannerEventSummary } from '../models';
import { MockDatabase } from '../mock/mock-database';
import { clone, mockDelay, nowIso, createMockId } from '../mock/mock-helpers';

@Injectable({
  providedIn: 'root',
})
export class ScannerRepository {
  private readonly database = inject(MockDatabase);

  async listEvents(): Promise<ScannerEventSummary[]> {
    await mockDelay();

    const state = this.database.snapshot();

    return state.events
      .filter((event) => event.status === 'published')
      .map((event) => {
        const organizer = state.organizers.find((candidate) => candidate.id === event.organizerId);
        const venue = state.venues.find((candidate) => candidate.id === event.venueId);

        if (!organizer || !venue) {
          throw new Error(`Mock scanner event ${event.id} has invalid relationships.`);
        }

        const tickets = state.tickets.filter((ticket) => ticket.eventId === event.id);

        return clone({
          event,
          organizer,
          venue,
          ticketTypes: state.ticketTypes.filter((ticketType) => ticketType.eventId === event.id),
          totalTickets: tickets.length,
          checkedInTickets: tickets.filter((ticket) => ticket.status === 'used').length,
        });
      });
  }

  async validateTicket(eventId: string, qrCode: string): Promise<ScanResult> {
    await mockDelay(120);

    return this.validateTicketSync(eventId, qrCode);
  }

  async listAttendees(eventId: string): Promise<Attendee[]> {
    await mockDelay();

    const state = this.database.snapshot();

    return state.tickets
      .filter((ticket) => ticket.eventId === eventId)
      .map((ticket) => {
        const ticketType = state.ticketTypes.find((candidate) => candidate.id === ticket.ticketTypeId);
        const order = state.orders.find((candidate) => candidate.id === ticket.orderId);
        const user = state.users.find((candidate) => candidate.id === ticket.userId);

        if (!ticketType || !order || !user) {
          throw new Error(`Mock scanner attendee ${ticket.id} has invalid relationships.`);
        }

        return clone({ ticket, ticketType, order, user });
      });
  }

  async checkIn(eventId: string, qrCode: string, scannerUserId: string): Promise<ScanResult> {
    await mockDelay(120);

    const validation = this.validateTicketSync(eventId, qrCode);

    if (validation.status !== 'accepted' || !validation.ticket) {
      return validation;
    }

    const now = nowIso();

    this.database.update((state) => {
      const ticket = state.tickets.find((candidate) => candidate.id === validation.ticket?.id);

      if (!ticket || ticket.status !== 'valid') {
        return;
      }

      ticket.status = 'used';
      ticket.checkedInAt = now;
      ticket.updatedAt = now;
      state.checkIns.push({
        id: createMockId('checkin'),
        ticketId: ticket.id,
        eventId,
        scannerUserId,
        status: 'accepted',
        createdAt: now,
      });
    });

    return {
      ...validation,
      status: 'accepted',
      message: 'Ticket validado y marcado como usado.',
      checkedInAt: now,
    };
  }

  private validateTicketSync(eventId: string, qrCode: string): ScanResult {
    const state = this.database.snapshot();
    const normalizedQrCode = qrCode.trim().toUpperCase();
    const ticket = state.tickets.find((candidate) => candidate.qrCode.toUpperCase() === normalizedQrCode);

    if (!ticket) {
      return {
        status: 'invalid_ticket',
        message: 'No encontramos un ticket con ese codigo QR.',
      };
    }

    const ticketType = state.ticketTypes.find((candidate) => candidate.id === ticket.ticketTypeId);

    if (ticket.eventId !== eventId) {
      return {
        status: 'wrong_event',
        message: 'Este ticket pertenece a otro evento.',
        ticket: clone(ticket),
        ticketType: ticketType ? clone(ticketType) : undefined,
        holderName: ticket.holderName,
      };
    }

    if (ticket.status === 'used') {
      return {
        status: 'already_used',
        message: 'Este ticket ya fue utilizado.',
        ticket: clone(ticket),
        ticketType: ticketType ? clone(ticketType) : undefined,
        holderName: ticket.holderName,
        checkedInAt: ticket.checkedInAt,
      };
    }

    if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
      return {
        status: ticket.status,
        message: ticket.status === 'cancelled' ? 'Este ticket fue cancelado.' : 'Este ticket fue reembolsado.',
        ticket: clone(ticket),
        ticketType: ticketType ? clone(ticketType) : undefined,
        holderName: ticket.holderName,
      };
    }

    return {
      status: 'accepted',
      message: 'Ticket valido para este evento.',
      ticket: clone(ticket),
      ticketType: ticketType ? clone(ticketType) : undefined,
      holderName: ticket.holderName,
    };
  }
}
