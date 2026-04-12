import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { CreatePartnerRequest, LegalEntity, PartnerType } from '@src/app/core/models/partner.model';
import { City, District, Province, Village } from '@src/app/core/models/region.model';
import { PartnerService } from '@src/app/core/services/partner.service';
import { RegionService } from '@src/app/core/services/region.service';
import { finalize, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'partner-create-page',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './partner-create.page.html',
  styleUrl: './partner-create.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartnerCreatePage {
  private partnerService = inject(PartnerService);
  private regionService = inject(RegionService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isLoading = signal(false);

  legalEntities: LegalEntity[] = ['CV', 'PT', 'KOPERASI', 'INDIVIDUAL'];
  partnerTypes: PartnerType[] = ['BUYER', 'SUPPLIER'];

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

  // Convert form values to signals for reactive tracking in computed/rxResource
  provinsiValue = toSignal(this.form.controls.provinsi.valueChanges, {
    initialValue: this.form.controls.provinsi.value,
  });
  kotaValue = toSignal(this.form.controls.kota.valueChanges, {
    initialValue: this.form.controls.kota.value,
  });
  kecamatanValue = toSignal(this.form.controls.kecamatan.valueChanges, {
    initialValue: this.form.controls.kecamatan.value,
  });
  kelurahanValue = toSignal(this.form.controls.kelurahan.valueChanges, {
    initialValue: this.form.controls.kelurahan.value,
  });

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
    this.form.controls.provinsi.valueChanges.subscribe(() => {
      this.form.controls.kota.setValue(null);
    });

    // Reset districts when city changes
    this.form.controls.kota.valueChanges.subscribe(() => {
      this.form.controls.kecamatan.setValue(null);
    });

    // Reset villages when district changes
    this.form.controls.kecamatan.valueChanges.subscribe(() => {
      this.form.controls.kelurahan.setValue(null);
    });
  }

  displayFn(item?: { name: string } | string): string {
    if (typeof item === 'object' && item !== null) {
      return item.name;
    }
    return typeof item === 'string' ? item : '';
  }

  isTypeSelected(type: PartnerType): boolean {
    return this.form.controls.types.value.includes(type);
  }

  toggleType(type: PartnerType) {
    const currentTypes = [...this.form.controls.types.value];
    const index = currentTypes.indexOf(type);

    if (index > -1) {
      currentTypes.splice(index, 1);
    } else {
      currentTypes.push(type);
    }

    this.form.controls.types.setValue(currentTypes);
    this.form.controls.types.markAsTouched();
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
        next: () => {
          this.snackBar.open('Partner created successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
          this.router.navigate(['/dashboard/partner']);
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
