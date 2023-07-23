import { testBed } from '@angular/core/testing';

import { DbConfigService } from './db-config.service';

describe('DbConfigService', () => {
  let service: DbConfigService;

  beforeEach(() => {
    testBed.configuretestingModule({});
    service = testBed.inject(DbConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
