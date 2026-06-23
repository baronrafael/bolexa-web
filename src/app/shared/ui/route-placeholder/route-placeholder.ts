import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-route-placeholder',
  imports: [RouterLink],
  templateUrl: './route-placeholder.html',
  styleUrl: './route-placeholder.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutePlaceholder {
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(this.route.data, { initialValue: {} });

  protected readonly eyebrow = computed(() => this.readData('eyebrow', 'Bolexa MVP'));
  protected readonly title = computed(() => this.readData('title', 'Pantalla en progreso'));
  protected readonly description = computed(() => this.readData('description', 'Esta ruta ya esta conectada y lista para recibir UI final.'));
  protected readonly primaryLink = computed(() => this.readData('primaryLink', '/'));
  protected readonly primaryLabel = computed(() => this.readData('primaryLabel', 'Volver al inicio'));

  private readData(key: string, fallback: string): string {
    const data = this.routeData() as Record<string, unknown>;
    const value = data[key];

    return typeof value === 'string' ? value : fallback;
  }
}
