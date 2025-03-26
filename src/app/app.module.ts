import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Shield, ShieldOff, ShieldAlert, Users, CreditCard, DollarSign, ArrowLeft, CheckCircle, XCircle, Search, AlertTriangle, Ban, UserCheck, Joystick } from 'lucide-angular';
import { authInterceptor } from './interceptors/auth.interceptor';
import { LoaderComponent } from './components/loader/loader.component';

@NgModule({
  imports: [
    BrowserModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    LucideAngularModule.pick({ Shield, ShieldOff, ShieldAlert, Users, CreditCard, DollarSign, ArrowLeft, CheckCircle, XCircle, Search, AlertTriangle, Ban, UserCheck, Joystick }),
    LoaderComponent
  ],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
})
export class AppModule { }