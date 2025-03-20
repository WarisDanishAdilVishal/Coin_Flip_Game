import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { LucideAngularModule, Coins, Plus, X, History, Sparkles, AlertTriangle, LogOut, CreditCard, User, Lock, AlertCircle, UserPlus, Calendar, ArrowLeft, Clock, CheckCircle, ChevronRight, ArrowRight, BarChart, Users, DollarSign, XCircle, Search, Ban, UserCheck, ShieldAlert } from 'lucide-angular';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { loadingInterceptor } from './app/interceptors/loading.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptors([
      authInterceptor,
      loadingInterceptor
    ])),
    provideRouter(routes),
    importProvidersFrom(
      LucideAngularModule.pick({
        Coins,
        Plus,
        X,
        History,
        Sparkles,
        AlertTriangle,
        LogOut,
        CreditCard,
        User,
        Lock,
        AlertCircle,
        UserPlus,
        Calendar,
        ArrowLeft,
        Clock,
        CheckCircle,
        ChevronRight,
        ArrowRight,
        BarChart,
        Users,
        DollarSign,
        XCircle,
        Search,
        Ban,
        UserCheck,
        ShieldAlert
      })
    )
  ]
}).catch(err => console.error(err));