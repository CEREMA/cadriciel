import { testBed } from '@angular/core/testing';

import { AccueilResolver } from './accueil.resolver';
import { HttpClienttestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AccueilResolver', () => {
  let resolver: AccueilResolver;

  beforeEach(() => {
    testBed.configuretestingModule({
      imports: [HttpClienttestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    resolver = testBed.inject(AccueilResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
