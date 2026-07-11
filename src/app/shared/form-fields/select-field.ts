import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface SelectFieldOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select-field',
  imports: [],
  template: `
    <label class="form-control">
      <span class="label-text mb-2 text-slate-300">{{ label() }}</span>
      <select
        class="select select-bordered bg-base-100 text-white"
        [required]="required()"
        [attr.aria-describedby]="invalid() ? describedBy() : null"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [value]="value()"
        (change)="updateValue($event)"
      >
        @for (option of options(); track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectField {
  readonly label = input.required<string>();
  readonly options = input.required<SelectFieldOption[]>();
  readonly value = input.required<string>();
  readonly required = input(false);
  readonly invalid = input(false);
  readonly describedBy = input<string | null>(null);

  readonly valueChange = output<string>();

  protected updateValue(event: Event): void {
    this.valueChange.emit((event.target as HTMLSelectElement).value);
  }
}
