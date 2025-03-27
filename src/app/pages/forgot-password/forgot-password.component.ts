import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-angular';
import { ButtonComponent } from '../../components/button/button.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  private router = inject(Router);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  
  requestPasswordReset(): void {
    this.errorMessage = '';
    this.successMessage = '';
    
    // Validate email
    if (!this.email || !this.validateEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      this.toastService.showError(this.errorMessage);
      return;
    }
    
    this.isLoading = true;
    console.log('Sending password reset request for email:', this.email);
    
    this.userService.forgotPassword(this.email).subscribe({
      next: (response) => {
        console.log('Password reset request successful:', response);
        this.isLoading = false;
        this.successMessage = 'Password reset instructions have been sent to your email.';
        this.toastService.showSuccess('Reset link sent successfully!');
      },
      error: (error) => {
        console.error('Password reset request failed:', error);
        this.isLoading = false;
        // Extract error message from the error response
        const errorMessage = error?.error?.error || error?.message || 'Failed to send reset link. Please try again.';
        this.errorMessage = errorMessage;
        this.toastService.showError(this.errorMessage);
      }
    });
  }
  
  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
  
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
} 