import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
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
export class BookingConfirmationComponent implements OnInit {
  bookingCode = 'BKNG-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  gymName = 'Powerhouse Gym';
  address = '123 Fitness Avenue, Metro City';
  date = 'Monday, October 28, 2024';
  time = '5:00 PM - 6:00 PM';
  creditsUsed = 0;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['gymName']) this.gymName = params['gymName'];
      if (params['date']) this.date = params['date'];
      if (params['time']) this.time = params['time'];
      if (params['cost']) this.creditsUsed = Number(params['cost']);

      // If we had gymID, we could fetch address, but we'll leave placeholder for now
      // dependent on what was passed or if we fetch details again
    });
  }
}

