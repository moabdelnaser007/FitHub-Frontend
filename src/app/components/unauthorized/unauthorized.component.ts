import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-unauthorized',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './unauthorized.component.html',
    styles: [`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
    }
    h2 { color: #dc2626; margin-bottom: 1rem; }
    p { font-size: 1.2rem; color: #4b5563; }
  `]
})
export class UnauthorizedComponent { }
