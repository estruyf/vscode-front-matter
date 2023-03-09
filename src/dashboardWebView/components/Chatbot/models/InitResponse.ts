export interface InitResponse {
  company: Company;
  project: Project;
}

export interface Project {
  id: number;
  created_at: string;
  name: string;
  company_id: number;
}

export interface Company {
  company_id: number;
  name: string;
}
