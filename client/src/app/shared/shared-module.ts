import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CircleAlert, Lock, LucideAngularModule, Mail } from 'lucide-angular';

@NgModule({
  declarations: [],
  imports: [CommonModule, LucideAngularModule.pick({ Mail, Lock, CircleAlert })],
  exports: [LucideAngularModule],
})
export class SharedModule {}
