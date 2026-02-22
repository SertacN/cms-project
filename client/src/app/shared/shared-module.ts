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
  Pencil,
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
      Pencil,
    }),
  ],
  exports: [LucideAngularModule],
})
export class SharedModule {}
