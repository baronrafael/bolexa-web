import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { appLabels } from '../../../core/content/app-labels';

@Component({
  selector: 'app-search-input',
  imports: [],
  templateUrl: './search-input.html',
  styleUrl: './search-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInput {
  readonly id = input('bolexa-search');
  readonly label = input(appLabels.shared.searchInput.label);
  readonly placeholder = input(appLabels.shared.searchInput.placeholder);
  readonly value = input('');
  readonly queryChange = output<string>();

  protected readonly labels = appLabels.shared.searchInput;

  protected handleInput(event: Event): void {
    this.queryChange.emit((event.target as HTMLInputElement).value);
  }

  protected clear(): void {
    this.queryChange.emit('');
  }
}
