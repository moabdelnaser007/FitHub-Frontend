import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, ProfileComponent],
  exports: [ProfileComponent]
})
export class ProfileModule {}
