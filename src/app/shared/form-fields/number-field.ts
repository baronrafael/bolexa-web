import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-number-field',
  imports: [],
  template: `
    <label class="form-control">
      <span class="label-text mb-2 text-slate-300">{{ label() }}</span>
      <input
        class="input input-bordered bg-base-100/80 text-white"
        type="number"
        [required]="required()"
        [min]="min()"
        [step]="step()"
        [attr.aria-describedby]="invalid() ? describedBy() : null"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [value]="value()"
        (input)="updateValue($event)"
      />
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberField {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly min = input<number | null>(null);
  readonly step = input<string | number>('1');
  readonly required = input(false);
  readonly invalid = input(false);
  readonly describedBy = input<string | null>(null);

  readonly valueChange = output<number>();

  protected updateValue(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).valueAsNumber);
  }
}
