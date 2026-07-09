import { TestBed } from '@angular/core/testing';
import { MockDatabase } from '../mock/mock-database';
import { ScannerRepository } from './scanner-repository';

describe('ScannerRepository', () => {
  let database: MockDatabase;
  let repository: ScannerRepository;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    database = TestBed.inject(MockDatabase);
    repository = TestBed.inject(ScannerRepository);
    database.reset();
  });

  it('validates a valid ticket for the selected event', async () => {
    const result = await repository.validateTicket('event-caracas-music-fest', 'BLX-CMF-GEN-1001');

    expect(result.status).toBe('accepted');
    expect(result.ticket?.id).toBe('ticket-1001');
  });

  it('marks a ticket used and rejects duplicate scans', async () => {
    const checkIn = await repository.checkIn('event-caracas-music-fest', 'BLX-CMF-GEN-1001', 'user-carlos-entrada');
    const duplicate = await repository.validateTicket('event-caracas-music-fest', 'BLX-CMF-GEN-1001');

    expect(checkIn.status).toBe('accepted');
    expect(checkIn.checkedInAt).toBeTruthy();
    expect(duplicate.status).toBe('already_used');
  });

  it('rejects invalid and wrong-event scans', async () => {
    const invalid = await repository.validateTicket('event-caracas-music-fest', 'not-a-real-qr');
    const wrongEvent = await repository.validateTicket('event-lecheria-10k', 'BLX-CMF-GEN-1001');

    expect(invalid.status).toBe('invalid_ticket');
    expect(wrongEvent.status).toBe('wrong_event');
  });
});
