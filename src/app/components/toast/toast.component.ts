import { Component, OnInit } from '@angular/core';
import { ToastService, ToastMessage } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit {
  toasts: ToastMessage[] = [];

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  removeToast(id: string): void {
    this.toastService.removeToast(id);
  }

  getIconName(type: string): string {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert-triangle';
      case 'info':
        return 'info';
      default:
        return 'bell';
    }
  }

  getToastClasses(type: string): string {
    const baseClasses = 'min-w-[300px] max-w-sm rounded-md shadow-lg border px-4 py-3 flex items-start gap-3 transform transition-all duration-300 ease-in-out';
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-900/70 border-green-500/30 text-green-300`;
      case 'error':
        return `${baseClasses} bg-red-900/70 border-red-500/30 text-red-300`;
      case 'warning':
        return `${baseClasses} bg-yellow-900/70 border-yellow-500/30 text-yellow-300`;
      case 'info':
        return `${baseClasses} bg-blue-900/70 border-blue-500/30 text-blue-300`;
      default:
        return `${baseClasses} bg-gray-900/70 border-gray-500/30 text-gray-300`;
    }
  }
} 