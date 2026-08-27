import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { ApiService } from '../../core/http/api.service';
import { Coa } from '../../core/models';

const DASHBOARD_CODES = new Set(['10100', '10200', '10300', '20100']);

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.user;
  protected readonly today = new Date();

  protected readonly accountsResource = rxResource({
    stream: () =>
      this.api
        .get<Coa[]>('/api/Coas')
        .pipe(map((coas) => coas.filter((c) => DASHBOARD_CODES.has(c.accountCode))))
  });

  protected readonly accounts = computed(() => this.accountsResource.value() ?? []);
  protected readonly loading = computed(() => this.accountsResource.isLoading());
  protected readonly loadError = computed(() => {
    const err = this.accountsResource.error();
    return err instanceof Error ? err.message : err ? String(err) : null;
  });
}
