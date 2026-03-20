import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ItineraryPlan } from '../../models/trip.models';

@Component({
  selector: 'app-plan-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatTooltipModule],
  templateUrl: './plan-card.component.html',
  styles: [`
    .plan-card {
      border-radius: 16px !important;
      overflow: hidden;
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    /* Rank badge */
    .rank-badge {
      position: absolute; top: 12px; left: 12px; z-index: 5;
      background: rgba(0,0,0,0.6); color: white;
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.85rem; backdrop-filter: blur(4px);
    }
    .rank-badge.top { background: linear-gradient(135deg, #ffd700, #ff8c00); }
    .rank-badge mat-icon { font-size: 20px; height: 20px; width: 20px; }

    /* Image */
    .card-image {
      height: 200px; background-size: cover; background-position: center;
      position: relative; flex-shrink: 0;
    }
    .image-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5));
    }
    .country-flag { position: absolute; top: 12px; right: 12px; border-radius: 3px; }

    .visa-badge {
      position: absolute; bottom: 12px; left: 12px;
      padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;
      display: flex; align-items: center; gap: 4px; backdrop-filter: blur(4px);
    }
    .visa-badge mat-icon { font-size: 14px; height: 14px; width: 14px; }
    .visa-badge.voa { background: rgba(76, 175, 80, 0.9); color: white; }
    .visa-badge.evisa { background: rgba(33, 150, 243, 0.9); color: white; }
    .visa-badge.free { background: rgba(255, 152, 0, 0.9); color: white; }
    .visa-badge.domestic { background: rgba(156, 39, 176, 0.9); color: white; }

    .domestic-badge {
      position: absolute; bottom: 12px; right: 12px;
      background: rgba(156, 39, 176, 0.9); color: white;
      padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;
      display: flex; align-items: center; gap: 4px;
    }
    .domestic-badge mat-icon { font-size: 14px; height: 14px; width: 14px; }

    /* Body */
    .card-body { flex: 1; padding: 16px !important; }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .destination-name { font-size: 1.1rem; font-weight: 700; color: #1a1a2e; line-height: 1.3; flex: 1; }
    .rating { display: flex; align-items: center; gap: 4px; color: #f57c00; font-weight: 600; }
    .rating mat-icon { font-size: 16px; height: 16px; width: 16px; }
    .card-description { font-size: 0.82rem; color: #666; line-height: 1.5; margin-bottom: 12px; }

    .info-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
    .pill { display: flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; }
    .pill mat-icon { font-size: 13px; height: 13px; width: 13px; }
    .duration { background: #e3f2fd; color: #1565c0; }
    .weather { background: #fff3e0; color: #e65100; max-width: 160px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

    .highlights { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .highlight-tag { background: #f3e5f5; color: #6a1b9a; padding: 2px 10px; border-radius: 10px; font-size: 0.75rem; }
    .highlight-more { background: #eeeeee; color: #666; padding: 2px 10px; border-radius: 10px; font-size: 0.75rem; }

    /* Budget mini */
    .budget-mini { background: #fafafa; border-radius: 10px; padding: 12px; border: 1px solid #eee; }
    .budget-total { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .total-label { font-size: 0.8rem; color: #888; }
    .total-value { font-size: 1.3rem; font-weight: 800; color: #764ba2; }
    .budget-items-mini { display: flex; gap: 12px; }
    .budget-items-mini span { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: #555; }
    .budget-items-mini mat-icon { font-size: 14px; height: 14px; width: 14px; color: #888; }
    .savings-badge { display: flex; align-items: center; gap: 4px; color: #4caf50; font-size: 0.8rem; font-weight: 600; margin-top: 6px; }
    .savings-badge mat-icon { font-size: 14px; height: 14px; width: 14px; }

    /* Actions */
    .card-actions { padding: 12px 16px 16px !important; display: flex; align-items: center; justify-content: space-between; }
    .view-btn { flex-shrink: 0; background: linear-gradient(135deg, #667eea, #764ba2) !important; }
    .quick-info { display: flex; align-items: center; gap: 4px; color: #888; overflow: hidden; }
    .quick-info mat-icon { font-size: 16px; height: 16px; width: 16px; }
    .quick-info small { font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; }
  `]
})
export class PlanCardComponent {
  @Input() plan!: ItineraryPlan;
  @Input() rank = 1;
  @Output() viewDetails = new EventEmitter<ItineraryPlan>();

  onView() {
    this.viewDetails.emit(this.plan);
  }

  getVisaClass(): string {
    const v = this.plan.visaType.toLowerCase();
    if (v.includes('arrival')) return 'voa';
    if (v.includes('e-visa') || v.includes('evisa') || v.includes('online')) return 'evisa';
    if (v.includes('free') || v.includes('no visa')) return 'free';
    if (v.includes('domestic')) return 'domestic';
    return 'free';
  }

  onFlagError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
