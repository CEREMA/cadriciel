import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DBConfigService {
  private _endpointPrefix = '';

  get endpointPrefix(): string {
    return this._endpointPrefix;
  }

  set endpointPrefix(value: string) {
    this._endpointPrefix = value;
  }

  getEndpointFor(api: string): string {
    return `${this.endpointPrefix}${api}`;
  }
}
