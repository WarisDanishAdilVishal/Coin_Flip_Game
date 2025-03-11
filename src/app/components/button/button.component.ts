import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [disabled]="disabled"
      [ngClass]="[className, 'btn-glow']"
      (click)="onClick.emit($event)"
      (mouseenter)="isHovered = true"
      (mouseleave)="isHovered = false"
      class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background relative overflow-hidden"
      [class.scale-105]="isHovered && !disabled"
      [style.fontSize]="fontSize"
      [style.padding]="padding"
    >
      <div class="relative z-10 flex items-center justify-center">
        <ng-content></ng-content>
      </div>
    </button>
  `
})
export class ButtonComponent {
  @Input() className: string = '';
  @Input() disabled: boolean = false;
  @Input() fontSize: string = '0.875rem'; // Default text-sm
  @Input() padding: string = '0.5rem 1rem'; // Default padding
  @Output() onClick = new EventEmitter<MouseEvent>();
  
  isHovered: boolean = false;
}