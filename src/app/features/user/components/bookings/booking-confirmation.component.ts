import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../shared/components/header/header.component';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent, // enable <app-header>
  ],
  templateUrl: './booking-confirmation.component.html',
  styleUrl: './booking-confirmation.component.css',
})
export class BookingConfirmationComponent {
  bookingCode = 'BKNG-A4B8C1';
  gymName = 'Powerhouse Gym';
  address = '123 Fitness Avenue, Metro City';
  date = 'Monday, October 28, 2024';
  time = '5:00 PM - 6:00 PM';
  creditsUsed = 5;
}
