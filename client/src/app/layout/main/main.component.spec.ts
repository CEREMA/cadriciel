import { ComponentFixture, testBed } from '@angular/core/testing';

import { MainComponent } from './main.component';
import { HttpClienttestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AccueilComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(async () => {
    await testBed
      .configuretestingModule({
        declarations: [MainComponent],
        providers: [],
        imports: [
          HttpClienttestingModule,
          RouterModule.forRoot([], { relativeLinkResolution: 'corrected' }),
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      })
      .compileComponents();
  });
  beforeEach(() => {
    fixture = testBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
