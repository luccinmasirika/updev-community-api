export class SearchDataManagementDto {
  search: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
  filters?: string;
  fields?: string;
  include?: string;
  exclude?: string;
}
