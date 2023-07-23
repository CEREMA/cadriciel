import { ComponentFixture, testBed } from '@angular/core/testing';

import { LogoutComponent } from './logout.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('DeconnexionComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;

  beforeEach(async () => {
    await testBed
      .configuretestingModule({
        declarations: [LogoutComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = testBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
