import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MockAuth } from '../../../core/auth/mock-auth';
import { EventDetail } from '../../../data-access/models';
import { OrganizerRepository } from '../../../data-access/repositories/organizer-repository';
import { TicketTypes } from './ticket-types';

describe('TicketTypes validation', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketTypes],
      providers: [
        provideRouter([]),
        {
          provide: MockAuth,
          useValue: { currentOrganizerId: signal('organizer-test') },
        },
        {
          provide: OrganizerRepository,
          useValue: {
            getEvent: vi.fn().mockResolvedValue(eventDetail()),
            createTicketType: vi.fn(),
            updateTicketType: vi.fn(),
          },
        },
        {
          provide: ActivatedRouteStub,
          useFactory: () => new ActivatedRouteStub(),
        },
        {
          provide: ActivatedRoute,
          useExisting: ActivatedRouteStub,
        },
      ],
    }).compileComponents();
  });

  it('rejects quantity below the already sold count when editing', async () => {
    const fixture = TestBed.createComponent(TicketTypes);
    const organizerRepository = TestBed.inject(OrganizerRepository) as unknown as {
      updateTicketType: ReturnType<typeof vi.fn>;
    };

    await fixture.whenStable();
    clickButton(fixture, 'Editar');
    await fixture.whenStable();

    const quantityInput = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="number"]'),
    )[1] as HTMLInputElement;
    quantityInput.value = '4';
    quantityInput.dispatchEvent(new Event('input'));
    submitForm(fixture);
    await fixture.whenStable();

    expect(organizerRepository.updateTicketType).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'La cantidad total no puede ser menor a los tickets ya vendidos.',
    );
  });
});

class ActivatedRouteStub {
  readonly paramMap = of(convertToParamMap({ eventId: 'event-test' }));
}

function clickButton(fixture: ComponentFixture<TicketTypes>, text: string): void {
  const buttons = Array.from(
    fixture.nativeElement.querySelectorAll('button'),
  ) as HTMLButtonElement[];
  const button = buttons.find((candidate) => candidate.textContent?.includes(text));

  expect(button).toBeTruthy();
  button!.click();
}

function submitForm(fixture: ComponentFixture<TicketTypes>): void {
  const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
  form.dispatchEvent(new Event('submit'));
}

function eventDetail(): EventDetail {
  const now = new Date().toISOString();

  return {
    event: {
      id: 'event-test',
      organizerId: 'organizer-test',
      venueId: 'venue-test',
      title: 'Test Event',
      slug: 'test-event',
      description: 'Demo event',
      category: 'concert',
      startsAt: now,
      status: 'published',
      createdAt: now,
      updatedAt: now,
    },
    organizer: {
      id: 'organizer-test',
      name: 'Organizer',
      slug: 'organizer',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    venue: {
      id: 'venue-test',
      name: 'Venue',
      address: 'Main St',
      city: 'Caracas',
      country: 'VE',
      createdAt: now,
      updatedAt: now,
    },
    ticketTypes: [
      {
        id: 'ticket-vip',
        eventId: 'event-test',
        name: 'VIP',
        price: 50,
        currency: 'USD',
        quantityTotal: 10,
        quantitySold: 5,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}
