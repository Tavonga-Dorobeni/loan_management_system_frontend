export interface CatalogueItem {
  id: string;
  title: string;
  category: string;
  status: 'active' | 'draft' | 'archived';
  summary: string;
}
