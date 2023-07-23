import { ComponentFixture, testBed } from '@angular/core/testing';

import { WorkInProgressComponent } from './work-in-progress.component';

describe('WorkInProgressComponent', () => {
  let component: WorkInProgressComponent;
  let fixture: ComponentFixture<WorkInProgressComponent>;

  beforeEach(async () => {
    await testBed
      .configuretestingModule({
        declarations: [WorkInProgressComponent],
      })
      .compileComponents();

    fixture = testBed.createComponent(WorkInProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
