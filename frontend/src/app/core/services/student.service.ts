import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiSuccess, Student, StudentQuery, PaginationMeta } from '../models/student.model';

export interface StudentPage {
  data: Student[];
  meta: PaginationMeta;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly base = '/api/students';

  constructor(private http: HttpClient) {}

  getStudents(query: StudentQuery = {}): Observable<StudentPage> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<ApiSuccess<Student[]>>(this.base, { params }).pipe(
      map(res => ({
        data: res.data,
        meta: res.meta ?? { total: res.data.length, page: 1, limit: res.data.length, totalPages: 1 }
      }))
    );
  }

  getStudent(id: string): Observable<Student> {
    return this.http.get<ApiSuccess<Student>>(`${this.base}/${id}`).pipe(map(r => r.data));
  }

  createStudent(payload: Partial<Student>): Observable<Student> {
    return this.http.post<ApiSuccess<Student>>(this.base, payload).pipe(map(r => r.data));
  }

  updateStudent(id: string, payload: Partial<Student>): Observable<Student> {
    return this.http.put<ApiSuccess<Student>>(`${this.base}/${id}`, payload).pipe(map(r => r.data));
  }

  deleteStudent(id: string): Observable<Student> {
    return this.http.delete<ApiSuccess<Student>>(`${this.base}/${id}`).pipe(map(r => r.data));
  }

  getAllStudents(query: StudentQuery = {}): Observable<Student[]> {
    return this.getStudents({ ...query, page: 1, limit: 100 }).pipe(map(r => r.data));
  }
}
