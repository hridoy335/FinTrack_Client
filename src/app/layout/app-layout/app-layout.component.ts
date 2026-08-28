import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent {
  private readonly auth = inject(AuthService);
  protected readonly user = this.auth.user;
  protected readonly displayName = computed(() => {
    const u = this.user();
    if (!u) return '';
    return u.lastName ? `${u.firstName} ${u.lastName}` : u.firstName;
  });

  logout(): void {
    this.auth.logout();
  }
}
