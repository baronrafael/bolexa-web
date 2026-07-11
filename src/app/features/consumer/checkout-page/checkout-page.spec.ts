import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MockAuth } from '../../../core/auth/mock-auth';
import { Currency, EventDetail, Order } from '../../../data-access/models';
import { CheckoutRepository } from '../../../data-access/repositories/checkout-repository';
import { EventsRepository } from '../../../data-access/repositories/events-repository';
import { CheckoutPage } from './checkout-page';

describe('CheckoutPage validation', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CheckoutPage],
      providers: [
        provideRouter([]),
        {
          provide: EventsRepository,
          useValue: {
            getEventById: vi.fn().mockResolvedValue(eventDetail()),
          },
        },
        {
          provide: CheckoutRepository,
          useValue: {
            createOrder: vi.fn().mockResolvedValue(order()),
            payOrder: vi.fn().mockResolvedValue({ order: order('order-paid'), tickets: [] }),
          },
        },
        {
          provide: ActivatedRouteStub,
          useFactory: () => activatedRouteStub(),
        },
        {
          provide: ActivatedRoute,
          useExisting: ActivatedRouteStub,
        },
      ],
    }).compileComponents();

    TestBed.inject(MockAuth).switchRole('consumer');
  });

  it('blocks submission when buyer email is invalid', async () => {
    const { fixture, checkoutRepository } = await setupCheckout();
    const emailInput = fixture.nativeElement.querySelector(
      'input[type="email"]',
    ) as HTMLInputElement;

    emailInput.value = 'invalid-email';
    emailInput.dispatchEvent(new Event('input'));
    clickButton(fixture, 'Simular pago aprobado');
    await fixture.whenStable();

    expect(checkoutRepository.createOrder).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Ingresa un correo valido.');
  });

  it.each(['Pago manual', 'Tarjeta (placeholder)'])(
    'does not require payment reference for %s',
    async (paymentLabel) => {
      const { fixture, checkoutRepository, router } = await setupCheckout();

      clickButton(fixture, paymentLabel);
      clickButton(fixture, 'Simular pago aprobado');
      await fixture.whenStable();

      expect(checkoutRepository.createOrder).toHaveBeenCalledTimes(1);
      expect(checkoutRepository.payOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: paymentLabel === 'Pago manual' ? 'manual' : 'card',
          paymentReference: undefined,
        }),
      );
      expect(router.navigate).toHaveBeenCalledWith([
        '/checkout',
        'event-test',
        'confirmation',
        'order-paid',
      ]);
    },
  );
});

class ActivatedRouteStub {
  readonly paramMap = of(convertToParamMap({ eventId: 'event-test' }));
  readonly queryParamMap = of(convertToParamMap({}));
}

function activatedRouteStub(): ActivatedRouteStub {
  return new ActivatedRouteStub();
}

async function setupCheckout(): Promise<{
  fixture: ComponentFixture<CheckoutPage>;
  checkoutRepository: CheckoutRepositorySpy;
  router: Router;
}> {
  const fixture = TestBed.createComponent(CheckoutPage);
  const router = TestBed.inject(Router);
  const checkoutRepository = TestBed.inject(CheckoutRepository) as unknown as CheckoutRepositorySpy;

  vi.spyOn(router, 'navigate').mockResolvedValue(true);
  await fixture.whenStable();

  return { fixture, checkoutRepository, router };
}

interface CheckoutRepositorySpy {
  createOrder: ReturnType<typeof vi.fn>;
  payOrder: ReturnType<typeof vi.fn>;
}

function clickButton(fixture: ComponentFixture<CheckoutPage>, text: string): void {
  const buttons = Array.from(
    fixture.nativeElement.querySelectorAll('button'),
  ) as HTMLButtonElement[];
  const button = buttons.find((candidate) => candidate.textContent?.includes(text));

  expect(button).toBeTruthy();
  button!.click();
}

function eventDetail(): EventDetail {
  return {
    event: {
      id: 'event-test',
      organizerId: 'organizer-test',
      venueId: 'venue-test',
      title: 'Test Event',
      slug: 'test-event',
      description: 'Demo event',
      category: 'concert',
      startsAt: new Date('2027-01-01T20:00:00.000Z').toISOString(),
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    organizer: {
      id: 'organizer-test',
      name: 'Organizer',
      slug: 'organizer',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    venue: {
      id: 'venue-test',
      name: 'Venue',
      address: 'Main St',
      city: 'Caracas',
      country: 'VE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    ticketTypes: [
      {
        id: 'ticket-general',
        eventId: 'event-test',
        name: 'General',
        price: 10,
        currency: 'USD',
        quantityTotal: 20,
        quantitySold: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };
}

function order(id = 'order-test', currency: Currency = 'USD'): Order {
  return {
    id,
    userId: 'user-andrea',
    eventId: 'event-test',
    status: 'pending',
    subtotal: 10,
    fees: 0.8,
    total: 10.8,
    currency,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
