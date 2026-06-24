import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { StudentService, StudentPage } from '../../../core/services/student.service';
import { StatsService } from '../../../core/services/stats.service';
import { ToastService } from '../../../core/services/toast.service';
import { FiliereColorService } from '../../../core/services/filiere-color.service';
import { Student, StudentQuery, StudentStats, FILIERES, PAGE_SIZE_OPTIONS, SORTABLE_FIELDS } from '../../../core/models/student.model';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './student-list.component.html',
})
export class StudentListComponent implements OnInit, OnDestroy {
  // Data
  students: Student[] = [];
  stats: StudentStats | null = null;
  meta = { total: 0, page: 1, limit: 10, totalPages: 1 };

  // UI state
  loading = true;
  statsLoading = true;
  error = '';
  studentToDelete: Student | null = null;
  deleting = false;
  showDeleteModal = false;
  exportOpen = false;

  // Filter state
  search = '';
  filiere = '';
  ville = '';
  dateFrom = '';
  dateTo = '';
  sortBy = 'created_at';
  sortOrder: 'asc' | 'desc' = 'desc';
  page = 1;
  limit = 10;

  readonly FILIERES = FILIERES;
  readonly PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;
  readonly SORTABLE_FIELDS = SORTABLE_FIELDS;

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private studentSvc: StudentService,
    private statsSvc: StatsService,
    private toast: ToastService,
    readonly colorSvc: FiliereColorService
  ) {}

  ngOnInit() {
    this.loadStats();
    this.loadStudents();

    // Debounce search input
    this.search$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => { this.page = 1; this.loadStudents(); });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  get query(): StudentQuery {
    return {
      search: this.search, filiere: this.filiere, ville: this.ville,
      dateFrom: this.dateFrom, dateTo: this.dateTo,
      sortBy: this.sortBy, sortOrder: this.sortOrder,
      page: this.page, limit: this.limit
    };
  }

  loadStudents() {
    this.loading = true;
    this.error = '';
    this.studentSvc.getStudents(this.query).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.students = res.data; this.meta = res.meta; this.loading = false; },
      error: (e) => { this.error = e.message; this.loading = false; }
    });
  }

  loadStats() {
    this.statsLoading = true;
    this.statsSvc.getStats().pipe(takeUntil(this.destroy$)).subscribe({
      next: (s) => { this.stats = s; this.statsLoading = false; },
      error: () => { this.statsLoading = false; }
    });
  }

  onSearchInput() { this.search$.next(this.search); }

  applyFilter() { this.page = 1; this.loadStudents(); }

  resetFilters() {
    this.search = ''; this.filiere = ''; this.ville = '';
    this.dateFrom = ''; this.dateTo = '';
    this.sortBy = 'created_at'; this.sortOrder = 'desc';
    this.page = 1; this.loadStudents();
  }

  onPageChange(p: number) { this.page = p; this.loadStudents(); }
  onLimitChange(l: number) { this.limit = l; this.page = 1; this.loadStudents(); }

  get pages(): number[] {
    return Array.from({ length: this.meta.totalPages }, (_, i) => i + 1);
  }

  minOf(a: number, b: number): number { return Math.min(a, b); }

  calcAge(dob: string): number {
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }

  filiereColor(f: string): string {
    return this.colorSvc.getColor(f);
  }

  // Delete
  confirmDelete(s: Student) { this.studentToDelete = s; this.showDeleteModal = true; }
  cancelDelete() { this.studentToDelete = null; this.showDeleteModal = false; }

  doDelete() {
    if (!this.studentToDelete) return;
    this.deleting = true;
    this.studentSvc.deleteStudent(this.studentToDelete.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (s) => {
        this.toast.success('Student deleted', `${s.prenom} ${s.nom} was removed.`);
        this.showDeleteModal = false; this.studentToDelete = null; this.deleting = false;
        this.loadStudents(); this.loadStats();
      },
      error: (e) => { this.toast.error('Delete failed', e.message); this.deleting = false; }
    });
  }

  // Export dropdown (Angular-controlled — no Bootstrap JS needed)
  toggleExport(e: MouseEvent) { e.stopPropagation(); this.exportOpen = !this.exportOpen; }

  @HostListener('document:click')
  closeExport() { this.exportOpen = false; }

  async exportPdf() {
    this.exportOpen = false;
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Student List', 14, 16);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString()}  |  Total: ${this.meta.total}`, 14, 23);
    autoTable(doc, {
      startY: 28,
      head: [['Matricule','Last Name','First Name','Email','Filière','City','Age']],
      body: this.students.map(s => [
        s.matricule, s.nom, s.prenom, s.email, s.filiere, s.ville, this.calcAge(s.date_naissance)
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] }
    });
    doc.save('students.pdf');
  }

  async exportExcel() {
    this.exportOpen = false;
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(this.students.map(s => ({
      Matricule: s.matricule, 'Last Name': s.nom, 'First Name': s.prenom,
      Email: s.email, Phone: s.telephone, DOB: s.date_naissance,
      Filière: s.filiere, Address: s.adresse ?? '', City: s.ville,
      'Created At': new Date(s.created_at).toLocaleDateString()
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'students.xlsx');
  }
}
