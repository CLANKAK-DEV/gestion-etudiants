import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { StudentService } from '../../../core/services/student.service';
import { ToastService } from '../../../core/services/toast.service';
import { Student, FILIERES } from '../../../core/models/student.model';
import { NormalizedError } from '../../../core/interceptors/api.interceptor';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './student-form.component.html',
})
export class StudentFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEdit = false;
  studentId = '';
  loading = false;
  fetchingStudent = false;
  readonly FILIERES = FILIERES;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private studentSvc: StudentService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      matricule:      ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[A-Za-z0-9-]{3,20}$/)]],
      nom:            ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      prenom:         ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email:          ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      telephone:      ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      date_naissance: ['', Validators.required],
      filiere:        ['', Validators.required],
      adresse:        ['', Validators.maxLength(200)],
      ville:          ['', [Validators.required, Validators.minLength(2), Validators.maxLength(85)]],
    });

    this.studentId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEdit = !!this.studentId;

    if (this.isEdit) {
      this.fetchingStudent = true;
      this.studentSvc.getStudent(this.studentId).pipe(takeUntil(this.destroy$)).subscribe({
        next: (s: Student) => {
          this.form.patchValue({ ...s, date_naissance: s.date_naissance.split('T')[0] });
          this.fetchingStudent = false;
        },
        error: (e: NormalizedError) => {
          this.toast.error('Could not load student', e.message);
          this.router.navigate(['/students']);
        }
      });
    }
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  f(name: string) { return this.form.get(name)!; }
  invalid(name: string) { return this.f(name).invalid && (this.f(name).dirty || this.f(name).touched); }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const payload = this.form.value;

    const op = this.isEdit
      ? this.studentSvc.updateStudent(this.studentId, payload)
      : this.studentSvc.createStudent(payload);

    op.pipe(takeUntil(this.destroy$)).subscribe({
      next: (s: Student) => {
        this.toast.success(
          this.isEdit ? 'Student updated' : 'Student added',
          `${s.prenom} ${s.nom} was ${this.isEdit ? 'saved' : 'created'} successfully.`
        );
        this.router.navigate(['/students']);
      },
      error: (e: NormalizedError) => {
        this.loading = false;
        if (e.fieldErrors) {
          Object.entries(e.fieldErrors).forEach(([field, msg]) => {
            this.f(field)?.setErrors({ server: msg });
          });
        }
        this.toast.error(this.isEdit ? 'Could not update student' : 'Could not add student', e.message);
      }
    });
  }
}
