import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { appLabels } from '../../../core/content/app-labels';

@Component({
  selector: 'app-empty-state',
  imports: [RouterLink],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly eyebrow = input<string>();
  readonly title = input<string>();
  readonly description = input<string>();
  readonly actionLabel = input<string>();
  readonly actionLink = input<string>();

  private readonly defaults = appLabels.shared.emptyState;

  protected readonly displayEyebrow = computed(() => this.eyebrow() ?? this.defaults.eyebrow);
  protected readonly displayTitle = computed(() => this.title() ?? this.defaults.title);
  protected readonly displayDescription = computed(
    () => this.description() ?? this.defaults.description,
  );
  protected readonly displayActionLabel = computed(
    () => this.actionLabel() ?? this.defaults.actionLabel,
  );
}
