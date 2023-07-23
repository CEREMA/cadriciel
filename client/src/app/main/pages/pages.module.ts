import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './pages-routing.module';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { StepsModule } from 'primeng/steps';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

import { KeyFilterModule } from 'primeng/keyfilter';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';
import { SkeletonModule } from 'primeng/skeleton';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SelectButtonModule } from 'primeng/selectbutton';
import { VariablesGlobales } from 'src/app/shared/utils/globals';
import { CardModule } from 'primeng/card';
import { PaginatorModule } from 'primeng/paginator';
import { ListboxModule } from 'primeng/listbox';
import { SidebarModule } from 'primeng/sidebar';
import { PanelModule } from 'primeng/panel';
import { RadioButtonModule } from 'primeng/radiobutton';

import { RootComponent } from './root/root.component';

import { MultiSelectModule } from 'primeng/multiselect';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { LookupInputComponent } from 'src/app/shared/components/lookup-input/lookup-input.component';

@NgModule({
  exports: [],
  providers: [MessageService, VariablesGlobales],
  declarations: [LookupInputComponent, RootComponent],
  imports: [
    BreadcrumbModule,
    RadioButtonModule,
    PanelModule,
    AutoCompleteModule,
    MultiSelectModule,
    SidebarModule,
    ListboxModule,
    PaginatorModule,
    SelectButtonModule,
    ToastModule,
    DialogModule,
    ChartModule,
    InputTextareaModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    MessagesModule,
    StepsModule,
    TabViewModule,
    ButtonModule,
    TableModule,
    KeyFilterModule,
    CommonModule,
    HomeRoutingModule,
    SkeletonModule,
    InputTextModule,
    TranslateModule,
    SharedModule,
    InputNumberModule,
    CardModule,
  ],
})
export class HomeModule {}
