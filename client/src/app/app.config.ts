import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  Activity,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  CornerDownRight,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Info,
  Languages,
  LayoutDashboard,
  Link,
  Lock,
  LogOut,
  LUCIDE_ICONS,
  LucideIconProvider,
  Mail,
  Menu,
  Moon,
  Pencil,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  TriangleAlert,
  User,
  Users,
  X,
} from 'lucide-angular';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { authInterceptor, httpErrorInterceptor } from './core/auth/interceptors';

if (environment.production) {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, httpErrorInterceptor])),
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Mail,
        Lock,
        Eye,
        EyeOff,
        ArrowRight,
        CircleAlert,
        Check,
        X,
        Pencil,
        ChevronRight,
        ChevronLeft,
        Sun,
        Moon,
        LogOut,
        LayoutDashboard,
        FileText,
        Settings,
        Globe,
        Languages,
        User,
        Users,
        TrendingUp,
        ClipboardList,
        Activity,
        Sparkles,
        Search,
        Plus,
        Trash2,
        Info,
        TriangleAlert,
        Menu,
        CornerDownRight,
        Link,
      }),
    },
  ],
};
