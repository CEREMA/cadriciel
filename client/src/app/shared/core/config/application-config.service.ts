import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApplicationConfigService {
  private _endpointPrefix = '';
  private _endpointPrefixApiOpen = '';
  private _endpointGeoApiGouvFr = '';

  get endpointPrefix(): string {
    return this._endpointPrefix;
  }

  set endpointPrefix(value: string) {
    this._endpointPrefix = value;
  }

  get endpointPrefixApiOpen(): string {
    return this._endpointPrefixApiOpen;
  }

  set endpointPrefixApiOpen(value: string) {
    this._endpointPrefixApiOpen = value;
  }

  get endpointGeoApiGouvFr(): string {
    return this._endpointGeoApiGouvFr;
  }

  set endpointGeoApiGouvFr(value: string) {
    this._endpointGeoApiGouvFr = value;
  }

  getEndpointFor(api: string): string {
    return `${this.endpointPrefix}${api}`;
  }

  getEndpointForApiOpen(api: string): string {
    return `${this.endpointPrefixApiOpen}${api}`;
  }

  getEndpointGeoApiGouvFr(api: string): string {
    return `${this.endpointGeoApiGouvFr}${api}`
  }
}
