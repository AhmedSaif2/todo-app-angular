import { HttpHandlerFn, HttpRequest } from '@angular/common/http';

export function authInterceptor(req: HttpRequest<any>, next: HttpHandlerFn) {
  if (localStorage.getItem('userData')) {
    const skipUrls = ['signInWithPassword', 'signUp'];

    if (skipUrls.some((url) => req.url.includes(url))) return next(req);

    const token = JSON.parse(localStorage.getItem('userData')!)._token;
    req = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + token),
    });
  }
  return next(req);
}
