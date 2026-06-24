import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiSuccess, StudentStats } from '../models/student.model';

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<StudentStats> {
    return this.http
      .get<ApiSuccess<StudentStats>>('/api/stats/overview')
      .pipe(map(r => r.data));
  }
}
