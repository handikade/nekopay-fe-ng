import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Bank } from '@src/app/core/models/bank.model';
import { BankService } from '@src/app/core/services/bank.service';

@Component({
  selector: 'partner-form-banks',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-card>
      <mat-card-content>
        <div class="flex justify-between items-center my-4">
          <div class="text-lg font-medium">Bank Accounts</div>
          <button
            mat-stroked-button
            type="button"
            (click)="addBankAccount()"
            data-testid="add-bank-account-button"
          >
            <mat-icon>add</mat-icon>
            Add Bank Account
          </button>
        </div>

        <div [formGroup]="parentForm()">
          <div formArrayName="partner_bank_accounts" class="flex flex-col gap-4">
            @for (bankGroup of bankAccounts().controls; track bankGroup; let i = $index) {
              <div [formGroupName]="i" class="p-4 border rounded-lg relative bg-slate-50/50">
                <div class="flex justify-between items-center mb-4">
                  <span class="font-medium text-black/60">Bank Account #{{ i + 1 }}</span>
                  <button
                    mat-icon-button
                    color="warn"
                    type="button"
                    (click)="removeBankAccount(i)"
                    [attr.data-testid]="'remove-bank-account-button-' + i"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Bank -->
                  <mat-form-field appearance="outline" class="md:col-span-2">
                    <mat-label>Bank</mat-label>
                    <input
                      matInput
                      formControlName="bank"
                      [matAutocomplete]="bankAuto"
                      (input)="onBankSearch($event)"
                      placeholder="Search bank..."
                      [attr.data-testid]="'bank-autocomplete-input-' + i"
                    />
                    <mat-autocomplete
                      #bankAuto="matAutocomplete"
                      [displayWith]="displayFn"
                      (opened)="onBankAutocompleteOpened()"
                    >
                      @for (bank of banks(); track bank.id) {
                        <mat-option [value]="bank" [attr.data-testid]="'bank-option-' + bank.code">
                          {{ bank.name }} ({{ bank.code }})
                        </mat-option>
                      }
                      @if (isBanksLoading()) {
                        <mat-option disabled>
                          <div class="flex items-center justify-center p-2">
                            <mat-spinner diameter="20"></mat-spinner>
                          </div>
                        </mat-option>
                      }
                    </mat-autocomplete>
                    @if (bankGroup.get('bank')?.value) {
                      <button
                        matSuffix
                        mat-icon-button
                        aria-label="Clear"
                        (click)="bankGroup.get('bank')?.setValue(null)"
                        type="button"
                      >
                        <mat-icon>close</mat-icon>
                      </button>
                    }
                    @if (bankGroup.get('bank')?.hasError('required')) {
                      <mat-error>Bank is required</mat-error>
                    }
                  </mat-form-field>

                  <!-- Account Number -->
                  <mat-form-field appearance="outline">
                    <mat-label>Account Number</mat-label>
                    <input
                      matInput
                      formControlName="account_number"
                      placeholder="e.g. 070000..."
                      [attr.data-testid]="'account-number-input-' + i"
                    />
                    @if (bankGroup.get('account_number')?.hasError('required')) {
                      <mat-error>Account Number is required</mat-error>
                    }
                  </mat-form-field>

                  <!-- Account Name -->
                  <mat-form-field appearance="outline">
                    <mat-label>Account Name</mat-label>
                    <input
                      matInput
                      formControlName="account_name"
                      placeholder="e.g. PT Neko..."
                      [attr.data-testid]="'account-name-input-' + i"
                    />
                    @if (bankGroup.get('account_name')?.hasError('required')) {
                      <mat-error>Account Name is required</mat-error>
                    }
                  </mat-form-field>
                </div>
              </div>
            } @empty {
              <div
                class="text-center py-8 text-black/40 italic bg-slate-50/30 rounded-lg border-2 border-dashed"
              >
                No bank accounts added yet. Click "Add Bank Account" to add one.
              </div>
            }
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartnerFormBanksComponent {
  parentForm = input.required<FormGroup>();
  bankAccounts = input.required<
    FormArray<
      FormGroup<{
        bank: FormControl<Bank | string | null>;
        account_number: FormControl<string>;
        account_name: FormControl<string>;
      }>
    >
  >();

  private bankService = inject(BankService);

  // Banks for autocomplete
  banks = signal<Bank[]>([]);
  isBanksLoading = signal(false);
  hasMoreBanks = signal(true);
  private bankPage = 1;
  private bankSearch = '';

  addBankAccount() {
    const bankGroup = new FormGroup({
      bank: new FormControl<Bank | string | null>(null, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      account_number: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      account_name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });

    this.bankAccounts().push(bankGroup);

    // Load banks if not already loaded
    if (this.banks().length === 0) {
      this.loadBanks(true);
    }
  }

  removeBankAccount(index: number) {
    this.bankAccounts().removeAt(index);
  }

  loadBanks(reset = false) {
    if (reset) {
      this.bankPage = 1;
      this.hasMoreBanks.set(true);
    }

    if (!this.hasMoreBanks() || this.isBanksLoading()) return;

    this.isBanksLoading.set(true);
    this.bankService
      .getList({ page: this.bankPage, limit: 10, search: this.bankSearch })
      .subscribe({
        next: (res) => {
          if (reset) {
            this.banks.set(res.data);
          } else {
            this.banks.update((current) => [...current, ...res.data]);
          }
          this.hasMoreBanks.set(
            res.meta ? res.meta.page < (res.meta.totalPages ?? 0) : res.data.length === 10,
          );
          this.bankPage++;
          this.isBanksLoading.set(false);
        },
        error: () => {
          this.isBanksLoading.set(false);
        },
      });
  }

  onBankSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.bankSearch = value;
    this.loadBanks(true);
  }

  onBankScroll() {
    this.loadBanks();
  }

  onBankAutocompleteOpened() {
    setTimeout(() => {
      const panel = document.querySelector('.mat-mdc-autocomplete-panel');
      if (panel) {
        panel.addEventListener('scroll', (event: Event) => {
          const target = event.target as HTMLElement;
          if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 10) {
            this.onBankScroll();
          }
        });
      }
    });
  }

  displayFn(item?: { name: string } | string): string {
    if (typeof item === 'object' && item !== null) {
      return item.name;
    }
    return typeof item === 'string' ? item : '';
  }
}
