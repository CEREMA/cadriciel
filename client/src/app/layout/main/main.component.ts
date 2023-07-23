import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { filter, Subscription } from 'rxjs';
import { AppSidebarComponent } from '../app.sidebar.component';
import { AppTopBarComponent } from '../app.topbar.component';
import { MenuService } from '../app.menu.service';
import { LayoutService } from '../service/app.layout.service';
import { TabCloseEvent } from '../api/tabcloseevent';
import { Claims } from '../../shared/entities/claims.model';

@Component({
  selector: 'app-accueil',
  templateUrl: './main.component.html',
})
export class MainComponent implements OnInit {
  overlayMenuOpenSubscription: Subscription;
  tabOpenSubscription: Subscription;
  tabCloseSubscription: Subscription;
  menuOutsideClickListener: any;

  @ViewChild(AppSidebarComponent) appSidebar!: AppSidebarComponent;
  @ViewChild(AppTopBarComponent) appTopbar!: AppTopBarComponent;

  constructor(
    private menuService: MenuService,
    public layoutService: LayoutService,
    public renderer: Renderer2,
    public router: Router,
    private oAuthService: OAuthService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute
  ) {
    this.overlayMenuOpenSubscription =
      this.layoutService.overlayOpen$.subscribe(() => {
        if (!this.menuOutsideClickListener) {
          this.menuOutsideClickListener = this.renderer.listen(
            'document',
            'click',
            (event) => {
              const isOutsideClicked = !(
                this.appSidebar.el.nativeElement.isSameNode(event.target) ||
                this.appSidebar.el.nativeElement.contains(event.target) ||
                this.appTopbar.menuButton.nativeElement.isSameNode(
                  event.target
                ) ||
                this.appTopbar.menuButton.nativeElement.contains(event.target)
              );
              if (isOutsideClicked) {
                this.hideMenu();
              }
            }
          );
        }

        if (this.layoutService.state.staticMenuMobileActive) {
          this.blockBodyScroll();
        }
      });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.hideMenu();
      });

    this.tabOpenSubscription = this.layoutService.tabOpen$.subscribe((tab) => {
      this.router.navigate(tab.routerLink);
      this.layoutService.openTab(tab);
    });

    this.tabCloseSubscription = this.layoutService.tabClose$.subscribe(
      (event: TabCloseEvent) => {
        if (
          this.router.isActive(event.tab.routerLink[0], {
            paths: 'subset',
            queryParams: 'subset',
            fragment: 'ignored',
            matrixParams: 'ignored',
          })
        ) {
          const tabs = this.layoutService.tabs;

          if (tabs.length > 1) {
            if (event.index === tabs.length - 1)
              this.router.navigate(tabs[tabs.length - 2].routerLink);
            else this.router.navigate(tabs[event.index + 1].routerLink);
          } else {
            this.router.navigate(['/']);
          }
        }

        this.layoutService.closeTab(event.index);
      }
    );
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe((data) => {
      this.userService.currentUser = data.user.body;
      this.userService.addInfoFromClaims(
        <Claims>this.oAuthService.getIdentityClaims()
      );
    });
  }

  blockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.add('blocked-scroll');
    } else {
      document.body.className += ' blocked-scroll';
    }
  }

  unblockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.remove('blocked-scroll');
    } else {
      document.body.className = document.body.className.replace(
        new RegExp(
          '(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)',
          'gi'
        ),
        ' '
      );
    }
  }

  hideMenu() {
    this.layoutService.state.overlayMenuActive = false;
    this.layoutService.state.staticMenuMobileActive = false;
    this.layoutService.state.menuHoverActive = false;
    this.menuService.reset();
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener = null;
    }
    this.unblockBodyScroll();
  }

  get containerClass() {
    return {
      'layout-slim': this.layoutService.config.menuMode === 'slim',
      'layout-static': this.layoutService.config.menuMode === 'static',
      'layout-mobile-active': this.layoutService.state.staticMenuMobileActive,
      'layout-static-inactive':
        this.layoutService.state.staticMenuDesktopInactive &&
        this.layoutService.config.menuMode === 'static',
      'p-input-filled': this.layoutService.config.inputStyle === 'outlined',
      'p-ripple-disabled': !this.layoutService.config.ripple,
      'layout-light':
        this.layoutService.config.layoutTheme === 'colorScheme' &&
        this.layoutService.config.colorScheme === 'light',
      'layout-dark':
        this.layoutService.config.layoutTheme === 'colorScheme' &&
        this.layoutService.config.colorScheme === 'dark',
      'layout-primary':
        this.layoutService.config.colorScheme !== 'dark' &&
        this.layoutService.config.layoutTheme === 'primaryColor',
    };
  }

  ngOnDestroy() {
    if (this.overlayMenuOpenSubscription) {
      this.overlayMenuOpenSubscription.unsubscribe();
    }

    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
    }

    if (this.tabOpenSubscription) {
      this.tabOpenSubscription.unsubscribe();
    }

    if (this.tabCloseSubscription) {
      this.tabCloseSubscription.unsubscribe();
    }
  }

  onLogoutClick(event: MouseEvent) {
    this.oAuthService.logOut();
    event.preventDefault();
  }
}
