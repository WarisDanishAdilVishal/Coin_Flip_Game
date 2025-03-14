import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, User, Lock, AlertCircle } from 'lucide-angular';
import { ButtonComponent } from '../../components/button/button.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-black">
      <div class="absolute inset-0 bg-gradient-to-b from-[#ff0080]/20 via-[#40e0d0]/20 to-[#ff8c00]/20 pointer-events-none"></div>
      <div class="bg-black/70 p-8 rounded-xl border border-pink-500/30 shadow-neon max-w-md w-full relative z-10">
        <h1 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-6 game-title text-center">
          Coin Flip Casino
        </h1>
        
        <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-300 flex items-center gap-2">
          <lucide-icon name="alert-circle" [size]="18"></lucide-icon>
          <span>{{ errorMessage }}</span>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-pink-300 mb-2">Username</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <lucide-icon name="user" [size]="18" class="text-pink-500/50"></lucide-icon>
              </div>
              <input 
                type="text" 
                [(ngModel)]="username"
                class="w-full bg-black/50 border border-pink-500/30 rounded-md p-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                placeholder="Enter your username"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm text-pink-300 mb-2">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <lucide-icon name="lock" [size]="18" class="text-pink-500/50"></lucide-icon>
              </div>
              <input 
                type="password" 
                [(ngModel)]="password"
                class="w-full bg-black/50 border border-pink-500/30 rounded-md p-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                placeholder="Enter your password"
              />
            </div>
          </div>
          
          <app-button 
            (onClick)="login()"
            [disabled]="!username.trim() || !password.trim() || isLoading"
            className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white p-3 rounded-md font-medium disabled:opacity-50 shadow-neon"
          >
            <span *ngIf="isLoading">Logging in...</span>
            <span *ngIf="!isLoading">Login</span>
          </app-button>
          
          <div class="text-center text-pink-300 text-sm">
            Don't have an account? 
            <a routerLink="/signup" class="text-pink-500 hover:text-pink-400 underline">Sign up</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  login(): void {
    if (!this.username.trim() || !this.password.trim() || this.isLoading) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/game']);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Login failed. Please try again.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}