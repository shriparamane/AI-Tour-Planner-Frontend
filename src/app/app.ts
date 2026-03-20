import { Component } from '@angular/core';
import { TripPlannerComponent } from './components/trip-planner/trip-planner.component';

@Component({
  selector: 'app-root',
  imports: [TripPlannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
