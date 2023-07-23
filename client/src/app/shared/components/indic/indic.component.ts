import { Component, Input, OnInit } from '@angular/core';
import { LayoutService } from '../../../layout/service/app.layout.service';

@Component({
  selector: 'app-indic',
  templateUrl: './indic.component.html',
  styleUrls: ['./indic.component.scss'],
})
export class IndicComponent implements OnInit {
  @Input() type: string;

  constructor(public layoutService: LayoutService) {}

  ngOnInit(): void {}

  bgColor(): string {
    const luminosite: string =
      this.layoutService.config.colorScheme === 'light' ? '200' : '400';

    const defaut: string = 'bg-primary-' + luminosite;
    if (!this.type) {
      return defaut;
    }
    switch (this.type) {
      case 'astuce': {
        return 'bg-green-' + luminosite;
      }
      case 'avertissement': {
        return 'bg-yellow-' + luminosite;
      }
      case 'danger': {
        return 'bg-red-' + luminosite;
      }
      default: {
        return defaut;
      }
    }
  }

  icone(): string {
    const defaut: string = 'pi-comment';
    if (!this.type) {
      return defaut;
    }
    switch (this.type) {
      case 'astuce': {
        return 'pi-verified';
      }
      case 'avertissement': {
        return 'pi-bolt';
      }
      case 'danger': {
        return 'pi-ban';
      }
      default: {
        return defaut;
      }
    }
  }
}
