import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LegalEntity, PartnerType } from '@src/app/core/models/partner.model';

@Component({
  selector: 'partner-form-basic',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  template: `
    <mat-card>
      <mat-card-content [formGroup]="form()">
        <div class="text-lg font-medium my-4">Basic</div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Name -->
          <mat-form-field appearance="outline">
            <mat-label>Company Name</mat-label>
            <input
              matInput
              formControlName="name"
              placeholder="e.g. PT Neko Jaya"
              data-testid="partner-name-input"
            />
            @if (form().get('name')?.hasError('required')) {
              <mat-error data-testid="partner-name-error">Name is required</mat-error>
            }
          </mat-form-field>

          <!-- Legal Entity -->
          <mat-form-field appearance="outline">
            <mat-label>Legal Entity</mat-label>
            <mat-select formControlName="legal_entity" data-testid="partner-legal-entity-select">
              @for (entity of legalEntities; track entity) {
                <mat-option [value]="entity" [attr.data-testid]="'legal-entity-option-' + entity">
                  {{ entity }}
                </mat-option>
              }
            </mat-select>
            @if (form().get('legal_entity')?.hasError('required')) {
              <mat-error data-testid="partner-legal-entity-error">
                Legal Entity is required
              </mat-error>
            }
          </mat-form-field>

          <!-- Email -->
          <mat-form-field appearance="outline">
            <mat-label>Company Email</mat-label>
            <input
              matInput
              type="email"
              formControlName="company_email"
              placeholder="email@company.com"
              data-testid="partner-email-input"
            />
            @if (form().get('company_email')?.hasError('required')) {
              <mat-error data-testid="partner-email-required-error">Email is required</mat-error>
            }
            @if (form().get('company_email')?.hasError('email')) {
              <mat-error data-testid="partner-email-format-error">Invalid email format</mat-error>
            }
          </mat-form-field>

          <!-- Phone -->
          <mat-form-field appearance="outline">
            <mat-label>Company Phone</mat-label>
            <input
              matInput
              formControlName="company_phone"
              placeholder="e.g. +628..."
              data-testid="partner-phone-input"
            />
            @if (form().get('company_phone')?.hasError('required')) {
              <mat-error data-testid="partner-phone-error">Phone is required</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="mb-6 flex flex-col gap-2">
          <span class="font-medium text-black/60">Partner Types</span>
          <div class="flex gap-6">
            @for (type of partnerTypes; track type) {
              <mat-checkbox
                [checked]="isTypeSelected(type)"
                (change)="toggleType(type)"
                color="primary"
                [attr.data-testid]="'partner-type-checkbox-' + type"
              >
                {{ type }}
              </mat-checkbox>
            }
          </div>
          @if (form().get('types')?.hasError('required')) {
            <mat-error class="text-[75%] -mt-2" data-testid="partner-types-error">
              At least one type must be selected
            </mat-error>
          }
        </div>
      </mat-card-content>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartnerFormBasicComponent {
  form = input.required<FormGroup>();

  legalEntities: LegalEntity[] = ['CV', 'PT', 'KOPERASI', 'INDIVIDUAL'];
  partnerTypes: PartnerType[] = ['BUYER', 'SUPPLIER'];

  isTypeSelected(type: PartnerType): boolean {
    return this.form().controls['types'].value.includes(type);
  }

  toggleType(type: PartnerType) {
    const currentTypes = [...this.form().controls['types'].value];
    const index = currentTypes.indexOf(type);

    if (index > -1) {
      currentTypes.splice(index, 1);
    } else {
      currentTypes.push(type);
    }

    this.form().controls['types'].setValue(currentTypes);
    this.form().controls['types'].markAsTouched();
  }
}
