import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coin-svg',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg viewBox="0 0 200 200" class="w-full h-full">
      <defs>
        <radialGradient id="coinGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" [attr.style]="'stop-color: #E0E0E0'" />
          <stop offset="70%" [attr.style]="'stop-color: #C0C0C0'" />
          <stop offset="100%" [attr.style]="'stop-color: #A0A0A0'" />
        </radialGradient>
        <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" [attr.style]="'stop-color: #FFFFFF'" />
          <stop offset="50%" [attr.style]="'stop-color: #C0C0C0'" />
          <stop offset="100%" [attr.style]="'stop-color: #808080'" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="98" fill="url(#coinGradient)" stroke="url(#edgeGradient)" stroke-width="4" />
      
      <text *ngIf="side === 'heads'" x="100" y="115" 
        text-anchor="middle" 
        fill="#666" 
        font-size="40" 
        font-weight="bold" 
        font-family="Orbitron"
      >HEADS</text>
      
      <text *ngIf="side === 'tails'" x="100" y="115" 
        text-anchor="middle" 
        fill="#666" 
        font-size="40" 
        font-weight="bold" 
        font-family="Orbitron"
      >TAILS</text>
      
      <text *ngIf="side === null" x="100" y="115" 
        text-anchor="middle" 
        fill="#666" 
        font-size="80" 
        font-weight="bold" 
        font-family="Orbitron"
      >?</text>

      <circle cx="100" cy="100" r="98" fill="none" stroke="#A0A0A0" stroke-width="1" />
    </svg>
  `
})
export class CoinSvgComponent {
  @Input() side: string | null = null;
}