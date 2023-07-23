import { testBed } from '@angular/core/testing';

import { ProfilsService } from './profils.service';

describe('ProfilsService', () => {
  let service: ProfilsService;

  beforeEach(() => {
    testBed.configuretestingModule({});
    service = testBed.inject(ProfilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
