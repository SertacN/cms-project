import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  Activity,
  ArrowRight,
  Info,
  Menu,
  Trash2,
  TriangleAlert,
  TrendingUp,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardList,
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
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  User,
  Users,
  X,
} from 'lucide-angular';
import { authInterceptor } from './core/auth/interceptors';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Mail, Lock, Eye, EyeOff, ArrowRight, CircleAlert,
        Check, X, Pencil, ChevronRight, ChevronLeft,
        Sun, Moon, LogOut, LayoutDashboard, FileText, Settings, Globe, User,
        Users, TrendingUp, ClipboardList, Activity, Sparkles, Search, Plus, Trash2,
        Info, TriangleAlert, Menu,
      }),
    },
  ],
};
