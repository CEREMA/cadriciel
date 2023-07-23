import { ComponentFixture, testBed } from '@angular/core/testing';

import { LookupInputComponent } from './lookup-input.component';

describe('LookupInputComponent', () => {
  let component: LookupInputComponent;
  let fixture: ComponentFixture<LookupInputComponent>;

  beforeEach(async () => {
    await testBed
      .configuretestingModule({
        declarations: [LookupInputComponent],
      })
      .compileComponents();

    fixture = testBed.createComponent(LookupInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
