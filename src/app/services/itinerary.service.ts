import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TripRequest, TripResponse } from '../models/trip.models';

@Injectable({ providedIn: 'root' })
export class ItineraryService {
  private apiUrl = 'http://localhost:5011/api';

  private get noCacheHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    });
  }

  constructor(private http: HttpClient) {}

  planTrip(request: TripRequest): Observable<TripResponse> {
    return this.http.post<TripResponse>(`${this.apiUrl}/itinerary/plan`, request, { headers: this.noCacheHeaders });
  }

  getDestinations(type: string = 'both'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/itinerary/destinations?type=${type}`, { headers: this.noCacheHeaders });
  }
}
