import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../entities/user.model';
import { ApplicationConfigService } from '../core/config/application-config.service';

@Injectable({
  providedIn: 'root',
})
export class PolicyService {
  constructor(
    private httpClient: HttpClient,
    private applicationConfigService: ApplicationConfigService
  ) {}
  getCurrentPolicy(impersonate?: string): Observable<HttpResponse<User>> {
    const url = `/policies?impersonate=${impersonate}`;
    return this.httpClient.get<any>(
      this.applicationConfigService.getEndpointFor(url)
    );
  }
}
