import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export interface NormalizedError {
  message: string;
  status?: number;
  fieldErrors?: Record<string, string>;
}

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        const normalized: NormalizedError = {
          message: 'Something went wrong. Please try again.',
          status: err.status,
        };
        if (err.error?.message) normalized.message = err.error.message;
        if (err.error?.errors?.length) {
          normalized.fieldErrors = err.error.errors.reduce(
            (acc: Record<string, string>, e: { field: string; message: string }) => {
              acc[e.field] = e.message;
              return acc;
            },
            {}
          );
        }
        if (err.status === 0) normalized.message = 'Cannot reach the server. Is the backend running?';
        return throwError(() => normalized);
      })
    );
  }
}
