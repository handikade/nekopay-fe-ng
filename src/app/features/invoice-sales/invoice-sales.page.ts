import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'invoice-sales-page',
  template: '<p>Sales Invoice works!</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceSalesPage {}
