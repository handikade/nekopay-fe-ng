import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'partner-form-contacts',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-card>
      <mat-card-content>
        <div class="flex justify-between items-center my-4">
          <div class="text-lg font-medium">Contacts</div>
          <button
            mat-stroked-button
            type="button"
            (click)="addContact()"
            data-testid="add-contact-button"
          >
            <mat-icon>add</mat-icon>
            Add Contact
          </button>
        </div>

        <div [formGroup]="parentForm()">
          <div formArrayName="contacts" class="flex flex-col gap-4">
            @for (contactGroup of contacts().controls; track contactGroup; let i = $index) {
              <div [formGroupName]="i" class="p-4 border rounded-lg relative bg-slate-50/50">
                <div class="flex justify-between items-center mb-4">
                  <span class="font-medium text-black/60">Contact #{{ i + 1 }}</span>
                  <button
                    mat-icon-button
                    color="warn"
                    type="button"
                    (click)="removeContact(i)"
                    [attr.data-testid]="'remove-contact-button-' + i"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- Contact Name -->
                  <mat-form-field appearance="outline">
                    <mat-label>Contact Name</mat-label>
                    <input
                      matInput
                      formControlName="name"
                      placeholder="e.g. Jane Doe"
                      [attr.data-testid]="'contact-name-input-' + i"
                    />
                    @if (contactGroup.get('name')?.hasError('required')) {
                      <mat-error>Name is required</mat-error>
                    }
                  </mat-form-field>

                  <!-- Contact Email -->
                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input
                      matInput
                      type="email"
                      formControlName="email"
                      placeholder="jane.doe@example.com"
                      [attr.data-testid]="'contact-email-input-' + i"
                    />
                    @if (contactGroup.get('email')?.hasError('required')) {
                      <mat-error>Email is required</mat-error>
                    }
                    @if (contactGroup.get('email')?.hasError('email')) {
                      <mat-error>Invalid email format</mat-error>
                    }
                  </mat-form-field>

                  <!-- Contact Phone -->
                  <mat-form-field appearance="outline">
                    <mat-label>Phone Number</mat-label>
                    <input
                      matInput
                      formControlName="phone_number"
                      placeholder="e.g. +628..."
                      [attr.data-testid]="'contact-phone-input-' + i"
                    />
                    @if (contactGroup.get('phone_number')?.hasError('required')) {
                      <mat-error>Phone is required</mat-error>
                    }
                  </mat-form-field>
                </div>
              </div>
            } @empty {
              <div
                class="text-center py-8 text-black/40 italic bg-slate-50/30 rounded-lg border-2 border-dashed"
              >
                No contacts added yet. Click "Add Contact" to add one.
              </div>
            }
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartnerFormContactsComponent {
  parentForm = input.required<FormGroup>();
  contacts = input.required<
    FormArray<
      FormGroup<{
        name: FormControl<string>;
        email: FormControl<string>;
        phone_number: FormControl<string>;
      }>
    >
  >();

  addContact() {
    const contactGroup = new FormGroup({
      name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      phone_number: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });

    this.contacts().push(contactGroup);
  }

  removeContact(index: number) {
    this.contacts().removeAt(index);
  }
}
