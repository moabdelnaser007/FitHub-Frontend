import { CommonModule, NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface Gym {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
  activities: string[];
  city?: string;
  address?: string;
  visitCreditsCost?: number;
}

@Component({
  selector: 'app-gym-card',
  standalone: true,
  imports: [CommonModule, NgFor, RouterModule],
  templateUrl: './gym-card.component.html',
  styleUrls: ['./gym-card.component.css'],
})
export class GymCardComponent {
  @Input() gym!: Gym;
  @Output() rate = new EventEmitter<Gym>();
}
