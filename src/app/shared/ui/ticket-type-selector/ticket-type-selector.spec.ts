import { TestBed } from '@angular/core/testing';
import { TicketType } from '../../../data-access/models';
import { TicketTypeSelector } from './ticket-type-selector';

describe('TicketTypeSelector', () => {
  const ticketType: TicketType = {
    id: 'tt-test',
    eventId: 'event-test',
    name: 'General',
    price: 20,
    currency: 'USD',
    quantityTotal: 3,
    quantitySold: 1,
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketTypeSelector],
    }).compileComponents();
  });

  it('emits quantity changes within available bounds', () => {
    const fixture = TestBed.createComponent(TicketTypeSelector);
    fixture.componentRef.setInput('ticketType', ticketType);
    fixture.componentRef.setInput('quantity', 1);
    const emitted: number[] = [];

    fixture.componentInstance.quantityChange.subscribe((quantity) => emitted.push(quantity));
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    buttons[0].click();
    buttons[1].click();

    expect(emitted).toEqual([0, 2]);
  });

  it('does not increment when sold out or quantity reaches available tickets', () => {
    const fixture = TestBed.createComponent(TicketTypeSelector);
    fixture.componentRef.setInput('ticketType', ticketType);
    fixture.componentRef.setInput('quantity', 2);
    const emitted: number[] = [];

    fixture.componentInstance.quantityChange.subscribe((quantity) => emitted.push(quantity));
    fixture.detectChanges();

    const incrementButton = fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement;
    incrementButton.click();

    expect(incrementButton.disabled).toBe(true);
    expect(emitted).toEqual([]);
  });
});
