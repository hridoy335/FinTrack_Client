import { inject, Injectable } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { ApiEndpoints } from '../../core/api/api-endpoints';
import { ApiService } from '../../core/http/api.service';
import { AuthUser } from '../auth/auth.model';
import { UpdateProfileRequest, UserProfile } from './profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  getByUserId(userId: number): Observable<UserProfile> {
    return this.api.get<UserProfile>(ApiEndpoints.userInfos.byId(userId));
  }

  update(id: number, body: UpdateProfileRequest): Observable<UserProfile> {
    return this.api.put<{ id: number }>(ApiEndpoints.userInfos.byId(id), body).pipe(
      switchMap(() => this.getByUserId(id)),
      tap((profile) => this.syncSessionUser(profile))
    );
  }

  private syncSessionUser(profile: UserProfile): void {
    const user: AuthUser = {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      currencyCode: profile.currencyCode
    };

    this.auth.updateSessionUser(user);
  }
}
