import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}
  
  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // First check if user is logged in
    if (!this.authService.isLoggedIn()) {
      return this.router.parseUrl('/login');
    }
    
    // Get current user from auth service
    const currentUser = this.authService.getCurrentUser();
    
    // Then check if user has admin role
    if (currentUser && this.adminService.isAdmin(currentUser.username)) {
      return true;
    }
    
    // If not admin, redirect to main game page
    return this.router.parseUrl('/game');
  }
}