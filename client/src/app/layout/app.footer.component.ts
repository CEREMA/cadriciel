import { Component, OnInit } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import packageJson from '../../../../package.json';

@Component({
  selector: 'app-footer',
  templateUrl: './app.footer.component.html',
})
export class AppFooterComponent implements OnInit {
  version!: string;
  name!: string;

  constructor(public layoutService: LayoutService) {}

  get colorScheme(): string {
    return this.layoutService.config.colorScheme;
  }

  ngOnInit(): void {
    this.version = packageJson.version;
    this.name = packageJson.name;
  }
}
