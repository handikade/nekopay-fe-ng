import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'summary-page',
  template: '<h1>Summary</h1><p>Summary works!</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryPage {}
