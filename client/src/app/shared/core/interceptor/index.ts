import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HandleReqInterceptor } from './handle-req.interceptor';

export const HttpInterceptorProviders = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: HandleReqInterceptor,
    multi: true,
  },
];
