import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LoaderComponent } from './components/loader/loader.component';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    LoaderComponent,
    ToastComponent
  ],
  template: `
    <app-loader></app-loader>
    <app-toast></app-toast>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  // Application component
}
