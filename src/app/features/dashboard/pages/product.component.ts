import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-product',
  template: '<p>Product works!</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductComponent {}
