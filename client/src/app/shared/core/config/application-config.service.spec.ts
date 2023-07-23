import { testBed } from '@angular/core/testing';

import { ApplicationConfigService } from './application-config.service';

describe('ApplicationConfigService', () => {
  let service: ApplicationConfigService;

  beforeEach(() => {
    testBed.configuretestingModule({});
    service = testBed.inject(ApplicationConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
