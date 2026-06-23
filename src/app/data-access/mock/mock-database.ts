import { Injectable, signal } from '@angular/core';
import { MockDatabaseState } from '../models';
import { createInitialMockDatabase } from './mock-data';
import { clone } from './mock-helpers';

@Injectable({
  providedIn: 'root',
})
export class MockDatabase {
  private readonly storageKey = 'bolexa.mock-db.v1';
  private readonly stateSignal = signal<MockDatabaseState>(this.loadInitialState());

  readonly state = this.stateSignal.asReadonly();

  snapshot(): MockDatabaseState {
    return clone(this.stateSignal());
  }

  update(mutator: (state: MockDatabaseState) => void): MockDatabaseState {
    const nextState = this.snapshot();

    mutator(nextState);
    this.stateSignal.set(nextState);
    this.persist(nextState);

    return clone(nextState);
  }

  reset(): MockDatabaseState {
    const nextState = createInitialMockDatabase();

    this.stateSignal.set(nextState);
    this.persist(nextState);

    return clone(nextState);
  }

  private loadInitialState(): MockDatabaseState {
    const savedState = this.readFromStorage();

    return savedState ?? createInitialMockDatabase();
  }

  private readFromStorage(): MockDatabaseState | null {
    try {
      if (typeof localStorage === 'undefined') {
        return null;
      }

      const rawState = localStorage.getItem(this.storageKey);

      return rawState ? JSON.parse(rawState) as MockDatabaseState : null;
    } catch {
      return null;
    }
  }

  private persist(state: MockDatabaseState): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(state));
      }
    } catch {
      // Persistence is best-effort for the mock demo store.
    }
  }
}
