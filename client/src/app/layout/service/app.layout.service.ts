import { Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subject } from 'rxjs';
import { TabCloseEvent } from '../api/tabcloseevent';

export interface AppConfig {
  inputStyle: string;
  colorScheme: string;
  theme: string;
  ripple: boolean;
  menuMode: string;
  layoutTheme: string;
  scale: number;
}

interface LayoutState {
  staticMenuDesktopInactive: boolean;
  overlayMenuActive: boolean;
  profileSidebarVisible: boolean;
  configSidebarVisible: boolean;
  staticMenuMobileActive: boolean;
  menuHoverActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LayoutService {

  config: AppConfig = {
    ripple: true,
    inputStyle: 'filled',
    menuMode: 'slim',
    colorScheme: 'light',
    theme: 'blue',
    layoutTheme: 'primaryColor',
    scale: 13
  };

  state: LayoutState = {
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false
  };

  tabs: MenuItem[] = [];

  private configUpdate = new Subject<AppConfig>();

  private overlayOpen = new Subject<any>();

  private tabOpen = new Subject<MenuItem>();

  private tabClose = new Subject<TabCloseEvent>();

  configUpdate$ = this.configUpdate.asObservable();

  overlayOpen$ = this.overlayOpen.asObservable();

  tabOpen$ = this.tabOpen.asObservable();

  tabClose$ = this.tabClose.asObservable();

  onMenuToggle() {
    if (this.isDesktop()) {
      this.state.staticMenuDesktopInactive = !this.state.staticMenuDesktopInactive;
    } else {
      this.state.staticMenuMobileActive = !this.state.staticMenuMobileActive;

      if (this.state.staticMenuMobileActive) {
        this.overlayOpen.next(null);
      }
    }
  }

  onOverlaySubmenuOpen() {
    this.overlayOpen.next(null);
  }

  showProfileSidebar() {
    this.state.profileSidebarVisible = true;
  }

  showConfigSidebar() {
    this.state.configSidebarVisible = true;
  }

  isDesktop() {
    return window.innerWidth > 991;
  }

  isSlim() {
    return this.config.menuMode === 'slim';
  }

  isMobile() {
    return !this.isDesktop();
  }

  onConfigUpdate() {
    this.configUpdate.next(this.config);
  }

  onTabOpen(value: MenuItem) {
    this.tabOpen.next(value);
  }

  openTab(value: MenuItem) {
    this.tabs = [...this.tabs, value];
  }

  onTabClose(value: MenuItem, index: number) {
    this.tabClose.next({tab: value, index: index});
  }

  closeTab(index: number) {
    this.tabs.splice(index, 1);
    this.tabs = [...this.tabs];
  }

}
