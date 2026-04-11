import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiResponse } from '../../core/models/api.model';
import { Partner, PartnerParams } from '../../core/models/partner.model';
import { PartnerService } from '../../core/services/partner.service';

@Component({
  selector: 'app-partner',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    RouterLink,
  ],
  template: `
    <div class="container">
      <h1>Partners</h1>

      <div class="header-actions">
        <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
          <mat-label>Search partners</mat-label>
          <input
            matInput
            [value]="search()"
            (input)="onSearchChange($any($event.target).value)"
            placeholder="Search by name..."
          />
        </mat-form-field>

        <button mat-flat-button color="primary" (click)="onCreatePartner()">
          <mat-icon>add</mat-icon>
          Create Partner
        </button>
      </div>

      <div class="table-container mat-elevation-z8">
        @if (partnersResource.isLoading()) {
          <div class="loading-shade">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        }

        <table mat-table [dataSource]="dataSource()" matSort (matSortChange)="onSortChange($event)">
          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let element">
              <a [routerLink]="['/dashboard/partner', element.id]" class="partner-link">
                {{ element.name }}
              </a>
            </td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="company_email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let element">{{ element.company_email }}</td>
          </ng-container>

          <!-- Phone Column -->
          <ng-container matColumnDef="company_phone">
            <th mat-header-cell *matHeaderCellDef>Phone</th>
            <td mat-cell *matCellDef="let element">{{ element.company_phone }}</td>
          </ng-container>

          <!-- Legal Entity Column -->
          <ng-container matColumnDef="legal_entity">
            <th mat-header-cell *matHeaderCellDef>Legal Entity</th>
            <td mat-cell *matCellDef="let element">{{ element.legal_entity }}</td>
          </ng-container>

          <!-- Created At Column -->
          <ng-container matColumnDef="created_at">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Created At</th>
            <td mat-cell *matCellDef="let element">
              {{ element.created_at | date: 'dd/MM/yyyy' }}
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="5">
              @if (!partnersResource.isLoading()) {
                No data matching the search query
              }
            </td>
          </tr>
        </table>

        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize()"
          [pageIndex]="pageIndex()"
          [pageSizeOptions]="[5, 10, 25, 100]"
          (page)="onPageChange($event)"
          aria-label="Select page of partners"
        >
        </mat-paginator>
      </div>
    </div>
  `,
  styles: `
    .container {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .search-field {
      max-width: 400px;
      flex: 1;
    }
    .partner-link {
      color: #3f51b5;
      text-decoration: none;
      font-weight: 500;
    }
    .partner-link:hover {
      text-decoration: underline;
    }
    .table-container {
      position: relative;
      min-height: 200px;
      overflow: auto;
    }
    table {
      width: 100%;
    }
    .loading-shade {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 56px;
      right: 0;
      background: rgba(255, 255, 255, 0.7);
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mat-column-created_at {
      width: 120px;
    }
    .mat-column-legal_entity {
      width: 100px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartnerComponent {
  private partnerService = inject(PartnerService);
  private router = inject(Router);

  // Search signal
  search = signal('');

  // Debounced search
  debouncedSearch = toSignal(
    toObservable(this.search).pipe(debounceTime(400), distinctUntilChanged()),
    { initialValue: '' },
  );

  // Pagination and Sort signals
  pageIndex = signal(0);
  pageSize = signal(10);
  sortBy = signal<string | undefined>(undefined);
  sortOrder = signal<'asc' | 'desc' | undefined>(undefined);

  // Combined params for the resource
  params = computed<PartnerParams>(() => ({
    page: this.pageIndex() + 1,
    limit: this.pageSize(),
    search: this.debouncedSearch(),
    sortBy: this.sortBy(),
    sortOrder: this.sortOrder() || undefined,
  }));

  // Resource to fetch data
  partnersResource = rxResource<ApiResponse<Partner[]>, PartnerParams>({
    params: () => this.params(),
    stream: ({ params }) => this.partnerService.getList(params),
  });

  // Derived data
  dataSource = computed(() => this.partnersResource.value()?.data ?? []);
  totalElements = computed(() => this.partnersResource.value()?.meta?.total ?? 0);

  displayedColumns: string[] = [
    'name',
    'company_email',
    'company_phone',
    'legal_entity',
    'created_at',
  ];

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSortChange(sort: Sort) {
    this.sortBy.set(sort.active);
    this.sortOrder.set(sort.direction || undefined);
    this.pageIndex.set(0);
  }

  onSearchChange(value: string) {
    this.search.set(value);
    this.pageIndex.set(0);
  }

  onCreatePartner() {
    this.router.navigate(['/dashboard/partner/create']);
  }
}
