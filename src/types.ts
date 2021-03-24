
export interface LibreEventEditorTableOptions {
  eventMetric: string;
  reasonMetric: string;
}


export const MACHINE_EVENT_COLUMNS = [
  "id", 
  "startDateTime",
  "endDateTime",
  "duration",
  "reasonCategoryCode",
  "reasonText",
  "reasonCode",
  "comments"
]

export interface MachineEvent {
  id: string;
  startDateTime: number;
  endDateTime?: number;
  duration: number;
  timeType: string;

  category?: string;
  reason?: string;
  comment: string;
}

export const REASON_COLUMNS = [
  "id", 
  "isActive",
  "class",
  "label",
  "text",
  "standardValue",
  "equipment",
  "equipmentClass"
]

export interface Reason {
  id: string;
  isActive: boolean;
  class: string;
  label: string;
  text: string;
  standardValue: string;
  equipment: Object
  equipmentClass: Object
}