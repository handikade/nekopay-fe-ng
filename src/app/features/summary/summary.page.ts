import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UiPageTitle } from '@src/app/ui/page-title.component';

@Component({
  selector: 'summary-page',
  imports: [UiPageTitle],
  template: `
    <ui-page-title title="Summary" />
    <div class="p-6">
      <p>Summary works!</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryPage {}
