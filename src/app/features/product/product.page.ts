import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'product-page',
  template: '<p>Product works!</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPage {}
