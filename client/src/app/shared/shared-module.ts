import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ArrowRight,
  CircleAlert,
  Lock,
  LucideAngularModule,
  Mail,
  Eye,
  EyeOff,
  ChevronRight,
  X,
  Check,
} from 'lucide-angular';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    LucideAngularModule.pick({
      Mail,
      Lock,
      CircleAlert,
      ArrowRight,
      Eye,
      EyeOff,
      ChevronRight,
      X,
      Check,
    }),
  ],
  exports: [LucideAngularModule],
})
export class SharedModule {}
