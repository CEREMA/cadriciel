import { testBed } from '@angular/core/testing';

describe('UpdaterService', () => {
  let service: ModelsService;

  beforeEach(() => {
    testBed.configuretestingModule({});
    service = testBed.inject(ModelsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
