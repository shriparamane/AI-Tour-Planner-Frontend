import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

import { ItineraryService } from '../../services/itinerary.service';
import { GeocodingService, CityResult } from '../../services/geocoding.service';
import { TripRequest, TripResponse, ItineraryPlan } from '../../models/trip.models';
import { PlanCardComponent } from '../plan-card/plan-card.component';

@Component({
  selector: 'app-trip-planner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatIconModule, MatChipsModule,
    MatTooltipModule, MatSnackBarModule, MatAutocompleteModule,
    PlanCardComponent
  ],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(80, animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true })
      ])
    ])
  ],
  templateUrl: './trip-planner.component.html',
  styles: [`
    * { box-sizing: border-box; }

    .hero-section {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: white; padding: 60px 24px 50px; text-align: center;
      position: relative; overflow: hidden;
    }
    .hero-section::before {
      content: ''; position: absolute; inset: 0;
      background: url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=600&fit=crop') center/cover;
      opacity: 0.2;
    }
    .hero-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
    .hero-icon mat-icon { font-size: 64px; height: 64px; width: 64px; color: #ffd700; }
    .hero-title { font-size: clamp(1.8rem, 5vw, 3.2rem); font-weight: 800; margin: 16px 0 8px; }
    .hero-subtitle { font-size: 1rem; opacity: 0.9; margin-bottom: 24px; line-height: 1.6; }
    .hero-badges { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .badge {
      background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
      border-radius: 20px; padding: 5px 14px; font-size: 0.82rem;
      display: flex; align-items: center; gap: 6px; backdrop-filter: blur(4px);
    }
    .badge mat-icon { font-size: 15px; height: 15px; width: 15px; }

    .search-section {
      max-width: 900px; margin: -30px auto 40px; padding: 0 16px;
      position: relative; z-index: 10;
    }
    .search-card { border-radius: 16px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important; overflow: hidden; }
    .search-card mat-card-header { padding: 20px 20px 0; }
    .search-card mat-card-content { padding: 20px; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 16px; }
    .full-width { grid-column: 1 / -1; }
    mat-form-field { width: 100%; }
    .duration-preview {
      display: flex; align-items: center; gap: 8px; padding: 10px 16px;
      background: #e8f5e9; border-radius: 8px; color: #2e7d32; margin: 8px 0;
    }
    .form-actions { display: flex; gap: 16px; justify-content: center; margin-top: 20px; flex-wrap: wrap; }
    .search-btn {
      padding: 12px 32px !important; font-size: 1rem !important;
      background: linear-gradient(135deg, #667eea, #764ba2) !important;
      display: flex; align-items: center; gap: 8px;
    }

    .loading-overlay { display: flex; justify-content: center; align-items: center; padding: 60px; text-align: center; }
    .loading-content h3 { color: white; margin: 20px 0 8px; font-size: 1.4rem; }
    .loading-content p { color: rgba(255,255,255,0.8); }

    .error-section { max-width: 600px; margin: 20px auto; padding: 0 16px; }
    .error-card { padding: 20px; text-align: center; }

    .results-section { max-width: 1400px; margin: 0 auto; padding: 0 16px 40px; }
    .results-header { color: white; text-align: center; margin-bottom: 32px; }
    .results-header h2 { display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 1.5rem; margin-bottom: 16px; flex-wrap: wrap; }
    .results-meta { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; }
    .plans-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .no-results { color: white; text-align: center; padding: 60px 20px; }
    .no-results mat-icon { font-size: 64px; height: 64px; width: 64px; opacity: 0.7; }
    .no-results h3 { font-size: 1.5rem; margin: 16px 0 8px; }
    .suggestions { background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-top: 24px; text-align: left; display: inline-block; }
    .suggestions ul { padding-left: 20px; margin-top: 8px; }
    .suggestions li { margin: 6px 0; }

    .detail-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000;
      display: flex; align-items: flex-start; justify-content: center;
      padding: 20px; overflow-y: auto;
    }
    .detail-modal {
      background: white; border-radius: 20px; width: 100%; max-width: 820px;
      position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      margin: auto;
    }
    .close-btn { position: absolute !important; top: 12px; right: 12px; z-index: 10; background: rgba(0,0,0,0.5) !important; color: white !important; }
    .detail-hero {
      height: 240px; background-size: cover; background-position: center;
      position: relative; border-radius: 20px 20px 0 0; overflow: hidden;
    }
    .detail-hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1));
      display: flex; align-items: flex-end; padding: 24px;
    }
    .detail-hero-content { color: white; }
    .destination-flag img { height: 32px; border-radius: 4px; margin-bottom: 6px; }
    .detail-hero-content h2 { font-size: 1.6rem; margin: 0 0 8px; }
    .detail-stats { display: flex; gap: 16px; flex-wrap: wrap; }
    .detail-stats span { display: flex; align-items: center; gap: 4px; font-size: 0.9rem; }
    .detail-body { padding: 0 24px 24px; }
    .detail-tabs {
      display: flex; border-bottom: 2px solid #eee; margin-bottom: 20px;
      padding-top: 16px; gap: 4px; overflow-x: auto;
    }
    .detail-tabs button {
      padding: 8px 14px; border: none; background: none; cursor: pointer;
      font-size: 0.88rem; color: #666; border-radius: 8px 8px 0 0;
      transition: all 0.2s; white-space: nowrap;
    }
    .detail-tabs button.active { color: #764ba2; border-bottom: 2px solid #764ba2; font-weight: 600; }
    .tab-content { padding-bottom: 16px; }

    .info-section { display: flex; gap: 16px; padding: 16px; background: #f5f5f5; border-radius: 12px; margin-bottom: 16px; }
    .info-section mat-icon { color: #764ba2; font-size: 28px; height: 28px; width: 28px; flex-shrink: 0; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px; margin-bottom: 16px; }
    .info-item { display: flex; gap: 10px; padding: 12px; background: #fafafa; border-radius: 8px; border: 1px solid #eee; }
    .info-item mat-icon { color: #667eea; flex-shrink: 0; }
    .info-item .label { font-size: 0.72rem; color: #888; display: block; }
    .info-item .value { font-weight: 600; display: block; font-size: 0.9rem; }
    .info-item small { color: #666; font-size: 0.72rem; }
    .currency-box { background: #f3e5f5; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
    .currency-box mat-icon { color: #7b1fa2; }
    .currency-box .rate { font-weight: 700; font-size: 1rem; color: #4a148c; }
    .currency-box .note { font-size: 0.8rem; color: #666; }
    .attractions-section h4 { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
    .attraction-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .attraction-tag { background: #f3e5f5; color: #7b1fa2; padding: 4px 12px; border-radius: 16px; font-size: 0.82rem; }
    .tip-section { display: flex; gap: 16px; padding: 16px; background: #fffde7; border-radius: 12px; margin-top: 16px; border-left: 4px solid #ffd700; }
    .tip-section mat-icon { color: #f57f17; flex-shrink: 0; }

    .day-plan { margin-bottom: 16px; border: 1px solid #eee; border-radius: 12px; overflow: hidden; }
    .day-header { display: flex; align-items: center; gap: 14px; padding: 14px; background: linear-gradient(135deg, #667eea12, #764ba212); }
    .day-number { background: linear-gradient(135deg, #667eea, #764ba2); color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; font-size: 0.85rem; }
    .day-info { flex: 1; min-width: 0; }
    .day-info h4 { margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .day-date { font-size: 0.82rem; color: #666; }
    .day-budget { font-weight: 700; color: #4caf50; font-size: 1rem; white-space: nowrap; }
    .activities { padding: 14px; }
    .activity { display: flex; gap: 10px; margin-bottom: 14px; }
    .act-time { font-size: 0.78rem; color: #888; width: 44px; flex-shrink: 0; padding-top: 2px; }
    .act-line { width: 2px; background: linear-gradient(180deg, #667eea, #764ba2); border-radius: 2px; flex-shrink: 0; }
    .act-content { flex: 1; min-width: 0; }
    .act-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap; }
    .act-header mat-icon { font-size: 17px; height: 17px; width: 17px; color: #764ba2; flex-shrink: 0; }
    .act-header strong { flex: 1; }
    .act-cost { background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 10px; font-size: 0.78rem; white-space: nowrap; }
    .act-content p { font-size: 0.83rem; color: #666; margin: 0; }

    .budget-overview { padding: 8px 0; }
    .total-budget-display { text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea12, #764ba212); border-radius: 12px; margin-bottom: 20px; }
    .total-budget-display h3 { color: #666; margin-bottom: 8px; }
    .total-amount { font-size: 2.2rem; font-weight: 800; color: #764ba2; }
    .savings { display: flex; align-items: center; justify-content: center; gap: 8px; color: #4caf50; margin-top: 8px; }
    .local-equiv { font-size: 0.85rem; color: #888; margin-top: 4px; }
    .budget-items { display: flex; flex-direction: column; gap: 14px; }
    .budget-item-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .budget-item-header mat-icon { color: #667eea; }
    .budget-item-header span { flex: 1; }
    .budget-bar { height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
    .budget-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
    .flights .budget-fill { background: #2196f3; }
    .hotel .budget-fill { background: #9c27b0; }
    .food .budget-fill { background: #ff9800; }
    .activities .budget-fill { background: #4caf50; }
    .misc .budget-fill { background: #607d8b; }

    .gallery-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .gallery-main { grid-column: 1 / -1; width: 100%; height: 240px; object-fit: cover; border-radius: 8px; }
    .gallery-thumb { width: 100%; height: 150px; object-fit: cover; border-radius: 8px; cursor: pointer; transition: transform 0.2s; }
    .gallery-thumb:hover { transform: scale(1.02); }

    .app-footer { background: rgba(0,0,0,0.3); color: rgba(255,255,255,0.8); padding: 20px; text-align: center; }
    .footer-content { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
    .footer-note { opacity: 0.6; font-size: 0.82rem; }

    .pagination {
      display: flex; align-items: center; justify-content: center;
      gap: 8px; margin-top: 32px; flex-wrap: wrap;
    }
    .pagination button { min-width: 36px; height: 36px; border-radius: 8px !important; }
    .pagination button.active-page { background: linear-gradient(135deg, #667eea, #764ba2) !important; color: white !important; }
    .page-info { color: rgba(255,255,255,0.85); font-size: 0.88rem; white-space: nowrap; }
    .page-size-select {
      background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.3);
      border-radius: 8px; padding: 6px 10px; font-size: 0.85rem; cursor: pointer; outline: none;
    }
    .page-size-select option { background: #1a1a2e; color: white; }

    @media (max-width: 600px) {
      .plans-grid { grid-template-columns: 1fr; }
      .gallery-grid { grid-template-columns: 1fr; }
      .gallery-main { height: 180px; }
      .detail-hero { height: 200px; }
      .hero-section { padding: 40px 16px 50px; }
      .detail-body { padding: 0 16px 16px; }
    }
  `]
})
export class TripPlannerComponent implements OnInit, OnDestroy {
  tripForm: FormGroup;
  loading = false;
  error: string | null = null;
  results: TripResponse | null = null;
  selectedPlan: ItineraryPlan | null = null;
  detailTab = 'overview';
  minDate = new Date();
  citySuggestions: CityResult[] = [];
  private destroy$ = new Subject<void>();

  readonly pageSizeOptions = [6, 9, 12];
  pageSize = 9;
  currentPage = 1;

  get totalPages(): number { return this.results?.totalPages ?? 0; }
  get totalCount(): number { return this.results?.totalCount ?? 0; }
  get paginatedPlans(): ItineraryPlan[] { return this.results?.plans ?? []; }
  get pageNumbers(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  changePage(page: number) {
    this.currentPage = page;
    this.fetchPage();
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.fetchPage();
  }

  private fetchPage() {
    if (this.tripForm.invalid) return;
    this.loading = true;
    this.cdr.markForCheck();

    const val = this.tripForm.value;
    const request: TripRequest = {
      budget: val.budget,
      startDate: val.startDate instanceof Date ? val.startDate.toISOString() : val.startDate,
      endDate: val.endDate instanceof Date ? val.endDate.toISOString() : val.endDate,
      startPlace: val.startPlace,
      tripType: val.tripType,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.itineraryService.planTrip(request).subscribe({
      next: (response) => {
        this.loading = false;
        this.results = response;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to connect to the server. Make sure the backend is running on port 5000.';
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  constructor(
    private fb: FormBuilder,
    private itineraryService: ItineraryService,
    private geocodingService: GeocodingService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 14);

    this.tripForm = this.fb.group({
      startPlace: ['Mumbai', Validators.required],
      budget: [150000, [Validators.required, Validators.min(10000)]],
      tripType: ['international'],
      startDate: [tomorrow, Validators.required],
      endDate: [nextWeek, Validators.required]
    });
  }

  ngOnInit() {
    this.tripForm.get('startPlace')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(val => this.geocodingService.searchCities(val ?? '')),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.citySuggestions = results;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCitySelected(city: CityResult) {
    this.tripForm.get('startPlace')!.setValue(city.displayName, { emitEvent: false });
  }

  get tripDuration(): number {
    const start = this.tripForm.get('startDate')?.value;
    const end = this.tripForm.get('endDate')?.value;
    if (start && end) {
      const diff = new Date(end).getTime() - new Date(start).getTime();
      return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    }
    return 0;
  }

  onSearch() {
    if (this.tripForm.invalid) return;
    this.error = null;
    this.results = null;
    this.currentPage = 1;
    this.fetchPage();
  }

  resetForm() {
    this.results = null;
    this.selectedPlan = null;
    this.error = null;
    this.cdr.markForCheck();
  }

  onViewDetails(plan: ItineraryPlan) {
    this.selectedPlan = plan;
    this.detailTab = 'overview';
    document.body.style.overflow = 'hidden';
    this.cdr.markForCheck();
  }

  closePlanDetail() {
    this.selectedPlan = null;
    document.body.style.overflow = '';
    this.cdr.markForCheck();
  }

  getBudgetPercent(amount: number): number {
    if (!this.selectedPlan) return 0;
    return Math.min(100, Math.round((amount / this.selectedPlan.totalCost) * 100));
  }

  getLocalAmount(usdAmount: number): string {
    if (!this.selectedPlan || this.selectedPlan.exchangeRateFromUSD <= 1) return '';
    const local = Math.round(usdAmount * this.selectedPlan.exchangeRateFromUSD);
    return `≈ ${this.selectedPlan.currencySymbol}${local.toLocaleString()}`;
  }

  onFlagError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop';
  }
}
