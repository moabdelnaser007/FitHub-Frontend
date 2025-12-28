import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Booking {
  user: string;
  branch: string;
  dateTime: string;
  status: 'Completed' | 'Confirmed' | 'No Show' | 'Cancelled';
}

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingsComponent {
  searchText: string = '';
  
  bookings: Booking[] = [
    {
      user: 'Alex Johnson',
      branch: 'Downtown Core',
      dateTime: 'Oct 24, 2024 - 09:00 AM',
      status: 'Completed'
    },
    {
      user: 'Samantha Miller',
      branch: 'Eastside Gym',
      dateTime: 'Oct 25, 2024 - 11:30 AM',
      status: 'Confirmed'
    },
    {
      user: 'Michael Chen',
      branch: 'Westwood Fitness',
      dateTime: 'Oct 26, 2024 - 02:00 PM',
      status: 'No Show'
    },
    {
      user: 'Emily Rodriguez',
      branch: 'Downtown Core',
      dateTime: 'Oct 26, 2024 - 04:30 PM',
      status: 'Cancelled'
    },
    {
      user: 'David Lee',
      branch: 'North Point Center',
      dateTime: 'Oct 27, 2024 - 08:00 AM',
      status: 'Confirmed'
    },
    {
      user: 'Jessica White',
      branch: 'Eastside Gym',
      dateTime: 'Oct 27, 2024 - 10:00 AM',
      status: 'Confirmed'
    },
    {
      user: 'Chris Green',
      branch: 'Downtown Core',
      dateTime: 'Oct 28, 2024 - 05:00 PM',
      status: 'Confirmed'
    }
  ];

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Completed': 'status-completed',
      'Confirmed': 'status-confirmed',
      'No Show': 'status-no-show',
      'Cancelled': 'status-cancelled'
    };
    return statusClasses[status] || '';
  }

  onSearch(): void {
    console.log('Searching for:', this.searchText);
  }

  onFilter(): void {
    console.log('Filter clicked');
  }

  onPrevious(): void {
    console.log('Previous page');
  }

  onNext(): void {
    console.log('Next page');
  }
}