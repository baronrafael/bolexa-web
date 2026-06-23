import { computed, inject, Injectable, signal } from '@angular/core';
import { MockDatabase } from '../../data-access/mock/mock-database';
import { User, UserRole } from '../../data-access/models';

@Injectable({
  providedIn: 'root',
})
export class MockAuth {
  private readonly database = inject(MockDatabase);
  private readonly storageKey = 'bolexa.current-user-id.v1';
  private readonly currentUserId = signal(this.loadUserId());

  readonly demoUsers = computed(() => this.database.state().users.filter((user) => user.role !== 'admin'));
  readonly currentUser = computed(() => this.findCurrentUser());
  readonly currentRole = computed(() => this.currentUser().role);

  switchUser(userId: string): void {
    if (!this.database.state().users.some((user) => user.id === userId)) {
      return;
    }

    this.currentUserId.set(userId);
    this.persistUserId(userId);
  }

  switchRole(role: UserRole): void {
    const user = this.database.state().users.find((candidate) => candidate.role === role);

    if (user) {
      this.switchUser(user.id);
    }
  }

  private findCurrentUser(): User {
    const users = this.database.state().users;
    const selectedUser = users.find((user) => user.id === this.currentUserId());

    return selectedUser ?? users.find((user) => user.role === 'consumer') ?? users[0];
  }

  private loadUserId(): string {
    try {
      if (typeof localStorage === 'undefined') {
        return 'user-andrea';
      }

      return localStorage.getItem(this.storageKey) ?? 'user-andrea';
    } catch {
      return 'user-andrea';
    }
  }

  private persistUserId(userId: string): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, userId);
      }
    } catch {
      // Auth is mocked; persistence is not critical for the demo.
    }
  }
}
