import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type MetricCardTone = 'primary' | 'success' | 'warning' | 'neutral';

@Component({
  selector: 'app-metric-card',
  imports: [],
  templateUrl: './metric-card.html',
  styleUrl: './metric-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCard {
  readonly eyebrow = input<string>();
  readonly title = input.required<string>();
  readonly value = input.required<string | number>();
  readonly description = input<string>();
  readonly tone = input<MetricCardTone>('primary');

  private readonly toneClasses: Record<MetricCardTone, string> = {
    primary: 'border-primary/30 bg-primary/10 text-primary',
    success: 'border-success/30 bg-success/10 text-success',
    warning: 'border-warning/30 bg-warning/10 text-warning',
    neutral: 'border-white/10 bg-white/[0.04] text-slate-300',
  };

  protected readonly accentClass = computed(() => this.toneClasses[this.tone()]);
}
