import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { PartnerService } from '@src/app/core/services/partner.service';
import { UiConfirmDialog } from '@src/app/ui/confirm-dialog.component';
import { UiPageTitle } from '@src/app/ui/page-title.component';

@Component({
  selector: 'partner-detail-page',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    DatePipe,
    RouterLink,
    UiPageTitle,
  ],
  template: `
    <div class="flex items-center justify-between pr-6">
      <ui-page-title title="Partner Details" backLink="/dashboard/partner" />
      <div class="flex gap-2">
        <a
          mat-stroked-button
          [routerLink]="['/dashboard/partner', id(), 'edit']"
          data-testid="partner-edit-button"
        >
          <mat-icon>edit</mat-icon>
          Edit Partner
        </a>
        <button
          mat-flat-button
          color="warn"
          (click)="deletePartner()"
          data-testid="partner-delete-button"
        >
          <mat-icon>delete</mat-icon>
          Delete Partner
        </button>
      </div>
    </div>

    <div class="p-6 flex flex-col gap-6">
      @if (partnerResource.isLoading()) {
        <div class="flex justify-center p-12">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else if (partnerResource.error()) {
        <mat-card class="text-red-600">
          <mat-card-content>
            <p>Error loading partner details. Please try again.</p>
          </mat-card-content>
        </mat-card>
      } @else if (partnerResource.value(); as response) {
        @let partner = response.data;
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <mat-card>
              <mat-card-header>
                <mat-card-title data-testid="detail-partner-name">{{
                  partner.name
                }}</mat-card-title>
                <mat-card-subtitle data-testid="detail-partner-legal-entity">
                  {{ partner.legal_entity }}
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="py-4">
                  <h3 class="mt-0 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                    General Information
                  </h3>
                  <div class="mt-2 space-y-1">
                    <p>
                      <strong>Email:</strong>
                      <span data-testid="detail-partner-email">{{ partner.company_email }}</span>
                    </p>
                    <p>
                      <strong>Phone:</strong>
                      <span data-testid="detail-partner-phone">{{ partner.company_phone }}</span>
                    </p>
                    <p>
                      <strong>Types:</strong>
                      <span data-testid="detail-partner-types">{{ partner.types.join(', ') }}</span>
                    </p>
                    <p>
                      <strong>Created At:</strong>
                      <span data-testid="detail-partner-created-at">
                        {{ partner.created_at | date: 'dd/MM/yyyy HH:mm' }}
                      </span>
                    </p>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <div class="py-4">
                  <h3 class="mt-0 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                    Address
                  </h3>
                  <div class="mt-2">
                    <p data-testid="detail-partner-address">{{ partner.address }}</p>
                    <p data-testid="detail-partner-full-region">
                      {{ partner.kelurahan_label }}, {{ partner.kecamatan_label }},
                      {{ partner.kota_label }}, {{ partner.provinsi_label }}
                      <span data-testid="detail-partner-postal-code">{{
                        partner.postal_code
                      }}</span>
                    </p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <div class="flex flex-col gap-6 lg:col-span-1">
            @if (partner.contacts && partner.contacts.length > 0) {
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Contacts</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  @for (contact of partner.contacts; track contact.id) {
                    <div class="py-3">
                      <p>
                        <strong>{{ contact.name }}</strong>
                      </p>
                      <p class="text-sm text-gray-600">{{ contact.email }}</p>
                      <p class="text-sm text-gray-600">{{ contact.phone_number }}</p>
                    </div>
                    @if (!$last) {
                      <mat-divider></mat-divider>
                    }
                  }
                </mat-card-content>
              </mat-card>
            }

            @if (partner.partner_bank_accounts && partner.partner_bank_accounts.length > 0) {
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Bank Accounts</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  @for (account of partner.partner_bank_accounts; track account.id) {
                    <div class="py-3">
                      <p>
                        <strong>{{ account.bank.name }}</strong>
                      </p>
                      <p class="text-sm text-gray-600">Account Name: {{ account.account_name }}</p>
                      <p class="text-sm text-gray-600">
                        Account Number: {{ account.account_number }}
                      </p>
                    </div>
                    @if (!$last) {
                      <mat-divider></mat-divider>
                    }
                  }
                </mat-card-content>
              </mat-card>
            }
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartnerDetailPage {
  private partnerService = inject(PartnerService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Route param 'id' bound as signal input
  id = input.required<string>();

  partnerResource = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.partnerService.getById(params.id),
  });

  deletePartner() {
    const dialogRef = this.dialog.open(UiConfirmDialog, {
      data: {
        title: 'Delete Partner',
        message: 'Are you sure you want to delete this partner? This action cannot be undone.',
        confirmText: 'Delete',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.executeDelete();
      }
    });
  }

  private executeDelete() {
    this.partnerService.delete(this.id()).subscribe({
      next: () => {
        this.snackBar.open('Partner deleted successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
        this.router.navigate(['/dashboard/partner']);
      },
      error: (err) => {
        console.error('Error deleting partner:', err);
        const message = err.error?.message || 'Failed to delete partner. Please try again.';
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }
}
