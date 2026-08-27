import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './core/http/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Last interceptor is closest to the network → auth sees 401 before error maps it.
    provideHttpClient(withFetch(), withInterceptors([errorInterceptor, authInterceptor])),
    provideRouter(routes, withComponentInputBinding())
  ]
};
