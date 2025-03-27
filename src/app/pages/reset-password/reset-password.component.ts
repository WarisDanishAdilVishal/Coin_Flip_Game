import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-angular';
import { ButtonComponent } from '../../components/button/button.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  isTokenChecking: boolean = true;
  isTokenValid: boolean = false;
  isLoading: boolean = false;
  
  errorMessage: string = '';
  successMessage: string = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      
      if (!this.token) {
        this.isTokenChecking = false;
        this.isTokenValid = false;
        this.errorMessage = 'Reset token is missing. Please request a new password reset.';
        return;
      }
      
      this.validateToken();
    });
  }

  validateToken(): void {
    this.isTokenChecking = true;
    this.errorMessage = '';
    
    this.userService.validateResetToken(this.token).subscribe({
      next: () => {
        this.isTokenValid = true;
        this.isTokenChecking = false;
      },
      error: (error) => {
        this.isTokenValid = false;
        this.isTokenChecking = false;
        this.errorMessage = error.error?.message || 'Invalid or expired reset token. Please request a new password reset.';
      }
    });
  }

  resetPassword(): void {
    this.errorMessage = '';
    
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please enter and confirm your new password.';
      return;
    }
    
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match. Please try again.';
      return;
    }
    
    if (this.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long.';
      return;
    }
    
    this.isLoading = true;
    
    this.userService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Your password has been successfully reset. You can now log in with your new password.';
        this.toastService.showSuccess('Password reset successful!');
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to reset password. Please try again.';
        this.toastService.showError(this.errorMessage);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
} 