import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { LucideAngularModule, X, CreditCard, Loader } from 'lucide-angular';

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, LucideAngularModule],
  template: `
    <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-black/90 rounded-2xl border border-pink-500/30 shadow-neon max-w-md w-full p-6 relative">
        <button 
          (click)="onClose.emit()" 
          class="absolute top-4 right-4 text-white/50 hover:text-white"
          [disabled]="isLoading"
        >
          <lucide-icon name="x" [size]="24"></lucide-icon>
        </button>
        
        <h2 class="text-2xl font-bold text-white mb-6 flex items-center">
          <lucide-icon name="credit-card" [size]="24" class="mr-2 text-pink-400"></lucide-icon>
          Add Funds
        </h2>
        
        <div *ngIf="errorMessage" class="mb-4 bg-red-500/20 text-red-400 p-3 rounded-lg text-sm">
          {{ errorMessage }}
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-pink-300 mb-2">Select Amount</label>
            <div class="grid grid-cols-2 gap-3">
              <app-button 
                *ngFor="let amount of amounts"
                [className]="selectedAmount === amount ? 
                  'bg-pink-600 hover:bg-pink-700 text-white shadow-neon h-12 w-full' : 
                  'bg-black/30 hover:bg-black/50 text-pink-300 border border-pink-500/30 h-12 w-full'"
                (onClick)="selectedAmount = amount"
                [disabled]="isLoading"
              >
                ₹{{ amount.toLocaleString() }}
              </app-button>
            </div>
          </div>
          
          <div class="pt-4">
            <app-button 
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white h-12 shadow-neon"
              (onClick)="addFunds()"
              [disabled]="isLoading"
            >
              <div *ngIf="isLoading" class="flex items-center justify-center">
                <lucide-icon name="loader" [size]="20" class="animate-spin mr-2"></lucide-icon>
                Processing...
              </div>
              <span *ngIf="!isLoading">Add ₹{{ selectedAmount.toLocaleString() }}</span>
            </app-button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentPageComponent {
  @Input() isLoading: boolean = false;
  @Input() errorMessage: string | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onAddFunds = new EventEmitter<number>();
  
  amounts: number[] = [1000, 2000, 5000, 10000];
  selectedAmount: number = 1000;
  
  addFunds(): void {
    if (!this.isLoading) {
      this.onAddFunds.emit(this.selectedAmount);
    }
  }
}