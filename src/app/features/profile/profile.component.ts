import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="ft-page-title">Profile</h1>
    @if (user(); as u) {
      <div class="ft-card profile-box">
        <p><strong>Name:</strong> {{ u.firstName }} {{ u.lastName }}</p>
        <p><strong>Username:</strong> {{ u.userName }}</p>
        <p><strong>Email:</strong> {{ u.email }}</p>
        <p><strong>Currency:</strong> {{ u.currencyCode }}</p>
      </div>
    } @else {
      <p class="ft-muted">No profile loaded.</p>
    }
  `
})
export class ProfileComponent {
  protected readonly user = inject(AuthService).user;
}
