import { Component, Input, OnInit } from '@angular/core';
import { LayoutService } from '../service/app.layout.service';
import { MenuService } from '../app.menu.service';
import { MyLocalStorageService } from '../../shared/core/storage/MyLocalStorageService';

const NAME_KEY: string = 'TEMPLATE_NAME';
const COLOR_KEY: string = 'TEMPLATE_COLOR';
const SCALE_KEY: string = 'TEMPLATE_SCALE';
const MENU_THEME_KEY: string = 'TEMPLATE_MENU_THEME';
const MENU_MODE_KEY: string = 'TEMPLATE_MENU_MODE';
const INPUT_STYLE_KEY: string = 'TEMPLATE_INPUT_STYLE';
const RIPPLE_KEY: string = 'TEMPLATE_RIPPLE';

@Component({
  selector: 'app-config',
  styleUrls: ['./app.config.component.scss'],
  templateUrl: './app.config.component.html',
})
export class AppConfigComponent implements OnInit {
  @Input() minimal: boolean = false;

  componentThemes: any[] = [];

  scales: number[] = [12, 13, 14, 15, 16];

  constructor(
    public layoutService: LayoutService,
    public menuService: MenuService,
    public storageService: MyLocalStorageService
  ) {}

  ngOnInit() {
    this.componentThemes = [
      { name: 'indigo', lightColor: '#4C63B6', darkColor: '#6A7EC2' },
      { name: 'blue', lightColor: '#1992D4', darkColor: '#3BABE8' },
      { name: 'green', lightColor: '#27AB83', darkColor: '#44D4A9' },
      { name: 'deeppurple', lightColor: '#896FF4', darkColor: '#B1A0F8' },
      { name: 'orange', lightColor: '#DE911D', darkColor: '#E8AB4F' },
      { name: 'cyan', lightColor: '#00B9C6', darkColor: '#58CDD5' },
      { name: 'yellow', lightColor: '#F9C404', darkColor: '#FDDD68' },
      { name: 'pink', lightColor: '#C74B95', darkColor: '#D77FB4' },
      { name: 'purple', lightColor: '#BA6FF4', darkColor: '#D1A0F8' },
      { name: 'lime', lightColor: '#84BD20', darkColor: '#A3D44E' },
    ];
    this.restorePrefs();
  }

  private restorePrefs() {
    // Si les deux préférences sont enregistrées on doit les restaurer en même temps,
    // sinon on a une race condition entre les deux restaurations.
    if (
      this.storageService.getItem(NAME_KEY) &&
      this.storageService.getItem(COLOR_KEY)
    ) {
      this.changeColorSchemeAndTheme(
        this.storageService.getItem(COLOR_KEY) as string,
        this.storageService.getItem(NAME_KEY) as string
      );
    } else {
      if (this.storageService.getItem(NAME_KEY)) {
        this.changeTheme(this.storageService.getItem(NAME_KEY) as string);
      }
      if (this.storageService.getItem(COLOR_KEY)) {
        this.changeColorScheme(
          this.storageService.getItem(COLOR_KEY) as string
        );
      }
    }

    if (this.storageService.getItem(SCALE_KEY)) {
      this.scale = JSON.parse(this.storageService.getItem(SCALE_KEY) as string);
      this.applyScale();
    }
    if (this.storageService.getItem(MENU_THEME_KEY)) {
      this.menuTheme = this.storageService.getItem(MENU_THEME_KEY) as string;
    }
    if (this.storageService.getItem(MENU_MODE_KEY)) {
      this.menuMode = this.storageService.getItem(MENU_MODE_KEY) as string;
    }
    if (this.storageService.getItem(INPUT_STYLE_KEY)) {
      this.inputStyle = this.storageService.getItem(INPUT_STYLE_KEY) as string;
    }
    if (this.storageService.getItem(RIPPLE_KEY)) {
      this.ripple = JSON.parse(
        this.storageService.getItem(RIPPLE_KEY) as string
      );
    }
  }

  changeColorScheme(colorScheme: string) {
    this.storageService.setItem(COLOR_KEY, colorScheme);
    const themeLink = <HTMLLinkElement>document.getElementById('theme-link');
    const themeLinkHref = themeLink.getAttribute('href');
    const currentColorScheme = 'theme-' + this.layoutService.config.colorScheme;
    const newColorScheme = 'theme-' + colorScheme;
    const newHref = themeLinkHref!.replace(currentColorScheme, newColorScheme);
    this.replaceThemeLink(newHref, () => {
      this.layoutService.config.colorScheme = colorScheme;
      this.layoutService.onConfigUpdate();
    });
  }

  changeTheme(theme: string) {
    this.storageService.setItem(NAME_KEY, theme);
    const themeLink = <HTMLLinkElement>document.getElementById('theme-link');
    const newHref = themeLink
      .getAttribute('href')!
      .replace(this.layoutService.config.theme, theme);
    this.replaceThemeLink(newHref, () => {
      this.layoutService.config.theme = theme;
      this.layoutService.onConfigUpdate();
    });
  }

  changeColorSchemeAndTheme(colorScheme: string, theme: string) {
    this.storageService.setItem(COLOR_KEY, colorScheme);
    this.storageService.setItem(NAME_KEY, theme);

    const themeLink = <HTMLLinkElement>document.getElementById('theme-link');
    const themeLinkHref = themeLink.getAttribute('href');

    const currentColorScheme = 'theme-' + this.layoutService.config.colorScheme;
    const newColorScheme = 'theme-' + colorScheme;

    let newHref = themeLinkHref!.replace(currentColorScheme, newColorScheme);
    newHref = newHref!.replace(this.layoutService.config.theme, theme);

    this.replaceThemeLink(newHref, () => {
      this.layoutService.config.colorScheme = colorScheme;
      this.layoutService.config.theme = theme;
      this.layoutService.onConfigUpdate();
    });
  }

  replaceThemeLink(href: string, onComplete: Function) {
    const id = 'theme-link';
    const themeLink = <HTMLLinkElement>document.getElementById(id);
    const cloneLinkElement = <HTMLLinkElement>themeLink.cloneNode(true);

    cloneLinkElement.setAttribute('href', href);
    cloneLinkElement.setAttribute('id', id + '-clone');

    themeLink.parentNode!.insertBefore(cloneLinkElement, themeLink.nextSibling);

    cloneLinkElement.addEventListener('load', () => {
      themeLink.remove();
      cloneLinkElement.setAttribute('id', id);
      onComplete();
    });
  }

  isIE() {
    return /(MSIE|Trident\/|Edge\/)/i.test(window.navigator.userAgent);
  }

  onConfigButtonClick() {
    this.layoutService.showConfigSidebar();
  }

  get currentTheme(): string {
    return this.layoutService.config.theme;
  }

  get colorScheme(): string {
    return this.layoutService.config.colorScheme;
  }

  set colorScheme(_val: string) {
    this.changeColorScheme(_val);
  }

  get visible(): boolean {
    return this.layoutService.state.configSidebarVisible;
  }

  set visible(_val: boolean) {
    this.layoutService.state.configSidebarVisible = _val;
  }

  get scale(): number {
    return this.layoutService.config.scale;
  }

  set scale(_val: number) {
    this.storageService.setItem(SCALE_KEY, JSON.stringify(_val));
    this.layoutService.config.scale = _val;
  }

  get menuTheme(): string {
    return this.layoutService.config.layoutTheme;
  }

  set menuTheme(_val: string) {
    this.storageService.setItem(MENU_THEME_KEY, _val);
    this.layoutService.config.layoutTheme = _val;
  }

  get menuMode(): string {
    return this.layoutService.config.menuMode;
  }

  set menuMode(_val: string) {
    this.storageService.setItem(MENU_MODE_KEY, _val);
    this.layoutService.config.menuMode = _val;
    if (this.layoutService.isSlim()) {
      this.menuService.reset();
    }
  }

  get inputStyle(): string {
    return this.layoutService.config.inputStyle;
  }

  set inputStyle(_val: string) {
    this.storageService.setItem(INPUT_STYLE_KEY, _val);
    this.layoutService.config.inputStyle = _val;
  }

  get ripple(): boolean {
    return this.layoutService.config.ripple;
  }

  set ripple(_val: boolean) {
    this.storageService.setItem(RIPPLE_KEY, JSON.stringify(_val));
    this.layoutService.config.ripple = _val;
  }

  decrementScale() {
    this.scale--;
    this.applyScale();
  }

  incrementScale() {
    this.scale++;
    this.applyScale();
  }

  applyScale() {
    document.documentElement.style.fontSize = this.scale + 'px';
  }
}
