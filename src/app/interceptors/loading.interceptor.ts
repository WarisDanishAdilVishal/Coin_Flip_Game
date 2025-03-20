import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

// Counter for active requests
let activeRequests = 0;

export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const loadingService = inject(LoadingService);
  
  // Skip showing loader for certain endpoints if needed
  if (req.url.includes('/some-quick-endpoint')) {
    return next(req);
  }

  if (activeRequests === 0) {
    console.log('Loading: Started');
    loadingService.show();
  }
  
  activeRequests++;
  console.log(`Loading: Request started (${activeRequests} active)`);
  
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        console.log(`Loading: Request completed for ${req.url}`);
      }
    }),
    finalize(() => {
      activeRequests--;
      console.log(`Loading: Request finished (${activeRequests} active)`);
      
      if (activeRequests === 0) {
        console.log('Loading: All requests complete');
        loadingService.hide();
      }
    })
  );
}; 