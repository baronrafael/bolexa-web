import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { appLabels } from '../../../core/content/app-labels';

export type StatusBadgeTone = 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-status-badge',
  imports: [],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge {
  readonly status = input.required<string>();
  readonly label = input<string>();
  readonly tone = input<StatusBadgeTone>();

  private readonly labels = appLabels.shared.statusBadge;
  private readonly statusLabels: Record<string, string> = {
    ...this.labels.event,
    ...this.labels.organizer,
    ...this.labels.ticketType,
    ...this.labels.order,
    ...this.labels.ticket,
    ...this.labels.scan,
  };
  private readonly statusTones: Record<string, StatusBadgeTone> = {
    active: 'success',
    accepted: 'success',
    completed: 'success',
    paid: 'success',
    published: 'primary',
    valid: 'success',
    already_used: 'warning',
    draft: 'neutral',
    expired: 'neutral',
    manual_review: 'secondary',
    paused: 'warning',
    pending: 'warning',
    used: 'warning',
    cancelled: 'error',
    failed: 'error',
    invalid_ticket: 'error',
    refunded: 'neutral',
    sold_out: 'error',
    suspended: 'error',
    wrong_event: 'error',
  };
  private readonly toneClasses: Record<StatusBadgeTone, string> = {
    neutral: 'badge border-white/10 bg-white/[0.06] text-slate-200',
    primary: 'badge border-primary/30 bg-primary/15 text-primary',
    secondary: 'badge border-secondary/30 bg-secondary/15 text-secondary',
    success: 'badge border-success/30 bg-success/15 text-success',
    warning: 'badge border-warning/30 bg-warning/15 text-warning',
    error: 'badge border-error/30 bg-error/15 text-error',
    info: 'badge border-info/30 bg-info/15 text-info',
  };

  protected readonly displayLabel = computed(() => this.label() ?? this.statusLabels[this.status()] ?? this.labels.fallback);
  protected readonly badgeClass = computed(() => this.toneClasses[this.tone() ?? this.statusTones[this.status()] ?? 'neutral']);
}
