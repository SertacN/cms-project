import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Eye,
  EyeOff,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  LUCIDE_ICONS,
  Lock,
  LucideIconProvider,
  Mail,
  Moon,
  Pencil,
  Settings,
  Sun,
  User,
  X,
} from 'lucide-angular';
import { authInterceptor } from './core/auth/interceptors';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimations(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Mail, Lock, Eye, EyeOff, ArrowRight, CircleAlert,
        Check, X, Pencil, ChevronRight, ChevronLeft,
        Sun, Moon, LogOut, LayoutDashboard, FileText, Settings, Globe, User,
      }),
    },
  ],
};
