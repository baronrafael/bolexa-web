import { ChangeDetectionStrategy, Component, computed, input, numberAttribute, output } from '@angular/core';
import { appLabels } from '../../../core/content/app-labels';
import { TicketType } from '../../../data-access/models';
import { StatusBadge } from '../status-badge/status-badge';

@Component({
  selector: 'app-ticket-type-selector',
  imports: [StatusBadge],
  templateUrl: './ticket-type-selector.html',
  styleUrl: './ticket-type-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketTypeSelector {
  readonly ticketType = input.required<TicketType>();
  readonly quantity = input(0, { transform: sanitizeQuantity });
  readonly quantityChange = output<number>();

  protected readonly labels = appLabels.shared.ticketTypeSelector;
  protected readonly availableTickets = computed(() => Math.max(this.ticketType().quantityTotal - this.ticketType().quantitySold, 0));
  protected readonly unavailable = computed(() => this.ticketType().status !== 'active' || this.availableTickets() === 0);

  protected formatMoney(value: number, currency: string): string {
    return new Intl.NumberFormat('es-VE', {
      currency,
      maximumFractionDigits: 0,
      style: 'currency',
    }).format(value);
  }

  protected decrement(): void {
    this.quantityChange.emit(Math.max(this.quantity() - 1, 0));
  }

  protected increment(): void {
    if (this.unavailable() || this.quantity() >= this.availableTickets()) {
      return;
    }

    this.quantityChange.emit(this.quantity() + 1);
  }
}

function sanitizeQuantity(value: unknown): number {
  const quantity = numberAttribute(value);

  return Number.isFinite(quantity) ? Math.max(quantity, 0) : 0;
}
