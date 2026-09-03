import {
  ChangeDetectionStrategy, Component, computed, HostListener, inject, signal
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;
  protected readonly profileMenuOpen = signal(false);
  protected readonly transactionsOpen = signal(true);
  protected readonly loansOpen = signal(false);
  protected readonly reportsOpen = signal(false);

  protected readonly displayName = computed(() => {
    const u = this.user();
    if (!u) return '';
    return u.lastName ? `${u.firstName} ${u.lastName}` : u.firstName;
  });

  constructor() {
    this.syncNavFromUrl(this.router.url);

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((event) => {
        this.syncNavFromUrl((event as NavigationEnd).urlAfterRedirects);
      });
  }

  @HostListener('document:click')
  protected onDocumentClick(): void {
    this.profileMenuOpen.set(false);
  }

  protected toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.profileMenuOpen.update((open) => !open);
  }

  protected closeProfileMenu(): void {
    this.profileMenuOpen.set(false);
  }

  protected toggleTransactions(): void {
    this.transactionsOpen.update((open) => !open);
  }

  protected toggleLoans(): void {
    this.loansOpen.update((open) => !open);
  }

  protected toggleReports(): void {
    this.reportsOpen.update((open) => !open);
  }

  protected logoutFromMenu(): void {
    this.profileMenuOpen.set(false);
    this.logout();
  }

  protected logout(): void {
    this.auth.logout();
  }

  private syncNavFromUrl(url: string): void {
    if (url.includes('/app/transactions')) {
      this.transactionsOpen.set(true);
    }

    if (url.includes('/app/loans')) {
      this.loansOpen.set(true);
    }

    if (url.includes('/app/reports')) {
      this.reportsOpen.set(true);
    }
  }
}
