import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { Bank } from '@src/app/core/models/bank.model';
import {
  CreateContactRequest,
  CreatePartnerRequest,
  LegalEntity,
  PartnerType,
} from '@src/app/core/models/partner.model';
import { City, District, Province, Village } from '@src/app/core/models/region.model';
import { PartnerService } from '@src/app/core/services/partner.service';
import { UiPageTitle } from '@src/app/ui/page-title.component';
import { finalize } from 'rxjs';
import { PartnerFormAddressComponent } from '../forms/partner-form-address.component';
import { PartnerFormBanksComponent } from '../forms/partner-form-banks.component';
import { PartnerFormBasicComponent } from '../forms/partner-form-basic.component';
import { PartnerFormContactsComponent } from '../forms/partner-form-contacts.component';

@Component({
  selector: 'partner-create-page',
  imports: [
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCardModule,
    RouterLink,
    UiPageTitle,
    PartnerFormBasicComponent,
    PartnerFormAddressComponent,
    PartnerFormContactsComponent,
    PartnerFormBanksComponent,
  ],
  template: `
    <ui-page-title title="Create Partner" backLink="/dashboard/partner" />

    <div class="p-6 max-w-200 mx-auto">
      <form [formGroup]="form" class="flex flex-col gap-6" (ngSubmit)="onSubmit()">
        <!-- BASIC -->
        <partner-form-basic [form]="form" />

        <!-- ADDRESS -->
        <partner-form-address [form]="form" />

        <!-- CONTACTS -->
        <partner-form-contacts [parentForm]="form" [contacts]="contacts" />

        <!-- BANK ACCOUNTS -->
        <partner-form-banks [parentForm]="form" [bankAccounts]="partner_bank_accounts" />

        <!-- ACTIONS -->
        <mat-card>
          <mat-card-content>
            <div class="flex justify-end gap-3 mt-6">
              <button
                mat-stroked-button
                type="button"
                routerLink="/dashboard/partner"
                [disabled]="isLoading()"
                data-testid="partner-cancel-button"
              >
                Cancel
              </button>
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="form.invalid || isLoading()"
                data-testid="partner-submit-button"
              >
                @if (isLoading()) {
                  <mat-spinner diameter="20" class="mx-auto"></mat-spinner>
                } @else {
                  Create Partner
                }
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartnerCreatePage {
  private partnerService = inject(PartnerService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isLoading = signal(false);

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    types: new FormControl<PartnerType[]>([], {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)],
    }),
    legal_entity: new FormControl<LegalEntity | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    company_email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    company_phone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),

    // Region & Address
    provinsi: new FormControl<Province | string | null>(null),
    kota: new FormControl<City | string | null>(null),
    kecamatan: new FormControl<District | string | null>(null),
    kelurahan: new FormControl<Village | string | null>(null),
    address: new FormControl('', { nonNullable: true }),
    postal_code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(/^\d{5}$/)],
    }),

    contacts: new FormArray<
      FormGroup<{
        name: FormControl<string>;
        email: FormControl<string>;
        phone_number: FormControl<string>;
      }>
    >([]),

    partner_bank_accounts: new FormArray<
      FormGroup<{
        bank: FormControl<Bank | string | null>;
        account_number: FormControl<string>;
        account_name: FormControl<string>;
      }>
    >([]),
  });

  get contacts() {
    return this.form.controls.contacts;
  }

  get partner_bank_accounts() {
    return this.form.controls.partner_bank_accounts;
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    const raw = this.form.getRawValue();

    if (raw.legal_entity === '') {
      this.isLoading.set(false);
      return;
    }

    const payload: CreatePartnerRequest = {
      name: raw.name,
      types: raw.types,
      legal_entity: raw.legal_entity as LegalEntity,
      company_email: raw.company_email,
      company_phone: raw.company_phone,
      address: raw.address,
      postal_code: raw.postal_code,
      contacts: raw.contacts as CreateContactRequest[],
      partner_bank_accounts: (raw.partner_bank_accounts ?? []).map((b) => ({
        bank_id: typeof b.bank === 'object' && b.bank !== null ? (b.bank as Bank).id : '',
        account_number: b.account_number,
        account_name: b.account_name,
      })),
    };

    // Map Regions
    if (raw.provinsi && typeof raw.provinsi === 'object') {
      const p = raw.provinsi as Province;
      payload.provinsi_id = p.id;
      payload.provinsi_label = p.name;
    }
    if (raw.kota && typeof raw.kota === 'object') {
      const c = raw.kota as City;
      payload.kota_id = c.id;
      payload.kota_label = c.name;
    }
    if (raw.kecamatan && typeof raw.kecamatan === 'object') {
      const d = raw.kecamatan as District;
      payload.kecamatan_id = d.id;
      payload.kecamatan_label = d.name;
    }
    if (raw.kelurahan && typeof raw.kelurahan === 'object') {
      const v = raw.kelurahan as Village;
      payload.kelurahan_id = v.id;
      payload.kelurahan_label = v.name;
    }

    this.partnerService
      .create(payload)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (res) => {
          this.snackBar.open('Partner created successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
          this.router.navigate(['/dashboard/partner', res.data.id]);
        },
        error: (err) => {
          console.error('Error creating partner:', err);
          const message = err.error?.message || 'Failed to create partner. Please try again.';
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
