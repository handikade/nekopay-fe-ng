import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { LegalEntity, PartnerType, UpdatePartnerRequest } from '@src/app/core/models/partner.model';
import { City, District, Province, Village } from '@src/app/core/models/region.model';
import { PartnerService } from '@src/app/core/services/partner.service';
import { UiPageTitle } from '@src/app/ui/page-title.component';
import { finalize } from 'rxjs';
import { PartnerFormAddressComponent } from '../forms/partner-form-address.component';
import { PartnerFormBasicComponent } from '../forms/partner-form-basic.component';

@Component({
  selector: 'partner-edit-page',
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
  ],
  template: `
    <ui-page-title title="Edit Partner" [backLink]="'/dashboard/partner/' + id()" />

    <div class="p-6 max-w-200 mx-auto">
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
      } @else {
        <form [formGroup]="form" class="flex flex-col gap-6" (ngSubmit)="onSubmit()">
          <!-- BASIC -->
          <partner-form-basic [form]="form" />

          <!-- ADDRESS -->
          <partner-form-address [form]="form" />

          <!-- ACTIONS -->
          <mat-card>
            <mat-card-content>
              <div class="flex justify-end gap-3 mt-6">
                <button
                  mat-stroked-button
                  type="button"
                  [routerLink]="'/dashboard/partner/' + id()"
                  [disabled]="isSaving()"
                  data-testid="partner-cancel-button"
                >
                  Cancel
                </button>
                <button
                  mat-flat-button
                  color="primary"
                  type="submit"
                  [disabled]="form.invalid || isSaving()"
                  data-testid="partner-submit-button"
                >
                  @if (isSaving()) {
                    <mat-spinner diameter="20" class="mx-auto"></mat-spinner>
                  } @else {
                    Update Partner
                  }
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </form>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartnerEditPage {
  private partnerService = inject(PartnerService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  id = input.required<string>();
  isSaving = signal(false);

  partnerResource = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.partnerService.getById(params.id),
  });

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
  });

  constructor() {
    effect(() => {
      const response = this.partnerResource.value();
      if (response) {
        const p = response.data;
        this.form.patchValue({
          name: p.name,
          types: p.types,
          legal_entity: p.legal_entity,
          company_email: p.company_email,
          company_phone: p.company_phone,
          address: p.address,
          postal_code: p.postal_code,
          provinsi: p.provinsi_id ? { id: p.provinsi_id, name: p.provinsi_label || '' } : null,
          kota:
            p.kota_id && p.provinsi_id
              ? { id: p.kota_id, provinceId: p.provinsi_id, name: p.kota_label || '' }
              : null,
          kecamatan:
            p.kecamatan_id && p.kota_id
              ? { id: p.kecamatan_id, cityId: p.kota_id, name: p.kecamatan_label || '' }
              : null,
          kelurahan:
            p.kelurahan_id && p.kecamatan_id
              ? { id: p.kelurahan_id, districtId: p.kecamatan_id, name: p.kelurahan_label || '' }
              : null,
        });
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    const raw = this.form.getRawValue();

    const payload: UpdatePartnerRequest = {
      name: raw.name,
      types: raw.types,
      legal_entity: raw.legal_entity as LegalEntity,
      company_email: raw.company_email,
      company_phone: raw.company_phone,
      address: raw.address,
      postal_code: raw.postal_code,
    };

    // Map Regions
    if (raw.provinsi && typeof raw.provinsi === 'object') {
      const p = raw.provinsi as Province;
      payload.provinsi_id = p.id;
      payload.provinsi_label = p.name;
    } else {
      payload.provinsi_id = '';
      payload.provinsi_label = '';
    }

    if (raw.kota && typeof raw.kota === 'object') {
      const c = raw.kota as City;
      payload.kota_id = c.id;
      payload.kota_label = c.name;
    } else {
      payload.kota_id = '';
      payload.kota_label = '';
    }

    if (raw.kecamatan && typeof raw.kecamatan === 'object') {
      const d = raw.kecamatan as District;
      payload.kecamatan_id = d.id;
      payload.kecamatan_label = d.name;
    } else {
      payload.kecamatan_id = '';
      payload.kecamatan_label = '';
    }

    if (raw.kelurahan && typeof raw.kelurahan === 'object') {
      const v = raw.kelurahan as Village;
      payload.kelurahan_id = v.id;
      payload.kelurahan_label = v.name;
    } else {
      payload.kelurahan_id = '';
      payload.kelurahan_label = '';
    }

    this.partnerService
      .update(this.id(), payload)
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Partner updated successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
          this.router.navigate(['/dashboard/partner', this.id()]);
        },
        error: (err) => {
          console.error('Error updating partner:', err);
          const message = err.error?.message || 'Failed to update partner. Please try again.';
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
