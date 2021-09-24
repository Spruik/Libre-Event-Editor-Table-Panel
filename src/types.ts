export interface LibreEventEditorTableOptions {
  eventMetric: string;
  reasonMetric: string;
}

export const MACHINE_EVENT_COLUMNS = [
  'startDateTime',
  'endDateTime',
  'duration',
  'reasonCategoryCode',
  'reasonText',
  'reasonCode',
  'comments',
];
export interface Equipment {
  id: string;
}
export interface MachineEvent {
  startDateTime: number;
  endDateTime?: number;
  duration: number;
  timeType: string;
  category?: string;
  reason?: string;
  comment?: string;
}

export const REASON_COLUMNS = [
  'id',
  'isActive',
  'class',
  'label',
  'text',
  'standardValue',
];

export interface Reason {
  id: string;
  isActive: boolean;
  class: string;
  label: string;
  text: string;
  standardValue: string;
}
