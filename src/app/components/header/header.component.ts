import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, User, LogOut, Coins } from 'lucide-angular';
import { ButtonComponent } from '../button/button.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent
  ],
  template: `
    <header class="w-full bg-black/80 backdrop-blur-md border-b border-pink-500/20 py-3 px-4 sm:px-6">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center">
          <h1 class="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 game-title">
            Coin Flip Casino
          </h1>
        </div>
        
        <div class="flex items-center gap-3 sm:gap-4">
          <div *ngIf="showBalance" class="hidden sm:flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full border border-pink-500/30">
            <lucide-icon name="coins" [size]="18" class="text-yellow-400 floating"></lucide-icon>
            <span class="text-pink-300 font-medium">₹{{ balance.toLocaleString() }}</span>
          </div>
          
          <a routerLink="/profile" class="relative group">
            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 p-0.5 transition-all duration-300 transform group-hover:scale-110">
              <div class="w-full h-full rounded-full bg-black/80 flex items-center justify-center overflow-hidden">
                <lucide-icon name="user" [size]="20" class="text-white"></lucide-icon>
              </div>
            </div>
            <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-black"></div>
          </a>
          
          <app-button
            (onClick)="logout()"
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30 shadow-neon-red"
            fontSize="0.75rem"
            padding="0.375rem 0.75rem"
          >
            <lucide-icon name="log-out" [size]="14" class="mr-1"></lucide-icon> Logout
          </app-button>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  @Input() showBalance: boolean = true;
  @Input() balance: number = 0;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}