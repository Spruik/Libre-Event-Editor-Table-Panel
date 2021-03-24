import { PanelPlugin } from '@grafana/data';
import { LibreEventEditorTableOptions } from './types';
import { LibreEventEditorTablePanel } from './LibreEventEditorTablePanel';

export const plugin = new PanelPlugin<LibreEventEditorTableOptions>(LibreEventEditorTablePanel)
  .setNoPadding()
  .setPanelOptions((builder) => {
    builder
      .addTextInput({
        path: 'eventMetric',
        name: 'Event Metric',
        description: 'Name of Query Metric with Event Data',
        defaultValue: `Events`,
      })
      .addTextInput({
        path: 'reasonMetric',
        name: 'Reason Metric',
        description: 'Name of Query Metric with Reason Data',
        defaultValue: `Reasons`,
      });
  });
  