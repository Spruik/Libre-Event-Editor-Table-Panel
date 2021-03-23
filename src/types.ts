import { TableSortByFieldState } from '@grafana/ui';

export interface LibreEventEditorTableOptions {
  frameIndex: number;
  showHeader: boolean;
  sortBy?: TableSortByFieldState[];
}

export interface TableSortBy {
  displayName: string;
  desc: boolean;
}

export interface CustomFieldConfig {
  width: number;
  displayMode: string;
}
