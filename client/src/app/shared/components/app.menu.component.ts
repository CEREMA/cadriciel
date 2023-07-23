import { Component, OnInit, Injectable } from '@angular/core';
import { LayoutService } from '../../layout/service/app.layout.service';
import { PolicyService } from '../service/policy.service';
import MyMenu from '../../main/menu.json';

interface MenuItem {
  label: string;
  icon: string;
  routerLink?: string[];
  visible?: boolean;
  items?: MenuItem[];
}

@Injectable()
@Component({
  selector: 'app-menu',
  templateUrl: '../../layout/app.menu.component.html',
})
export class AppMenuComponent implements OnInit {
  model: any[] = [];

  parsePolicy(model: any[], policy: any): any[] {
    model.forEach((parent: any) => {
      parent.visible = false;
      parent.items.forEach((child: any) => {
        child.visible = false;
      });
    });

    for (let i = 0; i < model.length; i++) {
      const parent = model[i];
      for (let j = 0; j < parent.items.length; j++) {
        const child = parent.items[j];
        if (
          policy.uri.includes('all') ||
          policy.uri.includes(child.routerLink[0])
        ) {
          model[i].items[j].visible = true;
          model[i].visible = true;
        }
      }
    }

    return model;
  }

  constructor(
    private policy: PolicyService,
    public layoutService: LayoutService
  ) {}

  ngOnInit() {
    console.log(MyMenu);
    const model: MenuItem[] = MyMenu;
    this.policy
      .getCurrentPolicy(localStorage.getItem('impersonate'))
      .subscribe((data) => {
        this.model = this.parsePolicy(model, data);
      });
  }
}
