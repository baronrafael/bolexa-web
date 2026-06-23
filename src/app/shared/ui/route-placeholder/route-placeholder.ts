import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { appLabels } from '../../../core/content/app-labels';

@Component({
  selector: 'app-route-placeholder',
  imports: [RouterLink],
  templateUrl: './route-placeholder.html',
  styleUrl: './route-placeholder.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutePlaceholder {
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(this.route.data, { initialValue: {} });
  private readonly defaults = appLabels.routePlaceholder.defaults;

  protected readonly eyebrow = computed(() => this.readData('eyebrow', this.defaults.eyebrow));
  protected readonly title = computed(() => this.readData('title', this.defaults.title));
  protected readonly description = computed(() => this.readData('description', this.defaults.description));
  protected readonly primaryLink = computed(() => this.readData('primaryLink', this.defaults.primaryLink));
  protected readonly primaryLabel = computed(() => this.readData('primaryLabel', this.defaults.primaryLabel));

  private readData(key: string, fallback: string): string {
    const data = this.routeData() as Record<string, unknown>;
    const value = data[key];

    return typeof value === 'string' ? value : fallback;
  }
}
