import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface CityResult {
  name: string;
  country: string;
  state?: string;
  displayName: string;
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly photonUrl = 'https://photon.komoot.io/api/';

  constructor(private http: HttpClient) {}

  searchCities(query: string): Observable<CityResult[]> {
    if (!query || query.length < 2) return of([]);
    return this.http.get<any>(
      `${this.photonUrl}?q=${encodeURIComponent(query)}&limit=15&layer=city&lang=en`
    ).pipe(
      map(res => (res.features ?? [])
        .filter((f: any) => f.properties?.country === 'India')
        .map((f: any) => {
          const p = f.properties;
          const display = p.state ? `${p.name}, ${p.state}` : p.name;
          return { name: p.name, country: p.country, state: p.state, displayName: display };
        })
      ),
      catchError(() => of([]))
    );
  }
}
