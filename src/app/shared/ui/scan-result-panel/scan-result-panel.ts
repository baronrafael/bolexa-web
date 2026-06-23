import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { appLabels } from '../../../core/content/app-labels';
import { ScanResult, ScanResultStatus } from '../../../data-access/models';

@Component({
  selector: 'app-scan-result-panel',
  imports: [],
  templateUrl: './scan-result-panel.html',
  styleUrl: './scan-result-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanResultPanel {
  readonly result = input<ScanResult | null>(null);

  protected readonly labels = appLabels.shared.scanResultPanel;
  private readonly statusLabels = appLabels.shared.statusBadge.scan;
  private readonly statusClasses: Record<ScanResultStatus | 'idle', string> = {
    idle: 'border-white/10 bg-base-300/70 text-slate-300',
    accepted: 'border-success/40 bg-success/10 text-success',
    already_used: 'border-warning/40 bg-warning/10 text-warning',
    invalid_ticket: 'border-error/40 bg-error/10 text-error',
    wrong_event: 'border-error/40 bg-error/10 text-error',
    cancelled: 'border-error/40 bg-error/10 text-error',
    refunded: 'border-white/10 bg-white/[0.04] text-slate-300',
  };

  protected readonly panelClass = computed(() => {
    const status = this.result()?.status ?? 'idle';

    return `rounded-[1.5rem] border p-6 shadow-2xl ${this.statusClasses[status]}`;
  });
  protected readonly title = computed(() => {
    const status = this.result()?.status;

    return status ? this.statusLabels[status] : this.labels.idleTitle;
  });
  protected readonly message = computed(() => {
    const result = this.result();

    return result ? result.message || this.labels.defaultMessages[result.status] : this.labels.idleMessage;
  });
}
