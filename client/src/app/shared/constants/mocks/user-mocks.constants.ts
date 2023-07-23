import { User } from '../../entities/user.model';
import { Roles } from '../../enums/roles.enums';

export const mockedUser: User = {
  email: 'test@marep.fr',
  id: 1,
  idDirectionCourante: 1,
  roleActifList: [Roles.AdminMarep],
  nbDirections: 0,
};

export const mockedUserAdminMarep: User = {
  email: 'test2@marep.fr',
  id: 2,
  idDirectionCourante: 1,
  roleActifList: [Roles.AdminMarep],
  nbDirections: 0,
};

export const mockedUserOperateur: User = {
  email: 'test3@marep.fr',
  id: 3,
  idDirectionCourante: 1,
  roleActifList: [Roles.Operateur],
  nbDirections: 0,
};

export const mockedUserConsultant: User = {
  email: 'test4@marep.fr',
  id: 4,
  idDirectionCourante: 1,
  roleActifList: [Roles.Consultant],
  nbDirections: 0,
};

export const mockedAdminMarepList: User[] = [mockedUser, mockedUserAdminMarep];
