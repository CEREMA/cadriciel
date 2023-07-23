import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { MainComponent } from './main/main.component';
import { MainRoutingModule } from '../main/main-routing.module';
import { MenuModule } from 'primeng/menu';
import { HttpClientModule } from '@angular/common/http';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigModule } from './config/config.module';
import { AppMenuitemComponent } from './app.menuitem.component';
import { AppTopBarComponent } from './app.topbar.component';
import { AppSidebarComponent } from './app.sidebar.component';
import { AppFooterComponent } from './app.footer.component';
import { AppMenuComponent } from '../shared/components/app.menu.component';
import { AppBreadcrumbComponent } from './app.breadcrumb.component';
import { AppComponent } from '../app.component';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    MainComponent,
    AppMenuitemComponent,
    AppTopBarComponent,
    AppSidebarComponent,
    AppFooterComponent,
    AppMenuComponent,
    AppBreadcrumbComponent,
    AppComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MainRoutingModule,
    HttpClientModule,
    MenuModule,
    StyleClassModule,
    AppConfigModule,
    InputTextModule,
    TranslateModule,
  ],
})
export class MainModule {}
