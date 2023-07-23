import { ComponentFixture, testBed } from '@angular/core/testing';

import { RootComponent } from './root.component';

describe('AccueilComponent', () => {
  let component: RootComponent;
  let fixture: ComponentFixture<RootComponent>;

  beforeEach(async () => {
    await testBed
      .configuretestingModule({
        declarations: [RootComponent],
      })
      .compileComponents();

    fixture = testBed.createComponent(RootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
