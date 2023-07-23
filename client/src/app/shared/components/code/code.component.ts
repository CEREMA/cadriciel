import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-code',
  template: ` <pre><code class="border-round">{{code}}</code></pre> `,
})
export class AppCodeComponent {
  @Input() code: string;
}

@NgModule({
  imports: [CommonModule],
  exports: [AppCodeComponent],
  declarations: [AppCodeComponent],
})
export class AppCodeModule {}
