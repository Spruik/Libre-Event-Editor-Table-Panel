import React, { PureComponent } from 'react';
import {
  AppEvents,
  DataFrame,
  PanelData,
  PanelProps,
  BusEventBase,
  EventBusSrv,
  dateTimeAsMoment,
  dateTimeFormatWithAbbrevation,
} from '@grafana/data';
import { LibreEventEditorTableOptions, MachineEvent, Reason, Equipment } from 'types';
import { getDataSourceSrv, SystemJS } from '@grafana/runtime';
import ReasonPanel from './ReasonPanel';
import { duration } from 'moment';

const { alertError, alertSuccess } = AppEvents;

interface Props extends PanelProps<LibreEventEditorTableOptions> {}

interface State {
  machineEvent: MachineEvent | null;
  equipment: Equipment | null;
  bus: EventBusSrv;
  busEventName: string;
}

export class RefreshEvent extends BusEventBase {
  static type = 'refresh';
}

function formatSecsAsDaysHrsMinsSecs(seconds: number) {

  console.log(seconds)

  const day = Math.floor(seconds / (24 * 3600));
  const hour = Math.floor((seconds - day * 24 * 3600) / (60 * 60));
  const minute = Math.floor((seconds - day * 24 * 3600 - hour * 60 * 60) / 60);
  const second = Math.floor(seconds - day * 24 * 3600 - hour * 60 * 60 - minute * 60);

  return (
    `${day ? `${day} Days ` : ''}` +
    `${hour ? `${hour} Hours ` : ''}` +
    `${minute ? `${minute} Minutes ` : ''}` +
    `${second ? `${second} Seconds ,` : ''}`
  );
}

export class LibreEventEditorTablePanel extends PureComponent<PanelProps, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      machineEvent: null,
      equipment: null,
      bus: new EventBusSrv(),
      busEventName: '',
    };
  }

  transformEquipment = (dataFrame: DataFrame | undefined): Equipment => {
    let equipment: Equipment = { id: '' };
    if (!dataFrame) {
      return equipment;
    }
    const idField = dataFrame.fields.find(field => field.name === 'id');
    if (idField) {
      equipment.id = idField.values.get(idField.values.length - 1);
    }
    return equipment;
  };

  transformEvents = (dataFrame: DataFrame | undefined): MachineEvent[] => {
    if (!dataFrame) {
      return [];
    }

    const packMLStatus = dataFrame.fields.find(field => field.name === 'packMLStatus');
    const startTimeField = dataFrame.fields.find(field => field.name === 'startDateTime');
    const endTimeField = dataFrame.fields.find(field => field.name === 'endDateTime');
    const durationField = dataFrame.fields.find(field => field.name === 'duration');
    const timeTypeField = dataFrame.fields.find(field => field.name === 'reasonCategoryCode');
    const categoryField = dataFrame.fields.find(field => field.name === 'reasonCode');
    const reasonField = dataFrame.fields.find(field => field.name === 'reasonText');
    const commentField = dataFrame.fields.find(field => field.name === 'comments');

    let events: MachineEvent[] = [];

    for (let i = 0; i < dataFrame.length; i++) {
      events.push({
        packMLStatus: packMLStatus?.values.get(i),
        startDateTime: startTimeField?.values.get(i),
        endDateTime: endTimeField?.values.get(i),
        duration: durationField?.values.get(i),
        timeType: timeTypeField?.values.get(i),
        category: categoryField?.values.get(i),
        reason: reasonField?.values.get(i),
        comment: commentField?.values.get(i),
      });
    }

    return events;
  };

  transformReasons = (dataFrame: DataFrame | undefined): Reason[] => {
    if (!dataFrame) {
      return [];
    }

    const idField = dataFrame.fields.find(field => field.name === 'id');
    const isActiveField = dataFrame.fields.find(field => field.name === 'isActaive');
    const classField = dataFrame.fields.find(field => field.name === 'class');
    const labelField = dataFrame.fields.find(field => field.name === 'label');
    const textField = dataFrame.fields.find(field => field.name === 'text');
    const parentField = dataFrame.fields.find(field => field.name === 'parent');
    const standardValueField = dataFrame.fields.find(field => field.name === 'standardValue');
    const categoryCode = dataFrame.fields.find(field => field.name === 'category.code');

    let reasons: Reason[] = [];

    for (let i = 0; i < dataFrame.length; i++) {
      reasons.push({
        id: idField?.values.get(i),
        isActive: isActiveField?.values.get(i),
        class: classField?.values.get(i),
        label: labelField?.values.get(i),
        text: textField?.values.get(i),
        parent: parentField?.values.get(i),
        standardValue: standardValueField?.values.get(i),
        categoryCode: categoryCode?.values.get(i),
      });
    }

    return reasons;
  };

  transformReasonsWithParents = (dataFrame: DataFrame | undefined): Reason[] => {
    if (!dataFrame) {
      return [];
    }

    const idField = dataFrame.fields.find(field => field.name === 'id');
    const isActiveField = dataFrame.fields.find(field => field.name === 'isActaive');
    const classField = dataFrame.fields.find(field => field.name === 'class');
    const labelField = dataFrame.fields.find(field => field.name === 'label');
    const textField = dataFrame.fields.find(field => field.name === 'text');
    const parentField = dataFrame.fields.find(field => field.name === 'parent.id');
    const standardValueField = dataFrame.fields.find(field => field.name === 'standardValue');
    const categoryCode = dataFrame.fields.find(field => field.name === 'category.code');

    let reasons: Reason[] = [];

    for (let i = 0; i < dataFrame.length; i++) {
      reasons.push({
        id: idField?.values.get(i),
        isActive: isActiveField?.values.get(i),
        class: classField?.values.get(i),
        label: labelField?.values.get(i),
        text: textField?.values.get(i),
        parent: parentField?.values.get(i),
        standardValue: standardValueField?.values.get(i),
        categoryCode: categoryCode?.values.get(i),
      });
    }

    return reasons;
  };

  transform = (
    data: PanelData
  ): { reasons: Reason[]; reasonsWithParents: Reason[]; equipment: Equipment; events: MachineEvent[] } => {
    /*
    const eventSerie: DataFrame | undefined = data.series.find(serie => {
      for (let i = 0; i < MACHINE_EVENT_COLUMNS.length; i++) {
        const index = serie.fields.findIndex(field => {
          return field.name === MACHINE_EVENT_COLUMNS[i];
        });
        if (index < 0) {
          return false;
        }
      }
      return true;
    });

    const reasonSerie: DataFrame | undefined = data.series.find(serie => {
      for (let i = 0; i < MACHINE_EVENT_COLUMNS.length; i++) {
        const index = serie.fields.findIndex(field => {
          return field.name === REASON_COLUMNS[i];
        });
        if (index < 0) {
          return false;
        }
      }
      return true;
    });
*/
    return {
      equipment: this.transformEquipment(data.series[0]),
      events: this.transformEvents(data.series[1]),
      reasons: this.transformReasons(data.series[2]),
      reasonsWithParents: this.transformReasonsWithParents(data.series[3]),
    };
  };

  onRowClick = (e: any, row: MachineEvent) => {
    const { reasons } = this.transform(this.props.data);

    if (reasons && reasons.length > 0) {
      this.setState({
        machineEvent: row,
      });
    }
  };

  onMouseHover = (e: any) => {
    e.target.parentElement.style.background = 'grey';
  };

  onMouseLeave = (e: any) => {
    e.target.parentElement.style.background = null;
  };

  splitEvent = (equipment: Equipment, event: MachineEvent, newDateTime: Date) => {
    const eventsRequest = this.props.data.request?.targets.find(target => {
      return target.refId === this.props.options.eventMetric;
    });

    if (eventsRequest) {
      getDataSourceSrv()
        .get(eventsRequest.datasource)
        .then(ds => {
          const firstEventStartTime = dateTimeAsMoment(event.startDateTime).format('YYYY-MM-DDTHH:mm:ssZ');
          const secondEventStartTime = dateTimeAsMoment(newDateTime).format('YYYY-MM-DDTHH:mm:ssZ');
          try {
            //@ts-ignore
            ds.request(
              `
              mutation{
                splitEventLogTS(input:[{eventStartTime:"${firstEventStartTime}", packMLStatus:"${event.packMLStatus}", equipment: {id:"${equipment.id}"}},{eventStartTime:"${secondEventStartTime}", packMLStatus:"${event.packMLStatus}", equipment: {id:"${equipment.id}"}}]){
                  eventTime
                }
              }
            `
            ).then((payload: Response) => {
              if (payload?.status === 200) {
                console.log(payload);
                this.dashboardAlert(alertSuccess, `Event Updated`);
                this.refreshDashboard();
                this.dismissModal();
              }
            });
          } catch (error) {
            this.dashboardAlert(alertError, `Failed to Update: ${error}`);
          }
        })
        .catch((err: Error) => {
          this.dashboardAlert(alertError, `Failed to find Event Metric '${this.props.options.eventMetric}': ${err}`);
        });
    } else {
      this.dashboardAlert(alertError, `Failed to find Event Metric '${this.props.options.eventMetric}'`);
    }
  };

  setReason = (equipment: Equipment, event: MachineEvent, reason: Reason) => {
    const eventsRequest = this.props.data.request?.targets.find(target => {
      return target.refId === this.props.options.eventMetric;
    });

    if (eventsRequest) {
      getDataSourceSrv()
        .get(eventsRequest.datasource)
        .then(ds => {
          try {
            //@ts-ignore
            ds.request(
              `
            mutation
              {
                updateEventLogTS(input:[{eventStartTime:"${event.startDateTime}",equipment:{id:"${equipment.id}"}, reasonText: "${reason.text}", reasonCategoryCode:"${reason.categoryCode}"}]){
                  equipment{id}
                  eventTime
                  reasonCategoryCode
                  reasonCode
                  reasonText
                  PackMLStatus
                  reasonValue
                  reasonValueUoM
                  comment
                  previousTime
                }
              }
            `
            ).then((payload: Response) => {
              if (payload?.status === 200) {
                this.dashboardAlert(alertSuccess, `Event Updated`);
                this.refreshDashboard();
                this.dismissModal();
              }
            });
          } catch (error) {
            this.dashboardAlert(alertError, `Failed to Update: ${error}`);
          }
        })
        .catch((err: Error) => {
          this.dashboardAlert(alertError, `Failed to find Event Metric '${this.props.options.eventMetric}': ${err}`);
        });
    } else {
      this.dashboardAlert(alertError, `Failed to find Event Metric '${this.props.options.eventMetric}'`);
    }
  };

  editComment = (equipment: Equipment, event: MachineEvent, comment: string) => {
    const eventsRequest = this.props.data.request?.targets.find(target => {
      return target.refId === this.props.options.eventMetric;
    });

    if (eventsRequest) {
      getDataSourceSrv()
        .get(eventsRequest.datasource)
        .then(ds => {
          try {
            //@ts-ignore
            ds.request(
              `
            mutation
              {
                updateEventLogTS(input:[{eventStartTime:"${event.startDateTime}",equipment:{id:"${equipment.id}"}, comment: "${comment}"}]){
                  equipment{id}
                  eventTime
                  reasonCategoryCode
                  reasonCode
                  reasonText
                  PackMLStatus
                  reasonValue
                  reasonValueUoM
                  comment
                  previousTime
                }
              }
            `
            ).then((payload: Response) => {
              if (payload?.status === 200) {
                console.log(payload);
                this.dashboardAlert(alertSuccess, `Event Updated`);
                this.refreshDashboard();
                this.dismissModal();
              }
            });
          } catch (error) {
            this.dashboardAlert(alertError, `Failed to Update: ${error}`);
          }
        })
        .catch((err: Error) => {
          this.dashboardAlert(alertError, `Failed to find Event Metric '${this.props.options.eventMetric}': ${err}`);
        });
    } else {
      this.dashboardAlert(alertError, `Failed to find Event Metric '${this.props.options.eventMetric}'`);
    }
  };

  dashboardAlert = (type: any, msg: string) => {
    SystemJS.load('app/core/app_events').then((events: any) => {
      events.emit(type, [msg]);
    });
  };

  refreshDashboard = () => {
    //
    // TODO: This is such a hack and needs to be replaced with something better
    // Source: https://community.grafana.com/t/refresh-the-dashboard-from-the-react-panel-plugin/31255/7
    //
    const refreshPicker = document.getElementsByClassName('refresh-picker');
    if (refreshPicker.length > 0) {
      const buttons = refreshPicker[0].getElementsByClassName('toolbar-button');
      if (buttons.length > 0) {
        const button = buttons[0];
        // @ts-ignore
        button.click();
      }
    }
  };

  dismissModal = () => {
    this.setState({ machineEvent: null });
  };

  render() {
    const { width } = this.props;
    const { machineEvent } = this.state;
    const { reasons, equipment, reasonsWithParents, events } = this.transform(this.props.data);

    const count = events?.length;
    const reasonCount = reasons?.length;

    if (!count || !reasonCount) {
      return <div>No data</div>;
    }

    console.log(this.props);

    return (
      <div>
        {machineEvent ? (
          <ReasonPanel
            machineEvent={machineEvent}
            equipment={equipment}
            title={'Event Log Editor'}
            reasons={reasons.concat(reasonsWithParents)}
            dismissModal={this.dismissModal}
            onAssignReason={this.setReason}
            onSplitEvent={this.splitEvent}
            onEditComment={this.editComment}
          ></ReasonPanel>
        ) : (
          <></>
        )}
        <table width={width}>
          <thead>
            <tr>
              <th>Start</th>
              <th>End</th>
              <th>Duration</th>
              <th>Time Category</th>
              <th>Reason</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {events.length > 0 &&
              events.map(event => {
                return (
                  <tr
                    onClick={e => {
                      return this.onRowClick(e, event);
                    }}
                    onMouseOver={e => {
                      return this.onMouseHover(e);
                    }}
                    onMouseLeave={e => {
                      return this.onMouseLeave(e);
                    }}
                    key={event.startDateTime}
                  >
                    <td>{dateTimeAsMoment(event.startDateTime).format('YYYY-MM-DD[, ]HH:mm:ss')}</td>
                    <td>{event.endDateTime && dateTimeAsMoment(event.endDateTime).format('YYYY-MM-DD[, ]HH:mm:ss')}</td>
                    <td>{formatSecsAsDaysHrsMinsSecs(event.duration)}</td>
                    <td>{event.timeType}</td>
                    <td>{event.reason}</td>
                    <td>{event.comment}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    );
  }
}
