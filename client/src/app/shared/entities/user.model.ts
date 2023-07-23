export interface User {
  email: string;
  nom: string;
  prenom: string;
  id: number;
  idDirectionCourante: number;
  roleActifList: string[];
  nbDirections: number;
}
