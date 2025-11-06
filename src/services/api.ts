export type ApiResponse<T> = {
    projects(projects: unknown): unknown;
  tasks: never[]; data: T; message?: string 
}
