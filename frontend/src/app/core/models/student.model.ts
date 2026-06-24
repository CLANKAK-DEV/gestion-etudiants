export interface Student {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_naissance: string;
  filiere: string;
  adresse: string | null;
  ville: string;
  created_at: string;
  updated_at: string;
}

export interface StudentQuery {
  search?: string;
  filiere?: string;
  ville?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface StudentStats {
  total: number;
  newThisMonth: number;
  newLast30Days: number;
  filiereCount: number;
  byFiliere: { name: string; count: number }[];
  monthly: { key: string; label: string; year: number; count: number }[];
  recent: Student[];
}

export const FILIERES = [
  'Génie Informatique',
  'Génie Civil',
  'Génie Électrique',
  'Génie Mécanique',
  'Génie Industriel',
  'Réseaux & Télécoms',
  'Sciences Économiques',
  'Gestion & Management',
  'Mathématiques Appliquées',
  'Biologie',
] as const;

export type Filiere = (typeof FILIERES)[number];

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const SORTABLE_FIELDS = [
  { value: 'created_at', label: 'Date added' },
  { value: 'nom', label: 'Last name' },
  { value: 'prenom', label: 'First name' },
  { value: 'matricule', label: 'Matricule' },
  { value: 'filiere', label: 'Filière' },
  { value: 'ville', label: 'City' },
];
