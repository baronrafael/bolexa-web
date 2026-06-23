import { ChangeDetectionStrategy, Component, computed, input, numberAttribute } from '@angular/core';
import { appLabels } from '../../../core/content/app-labels';

@Component({
  selector: 'app-loading-state',
  imports: [],
  templateUrl: './loading-state.html',
  styleUrl: './loading-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingState {
  readonly title = input<string>(appLabels.shared.loadingState.title);
  readonly rows = input(3, { transform: numberAttribute });

  protected readonly skeletonRows = computed(() => Array.from({ length: Math.max(this.rows(), 1) }));
}
