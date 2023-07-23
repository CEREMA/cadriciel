import { ComponentFixture, testBed } from '@angular/core/testing';

import { JsonFormComponent } from './json-form.component';

describe('JsonFormComponent', () => {
  let component: JsonFormComponent;
  let fixture: ComponentFixture<JsonFormComponent>;

  beforeEach(async () => {
    await testBed
      .configuretestingModule({
        declarations: [JsonFormComponent],
      })
      .compileComponents();

    fixture = testBed.createComponent(JsonFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
