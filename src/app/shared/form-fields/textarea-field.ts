import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-textarea-field',
  imports: [],
  template: `
    <label class="form-control">
      <span class="label-text mb-2 text-slate-300">{{ label() }}</span>
      <textarea
        class="textarea textarea-bordered bg-base-100/80 text-white"
        [class.min-h-24]="size() === 'sm'"
        [class.min-h-36]="size() === 'md'"
        [required]="required()"
        [attr.aria-describedby]="invalid() ? describedBy() : null"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [placeholder]="placeholder()"
        [value]="value()"
        (input)="updateValue($event)"
      ></textarea>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaField {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly placeholder = input('');
  readonly required = input(false);
  readonly invalid = input(false);
  readonly describedBy = input<string | null>(null);
  readonly size = input<'sm' | 'md'>('sm');

  readonly valueChange = output<string>();

  protected updateValue(event: Event): void {
    this.valueChange.emit((event.target as HTMLTextAreaElement).value);
  }
}
