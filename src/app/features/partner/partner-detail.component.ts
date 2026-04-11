import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { PartnerService } from '../../core/services/partner.service';

@Component({
  selector: 'app-partner-detail',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    DatePipe,
    RouterLink,
  ],
  template: `
    <div class="container">
      <div class="header">
        <button mat-icon-button routerLink="/dashboard/partner">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Partner Details</h1>
      </div>

      @if (partnerResource.isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else if (partnerResource.error()) {
        <mat-card class="error-card">
          <mat-card-content>
            <p>Error loading partner details. Please try again.</p>
          </mat-card-content>
        </mat-card>
      } @else if (partnerResource.value(); as response) {
        @let partner = response.data;
        <div class="details-grid">
          <div class="details-grid__span-2">
            <mat-card>
              <mat-card-header>
                <mat-card-title>{{ partner.name }}</mat-card-title>
                <mat-card-subtitle>{{ partner.legal_entity }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="info-group">
                  <h3>General Information</h3>
                  <p><strong>Email:</strong> {{ partner.company_email }}</p>
                  <p><strong>Phone:</strong> {{ partner.company_phone }}</p>
                  <p><strong>Types:</strong> {{ partner.types.join(', ') }}</p>
                  <p>
                    <strong>Created At:</strong> {{ partner.created_at | date: 'dd/MM/yyyy HH:mm' }}
                  </p>
                </div>

                <mat-divider></mat-divider>

                <div class="info-group">
                  <h3>Address</h3>
                  <p>{{ partner.address }}</p>
                  <p>
                    {{ partner.kelurahan_label }}, {{ partner.kecamatan_label }},
                    {{ partner.kota_label }}, {{ partner.provinsi_label }} {{ partner.postal_code }}
                  </p>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          @if (partner.contacts && partner.contacts.length > 0) {
            <div class="details-grid__span-1">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Contacts</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  @for (contact of partner.contacts; track contact.id) {
                    <div class="contact-item">
                      <p>
                        <strong>{{ contact.name }}</strong>
                      </p>
                      <p>{{ contact.email }}</p>
                      <p>{{ contact.phone_number }}</p>
                    </div>
                    @if (!$last) {
                      <mat-divider></mat-divider>
                    }
                  }
                </mat-card-content>
              </mat-card>
            </div>
          }

          @if (partner.partner_bank_accounts && partner.partner_bank_accounts.length > 0) {
            <div class="details-grid__span-1">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Bank Accounts</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  @for (account of partner.partner_bank_accounts; track account.id) {
                    <div class="bank-item">
                      <p>
                        <strong>{{ account.bank.name }}</strong>
                      </p>
                      <p>Account Name: {{ account.account_name }}</p>
                      <p>Account Number: {{ account.account_number }}</p>
                    </div>
                    @if (!$last) {
                      <mat-divider></mat-divider>
                    }
                  }
                </mat-card-content>
              </mat-card>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .container {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .header h1 {
      margin: 0;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;

      &__span-2 {
        grid-column: span 2;
      }

      &__span-1 {
        grid-column: span 1;
      }
    }
    .info-group {
      padding: 16px 0;
    }
    .info-group h3 {
      margin-top: 0;
      color: #666;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .contact-item,
    .bank-item {
      padding: 12px 0;
    }
    .contact-item p,
    .bank-item p {
      margin: 4px 0;
    }
    .error-card {
      color: #f44336;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartnerDetailComponent {
  private partnerService = inject(PartnerService);

  // Route param 'id' bound as signal input
  id = input.required<string>();

  partnerResource = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.partnerService.getById(params.id),
  });
}
