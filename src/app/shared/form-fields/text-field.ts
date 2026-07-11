import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-text-field',
  imports: [],
  template: `
    <label class="form-control">
      <span class="label-text mb-2 text-slate-300">{{ label() }}</span>
      <input
        class="input input-bordered bg-base-100/80 text-white"
        [required]="required()"
        [type]="type()"
        [attr.aria-describedby]="invalid() ? describedBy() : null"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [placeholder]="placeholder()"
        [value]="value()"
        (input)="updateValue($event)"
      />
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextField {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly type = input('text');
  readonly placeholder = input('');
  readonly required = input(false);
  readonly invalid = input(false);
  readonly describedBy = input<string | null>(null);

  readonly valueChange = output<string>();

  protected updateValue(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
