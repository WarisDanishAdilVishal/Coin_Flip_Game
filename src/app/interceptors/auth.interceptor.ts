import { HttpEvent, HttpHandlerFn, HttpHeaders, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const token = localStorage.getItem('token'); // Get token directly from localStorage for reliability
  
  console.log('Auth Interceptor - Request URL:', req.url);
  console.log('Auth Interceptor - Token direct from localStorage:', token ? 'exists' : 'null');
  
  if (token) {
    console.log('Adding Authorization header with token');
    // Create headers with token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    // Clone the request with new headers
    const authReq = req.clone({ headers });
    console.log('Modified request headers:', authReq.headers.has('Authorization'));
    
    return next(authReq);
  } else {
    console.warn('No token available for request to:', req.url);
    return next(req);
  }
};