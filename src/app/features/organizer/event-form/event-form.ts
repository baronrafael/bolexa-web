import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MockAuth } from '../../../core/auth/mock-auth';
import { appLabels } from '../../../core/content/app-labels';
import { EventCategory, EventStatus, Venue } from '../../../data-access/models';
import { OrganizerRepository, SaveOrganizerEventInput } from '../../../data-access/repositories/organizer-repository';
import { EmptyState, LoadingState } from '../../../shared/ui';

interface EventFormState {
  title: string;
  category: EventCategory;
  description: string;
  venueId: string;
  startsAt: string;
  coverImageUrl: string;
  status: Extract<EventStatus, 'draft' | 'published'>;
}

@Component({
  selector: 'app-event-form',
  imports: [EmptyState, LoadingState, RouterLink],
  templateUrl: './event-form.html',
  styleUrl: './event-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventForm {
  private readonly auth = inject(MockAuth);
  private readonly organizerRepository = inject(OrganizerRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly routeParams = toSignal(this.route.paramMap);
  private loadRequestId = 0;

  protected readonly labels = appLabels;
  protected readonly categories: EventCategory[] = ['concert', 'sports', 'running', 'theater', 'conference', 'party', 'festival', 'other'];
  protected readonly statuses: Array<Extract<EventStatus, 'draft' | 'published'>> = ['draft', 'published'];
  protected readonly venues = signal<Venue[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly notFound = signal(false);
  protected readonly form = signal<EventFormState>(this.emptyForm());
  protected readonly eventId = computed(() => this.routeParams()?.get('eventId') ?? null);
  protected readonly isEdit = computed(() => Boolean(this.eventId()));
  protected readonly organizerId = computed(() => this.auth.currentOrganizerId());
  protected readonly eyebrow = computed(() => this.isEdit() ? this.labels.organizerEventForm.editEyebrow : this.labels.organizerEventForm.createEyebrow);
  protected readonly title = computed(() => this.isEdit() ? this.labels.organizerEventForm.editTitle : this.labels.organizerEventForm.createTitle);
  protected readonly isValid = computed(() => {
    const form = this.form();

    return Boolean(form.title.trim() && form.description.trim() && form.venueId && form.startsAt);
  });

  constructor() {
    effect(() => {
      const organizerId = this.organizerId();
      const eventId = this.eventId();

      if (organizerId) {
        void this.loadForm(organizerId, eventId);
      }
    });
  }

  protected updateField<K extends keyof EventFormState>(field: K, value: EventFormState[K]): void {
    this.form.update((form) => ({ ...form, [field]: value }));
  }

  protected async save(): Promise<void> {
    this.submitted.set(true);

    if (!this.isValid() || this.saving()) {
      return;
    }

    const organizerId = this.organizerId();

    if (!organizerId) {
      return;
    }

    this.saving.set(true);

    try {
      const input = this.toSaveInput();
      const eventId = this.eventId();

      if (eventId) {
        await this.organizerRepository.updateEvent(organizerId, eventId, input);
      } else {
        await this.organizerRepository.createEvent(organizerId, input);
      }

      await this.router.navigateByUrl('/organizer/events');
    } finally {
      this.saving.set(false);
    }
  }

  private async loadForm(organizerId: string, eventId: string | null): Promise<void> {
    const requestId = ++this.loadRequestId;

    this.loading.set(true);
    this.notFound.set(false);
    this.submitted.set(false);

    try {
      const venues = await this.organizerRepository.listVenues();

      if (requestId !== this.loadRequestId) {
        return;
      }

      this.venues.set(venues);

      if (!eventId) {
        this.form.set({ ...this.emptyForm(), venueId: venues[0]?.id ?? '' });
        return;
      }

      const eventDetail = await this.organizerRepository.getEvent(organizerId, eventId);

      if (requestId !== this.loadRequestId) {
        return;
      }

      if (!eventDetail) {
        this.notFound.set(true);
        this.form.set({ ...this.emptyForm(), venueId: venues[0]?.id ?? '' });
        return;
      }

      this.form.set({
        title: eventDetail.event.title,
        category: eventDetail.event.category,
        description: eventDetail.event.description,
        venueId: eventDetail.event.venueId,
        startsAt: this.toDateTimeLocal(eventDetail.event.startsAt),
        coverImageUrl: eventDetail.event.coverImageUrl ?? '',
        status: eventDetail.event.status === 'published' ? 'published' : 'draft',
      });
    } finally {
      if (requestId === this.loadRequestId) {
        this.loading.set(false);
      }
    }
  }

  private toSaveInput(): SaveOrganizerEventInput {
    const form = this.form();

    return {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      venueId: form.venueId,
      startsAt: new Date(form.startsAt).toISOString(),
      coverImageUrl: form.coverImageUrl.trim(),
      status: form.status,
    };
  }

  private emptyForm(): EventFormState {
    return {
      title: '',
      category: 'concert',
      description: '',
      venueId: '',
      startsAt: this.toDateTimeLocal(new Date().toISOString()),
      coverImageUrl: '',
      status: 'draft',
    };
  }

  private toDateTimeLocal(value: string): string {
    const date = new Date(value);
    const timezoneOffset = date.getTimezoneOffset() * 60_000;

    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
  }
}
