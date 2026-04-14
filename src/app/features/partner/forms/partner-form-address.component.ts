import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { City, District, Province, Village } from '@src/app/core/models/region.model';
import { RegionService } from '@src/app/core/services/region.service';
import { of, startWith, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'partner-form-address',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-card>
      <mat-card-content [formGroup]="form()">
        <div class="text-lg font-medium my-4">Address</div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Province -->
          <mat-form-field appearance="outline">
            <mat-label>Province</mat-label>
            <input
              type="text"
              matInput
              formControlName="provinsi"
              [matAutocomplete]="autoProvince"
            />
            <mat-autocomplete #autoProvince="matAutocomplete" [displayWith]="displayFn">
              @for (p of filteredProvinces(); track p.id) {
                <mat-option [value]="p">{{ p.name }}</mat-option>
              }
            </mat-autocomplete>
            @if (form().controls['provinsi'].value) {
              <button
                matSuffix
                mat-icon-button
                aria-label="Clear"
                (click)="form().controls['provinsi'].setValue(null); $event.stopPropagation()"
              >
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>

          <!-- City -->
          <mat-form-field appearance="outline">
            <mat-label>City</mat-label>
            <input type="text" matInput formControlName="kota" [matAutocomplete]="autoCity" />
            <mat-autocomplete #autoCity="matAutocomplete" [displayWith]="displayFn">
              @for (c of filteredCities(); track c.id) {
                <mat-option [value]="c">{{ c.name }}</mat-option>
              }
            </mat-autocomplete>
            @if (form().controls['kota'].value) {
              <button
                matSuffix
                mat-icon-button
                aria-label="Clear"
                (click)="form().controls['kota'].setValue(null); $event.stopPropagation()"
              >
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>

          <!-- District -->
          <mat-form-field appearance="outline">
            <mat-label>District (Kecamatan)</mat-label>
            <input
              type="text"
              matInput
              formControlName="kecamatan"
              [matAutocomplete]="autoDistrict"
            />
            <mat-autocomplete #autoDistrict="matAutocomplete" [displayWith]="displayFn">
              @for (d of filteredDistricts(); track d.id) {
                <mat-option [value]="d">{{ d.name }}</mat-option>
              }
            </mat-autocomplete>
            @if (form().controls['kecamatan'].value) {
              <button
                matSuffix
                mat-icon-button
                aria-label="Clear"
                (click)="form().controls['kecamatan'].setValue(null); $event.stopPropagation()"
              >
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>

          <!-- Village -->
          <mat-form-field appearance="outline">
            <mat-label>Village (Kelurahan)</mat-label>
            <input
              type="text"
              matInput
              formControlName="kelurahan"
              [matAutocomplete]="autoVillage"
            />
            <mat-autocomplete #autoVillage="matAutocomplete" [displayWith]="displayFn">
              @for (v of filteredVillages(); track v.id) {
                <mat-option [value]="v">{{ v.name }}</mat-option>
              }
            </mat-autocomplete>
            @if (form().controls['kelurahan'].value) {
              <button
                matSuffix
                mat-icon-button
                aria-label="Clear"
                (click)="form().controls['kelurahan'].setValue(null); $event.stopPropagation()"
              >
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>

          <!-- Postal Code -->
          <mat-form-field appearance="outline">
            <mat-label>Postal Code</mat-label>
            <input
              matInput
              formControlName="postal_code"
              placeholder="e.g. 12345"
              data-testid="partner-postal-code-input"
            />
            @if (form().get('postal_code')?.hasError('pattern')) {
              <mat-error>Must be 5 digits</mat-error>
            }
          </mat-form-field>
        </div>

        <!-- Address -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Full Address</mat-label>
          <textarea
            matInput
            formControlName="address"
            placeholder="Street, building, etc."
            rows="3"
            data-testid="partner-address-textarea"
          ></textarea>
        </mat-form-field>
      </mat-card-content>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartnerFormAddressComponent {
  form = input.required<FormGroup>();

  private regionService = inject(RegionService);

  // Convert form values to signals for reactive tracking in computed/rxResource
  provinsiValue = toSignal(
    toObservable(this.form).pipe(
      switchMap((f) =>
        f.controls['provinsi'].valueChanges.pipe(startWith(f.controls['provinsi'].value)),
      ),
    ),
  );
  kotaValue = toSignal(
    toObservable(this.form).pipe(
      switchMap((f) => f.controls['kota'].valueChanges.pipe(startWith(f.controls['kota'].value))),
    ),
  );
  kecamatanValue = toSignal(
    toObservable(this.form).pipe(
      switchMap((f) =>
        f.controls['kecamatan'].valueChanges.pipe(startWith(f.controls['kecamatan'].value)),
      ),
    ),
  );
  kelurahanValue = toSignal(
    toObservable(this.form).pipe(
      switchMap((f) =>
        f.controls['kelurahan'].valueChanges.pipe(startWith(f.controls['kelurahan'].value)),
      ),
    ),
  );

  // Resources for regions
  provincesResource = rxResource<Province[], undefined>({
    stream: () => this.regionService.getProvinces().pipe(map((res) => res.data)),
  });

  citiesResource = rxResource<City[], string | null>({
    params: () => {
      const p = this.provinsiValue();
      return p && typeof p === 'object' ? (p as Province).id : null;
    },
    stream: ({ params }) =>
      params ? this.regionService.getCities(params).pipe(map((res) => res.data)) : of([]),
  });

  districtsResource = rxResource<District[], string | null>({
    params: () => {
      const c = this.kotaValue();
      return c && typeof c === 'object' ? (c as City).id : null;
    },
    stream: ({ params }) =>
      params ? this.regionService.getDistricts(params).pipe(map((res) => res.data)) : of([]),
  });

  villagesResource = rxResource<Village[], string | null>({
    params: () => {
      const d = this.kecamatanValue();
      return d && typeof d === 'object' ? (d as District).id : null;
    },
    stream: ({ params }) =>
      params ? this.regionService.getVillages(params).pipe(map((res) => res.data)) : of([]),
  });

  // Filtered lists for autocompletes
  filteredProvinces = computed(() => {
    const list = this.provincesResource.value() ?? [];
    const search = this.provinsiValue();
    if (typeof search === 'string') {
      const lower = search.toLowerCase();
      return list.filter((p) => p.name.toLowerCase().includes(lower));
    }
    return list;
  });

  filteredCities = computed(() => {
    const list = this.citiesResource.value() ?? [];
    const search = this.kotaValue();
    if (typeof search === 'string') {
      const lower = search.toLowerCase();
      return list.filter((c) => c.name.toLowerCase().includes(lower));
    }
    return list;
  });

  filteredDistricts = computed(() => {
    const list = this.districtsResource.value() ?? [];
    const search = this.kecamatanValue();
    if (typeof search === 'string') {
      const lower = search.toLowerCase();
      return list.filter((d) => d.name.toLowerCase().includes(lower));
    }
    return list;
  });

  filteredVillages = computed(() => {
    const list = this.villagesResource.value() ?? [];
    const search = this.kelurahanValue();
    if (typeof search === 'string') {
      const lower = search.toLowerCase();
      return list.filter((v) => v.name.toLowerCase().includes(lower));
    }
    return list;
  });

  constructor() {
    // Reset cities when province changes
    setTimeout(() => {
      this.form().controls['provinsi'].valueChanges.subscribe(() => {
        this.form().controls['kota'].setValue(null);
      });

      // Reset districts when city changes
      this.form().controls['kota'].valueChanges.subscribe(() => {
        this.form().controls['kecamatan'].setValue(null);
      });

      // Reset villages when district changes
      this.form().controls['kecamatan'].valueChanges.subscribe(() => {
        this.form().controls['kelurahan'].setValue(null);
      });
    });
  }

  displayFn(item?: { name: string } | string): string {
    if (typeof item === 'object' && item !== null) {
      return item.name;
    }
    return typeof item === 'string' ? item : '';
  }
}
