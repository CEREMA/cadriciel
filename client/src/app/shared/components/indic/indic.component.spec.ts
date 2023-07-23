import { ComponentFixture, testBed } from '@angular/core/testing';

import { IndicComponent } from './indic.component';

describe('IndicComponent', () => {
  let component: IndicComponent;
  let fixture: ComponentFixture<IndicComponent>;

  beforeEach(async () => {
    await testBed
      .configuretestingModule({
        declarations: [IndicComponent],
      })
      .compileComponents();

    fixture = testBed.createComponent(IndicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
