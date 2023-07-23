import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndicComponent } from './components/indic/indic.component';
import { JsonFormComponent } from './components/json-form/json-form.component';

@NgModule({
  declarations: [IndicComponent, JsonFormComponent],
  imports: [CommonModule],
  exports: [IndicComponent],
})
export class SharedModule {}
