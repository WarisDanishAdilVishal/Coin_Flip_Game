import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, User, Lock, AlertCircle, UserPlus } from 'lucide-angular';
import { ButtonComponent } from '../../components/button/button.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit{
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  email: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {}
  
  
  signup(): void {
    // Reset error message
    this.errorMessage = '';

    // Validate required fields
    if (!this.username.trim()) {
      this.errorMessage = 'Username is required';
      return;
    }

    if (!this.email.trim()) {
      this.errorMessage = 'Email address is required';
      return;
    }

    if (!this.validateEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    if (!this.password.trim() || !this.confirmPassword.trim()) {
      this.errorMessage = 'Password is required';
      return;
    }
    
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }
    
    this.isLoading = true;
    
    this.authService.register(this.username, this.password, this.email).subscribe({
      next: () => {
        this.router.navigate(['/game']);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  
  private validateEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }
}