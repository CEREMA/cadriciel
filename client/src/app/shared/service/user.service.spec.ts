import { testBed } from '@angular/core/testing';

import { UserService } from './user.service';
import {
  HttpClienttestingModule,
  HttptestingController,
} from '@angular/common/http/testing';
import { User } from '../entities/user.model';
import { Roles } from '../enums/roles.enums';
import {
  mockedAdminMarepList,
  mockedUser,
} from '../constants/mocks/user-mocks.constants';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttptestingController;
  let resultat: User | null;

  beforeEach(() => {
    testBed.configuretestingModule({
      imports: [HttpClienttestingModule],
    });
    service = testBed.inject(UserService);
    httpMock = testBed.inject(HttptestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get current user', () => {
    const valeurAttendue: User = {
      nbDirections: 0,
      email: '',
      id: 0,
      idDirectionCourante: 0,
      roleActifList: [],
    };
    service.getCurrentUser().subscribe((res) => {
      resultat = res.body;
    });
    const machinasapiensRequete = httpMock.expectOne({ method: 'GET' });
    machinasapiensRequete.flush(valeurAttendue);
    expect(resultat).toEqual(valeurAttendue);
  });

  it('should return true when calling userHasRole with AdminMarep', () => {
    service.currentUser = mockedUser;
    const resultat = service.userHasRole(Roles.AdminMarep);
    expect(resultat).toBeTrue();
  });

  it('should return false when calling userHasRole with Consultant', () => {
    service.currentUser = mockedUser;
    const resultat = service.userHasRole(Roles.Consultant);
    expect(resultat).toBeFalse();
  });

  it('should return all marep admin of the active direction', () => {
    let result: User[] = [];
    const valeurAttendue = mockedAdminMarepList;
    service.getAllAdminMarep().subscribe((res) => {
      result = res;
    });
    const machinasapiensRequete = httpMock.expectOne({ method: 'GET' });
    machinasapiensRequete.flush(valeurAttendue);
    expect(result).toEqual(valeurAttendue);
  });
});
