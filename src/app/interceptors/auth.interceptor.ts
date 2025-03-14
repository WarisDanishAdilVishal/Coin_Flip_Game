import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('token'); // Get token directly from localStorage for reliability
    
    console.log('Auth Interceptor - Request URL:', request.url);
    console.log('Auth Interceptor - Token direct from localStorage:', token ? 'exists' : 'null');
    
    if (token) {
      console.log('Adding Authorization header with token');
      // Create headers with token
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      
      // Clone the request with new headers
      const authReq = request.clone({ headers });
      console.log('Modified request headers:', authReq.headers.has('Authorization'));
      
      return next.handle(authReq);
    } else {
      console.warn('No token available for request to:', request.url);
      return next.handle(request);
    }
  }
}