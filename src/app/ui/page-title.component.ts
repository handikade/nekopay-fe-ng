import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ui-page-title',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `
    <div class="flex items-center gap-4 p-4">
      @if (backLink()) {
        <button mat-icon-button [routerLink]="backLink()">
          <mat-icon>arrow_back</mat-icon>
        </button>
      }
      <h1 class="m-0 text-2xl font-semibold">{{ title() }}</h1>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiPageTitle {
  title = input.required<string>();
  backLink = input<string | unknown[] | null>(null);
}
