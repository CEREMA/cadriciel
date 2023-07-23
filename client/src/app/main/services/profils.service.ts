import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from 'src/app/shared/core/config/application-config.service';
import { profils } from '../interfaces/profils';
@Injectable({
  providedIn: 'root',
})
export class ProfilsService {
  constructor(
    private httpClient: HttpClient,
    private applicationConfigService: ApplicationConfigService
  ) {}
  public updateProfil(profil: any): Observable<profils> {
    return this.httpClient.post(
      this.applicationConfigService.getEndpointFor(`/profils`),
      profil
    );
  }
  public get(): Observable<profils> {
    return this.httpClient.get(
      this.applicationConfigService.getEndpointFor(`/profils`)
    );
  }
}
