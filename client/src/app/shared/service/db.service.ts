import { Injectable } from '@angular/core';
import { DBConfigService } from 'src/app/shared/core/config/db-config.service';

interface QueryResult {
  data?: any[] | any;
  error?: any;
}

@Injectable({
  providedIn: 'root',
})
export class Datamachinasapiens {
  private headers: Headers;

  constructor(private dbConfigService: DBConfigService) {
    const key = sessionStorage.getItem('access_token');
    let headers: any = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    };
    const impersonate = localStorage.getItem('impersonate');
    if (impersonate) headers.impersonate = impersonate;
    this.headers = new Headers(headers);
  }

  from(tableName: string) {
    return new QueryBuilder(
      this.dbConfigService.getEndpointFor(`/models/${tableName}?`),
      this.headers
    );
  }
}

class QueryBuilder {
  private url: string;
  private httpMethod: string;
  private body: object;

  constructor(url: string, private headers: Headers) {
    this.url = url;
    this.httpMethod = 'GET';
  }

  select(...fields: string[]): this {
    this.url += `select=${fields.join(',')}&`;
    return this;
  }

  delete(): this {
    this.httpMethod = 'DELETE';
    return this;
  }

  upsert(data: object): this {
    this.httpMethod = 'PUT'; // PUT is generally used for upsert operations
    this.body = data;
    return this;
  }

  update(data: object): this {
    this.httpMethod = 'PATCH'; // PATCH is generally used for updates
    this.body = data;
    return this;
  }

  insert(data: object): this {
    this.httpMethod = 'POST'; // POST is generally used for insertions
    this.body = data;
    return this;
  }

  csv(): this {
    this.url += `response=csv`;
    return this;
  }

  order(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.url += `order=${field}.${direction}&`;
    return this;
  }

  limit(value: number): this {
    this.url += `limit=${value}&`;
    return this;
  }

  offset(value: number): this {
    this.url += `offset=${value}&`;
    return this;
  }

  private buildCondition(method: string, params: any[]): string {
    const allowedMethods = [
      'any',
      'iLike',
      'notILike',
      'eq',
      'match',
      'neq',
      'in',
      'like',
      'notLike',
      'is',
      'not',
    ];
    if (allowedMethods.indexOf(method) == -1)
      throw new Error(`Unsupported method: ${method}`);
    if (method === 'match') return `${method}=${JSON.stringify(params)}`;
    return `${method}=${params.join(';')}`;
  }

  eq(...params: any[]): this {
    this.url += this.buildCondition('eq', params) + '&';
    return this;
  }

  match(params: any): this {
    this.url += this.buildCondition('match', params) + '&';
    return this;
  }

  neq(...params: any[]): this {
    this.url += this.buildCondition('neq', params) + '&';
    return this;
  }

  in(...params: any[]): this {
    this.url += this.buildCondition('in', params) + '&';
    return this;
  }

  like(...params: any[]): this {
    this.url += this.buildCondition('like', params) + '&';
    return this;
  }

  notLike(...params: any[]): this {
    this.url += this.buildCondition('notLike', params) + '&';
    return this;
  }

  iLike(...params: any[]): this {
    this.url += this.buildCondition('iLike', params) + '&';
    return this;
  }

  notILike(...params: any[]): this {
    this.url += this.buildCondition('notILike', params) + '&';
    return this;
  }

  is(...params: any[]): this {
    if (params[1] === null) params[1] = 'NULL';
    this.url += this.buildCondition('is', params) + '&';
    return this;
  }

  not(...params: any[]): this {
    if (params[1] === null) params[1] = 'NULL';
    this.url += this.buildCondition('is', params) + '&';
    return this;
  }

  any(...params: any[]): this {
    this.url += this.buildCondition('any', params) + '&';
    return this;
  }

  or(conditions: { [key: string]: any[] }[]): this {
    const items = conditions.map((condition) => {
      const method = Object.keys(condition)[0];
      const params = condition[method];
      return `(${this.buildCondition(method, params)})`;
    });
    this.url += `or=${items.join('')}&`;
    return this;
  }

  and(conditions: { [key: string]: any[] }[]): this {
    const items = conditions.map((condition) => {
      const method = Object.keys(condition)[0];
      const params = condition[method];
      return `(${this.buildCondition(method, params)})`;
    });
    this.url += `and=${items.join('')}&`;
    return this;
  }

  async then(
    resolve: (value: QueryResult) => void,
    reject?: (reason?: any) => void
  ): Promise<void> {
    try {
      const response = await fetch(this.url, {
        method: this.httpMethod,
        headers: this.headers,
        body: this.body ? JSON.stringify(this.body) : undefined,
      });
      if (!response.ok) {
        const error = await response.json();
        resolve({ error: error });
        throw new Error('Request failed');
      }
      const data = await response.json();
      resolve({ data });
    } catch (error) {
      if (reject) {
        reject(error);
      } else {
        console.error(error);
      }
    }
  }

  catch(reject: (reason?: any) => void): this {
    this.then(() => {}, reject);
    return this;
  }
}
