import React, { PureComponent  } from 'react';

import { AppEvents, DataFrame, PanelData, PanelProps, BusEventBase, EventBusSrv } from '@grafana/data';
import { LibreEventEditorTableOptions, MachineEvent, Reason, MACHINE_EVENT_COLUMNS, REASON_COLUMNS } from 'types';
import { HorizontalGroup, Modal, Button } from '@grafana/ui';
import { getDataSourceSrv, SystemJS } from '@grafana/runtime';

const { alertError, alertSuccess } = AppEvents;

interface Props extends PanelProps<LibreEventEditorTableOptions> {
}

interface State {
  machineEvent: MachineEvent | null;
  bus: EventBusSrv;
  busEventName: string;
}

export class RefreshEvent extends BusEventBase {
  static type = 'refresh';
}

export class LibreEventEditorTablePanel extends PureComponent<PanelProps, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      machineEvent: null,
      bus: new EventBusSrv(),
      busEventName: ''
    };
  }

  transformEvents = (dataFrame: DataFrame | undefined): MachineEvent[] => {
    if (!dataFrame) {
      return []
    }
    
    const idField = dataFrame.fields.find(field => field.name === 'id')
    const startTimeField = dataFrame.fields.find(field => field.name === 'startDateTime')
    const endTimeField = dataFrame.fields.find(field => field.name === 'endDateTime')
    const durationField = dataFrame.fields.find(field => field.name === 'duration')
    const timeTypeField = dataFrame.fields.find(field => field.name === 'reasonCategoryCode')
    const categoryField = dataFrame.fields.find(field => field.name === 'reasonCode')
    const reasonField = dataFrame.fields.find(field => field.name === 'reasonText')
    const commentField = dataFrame.fields.find(field => field.name === 'comments')

    let events: MachineEvent[] = [];

    for (let i = 0; i < dataFrame.length; i++) {
      events.push({
        id: idField?.values.get(i),
        startDateTime: startTimeField?.values.get(i),
        endDateTime: endTimeField?.values.get(i),
        duration: durationField?.values.get(i),
        timeType: timeTypeField?.values.get(i),
        category: categoryField?.values.get(i),
        reason: reasonField?.values.get(i),
        comment: commentField?.values.get(i),
      })
    }

    return events;
  }

  transformReasons = (dataFrame: DataFrame | undefined): Reason[] => {
    if (!dataFrame) {
      return []
    }
    
    const idField = dataFrame.fields.find(field => field.name === 'id')
    const isActiveField = dataFrame.fields.find(field => field.name === 'isActaive')
    const classField = dataFrame.fields.find(field => field.name === 'class')
    const labelField = dataFrame.fields.find(field => field.name === 'label')
    const textField = dataFrame.fields.find(field => field.name === 'text')
    const standardValueField = dataFrame.fields.find(field => field.name === 'standardValue')
    const equipmentField = dataFrame.fields.find(field => field.name === 'equipment')
    const equipmentClassField = dataFrame.fields.find(field => field.name === 'equipmentClass')

    let reasons: Reason[] = [];

    for (let i = 0; i < dataFrame.length; i++) {
      reasons.push({
        id: idField?.values.get(i),
        isActive: isActiveField?.values.get(i),
        class: classField?.values.get(i),
        label: labelField?.values.get(i),
        text: textField?.values.get(i),
        standardValue: standardValueField?.values.get(i),
        equipment: equipmentField?.values.get(i),
        equipmentClass: equipmentClassField?.values.get(i),
      })
    }

    return reasons;
  }

  transform = (data: PanelData): {events: MachineEvent[], reasons: Reason[]} => {
    const eventSerie: DataFrame | undefined = data.series.find((serie) => {
      for (let i = 0; i < MACHINE_EVENT_COLUMNS.length; i++) {
        const index = serie.fields.findIndex((field) => {return field.name === MACHINE_EVENT_COLUMNS[i]});
        if (index < 0) {
          return false
        }
      }
      return true
    })

    const reasonSerie: DataFrame | undefined = data.series.find((serie) => {
      for (let i = 0; i < MACHINE_EVENT_COLUMNS.length; i++) {
        const index = serie.fields.findIndex((field) => {return field.name === REASON_COLUMNS[i]});
        if (index < 0) {
          return false
        }
      }
      return true
    })

    return {
      events: this.transformEvents(eventSerie),
      reasons: this.transformReasons(reasonSerie)
    }
  }

  onRowClick = (e: any, row: MachineEvent) => {
    const { reasons } = this.transform(this.props.data);

    if (reasons && reasons.length > 0) {
      this.setState({
        machineEvent: row
      })
    }
  }

  setReason = (event: MachineEvent, reason: Reason) => {
    const eventsRequest = this.props.data.request?.targets.find((target) => {
      return target.refId === this.props.options.eventMetric;
    })

    if (eventsRequest) {
      getDataSourceSrv().get(eventsRequest.datasource)
        .then((ds) => {
          try {
            //@ts-ignore
            ds.request(`
            mutation
              {
                updateEventLog(input:{filter:{id:["${event.id}"]}, set: {comments:"Updated via Grafana", reasonText: "${reason.text}"}}){
                  eventLog{
                    id
                    comments
                    equipment{
                      name
                    }
                    reasonText
                    reasonCategoryCode
                    reasonValue
                  }
                  numUids
                }
              }
            `)
              .then((payload: Response) => {
                if (payload?.status == 200) {
                  this.dashboardAlert(alertSuccess, `Event Updated`)
                  this.refreshDashboard()
                  this.dismissModal();
                }
              })
          } catch (error: any) {
            this.dashboardAlert(alertError, `Failed to Update: ${error}`)
          }
        })
        .catch((err: Error) => {
          this.dashboardAlert(alertError, `Failed to find Event Metric '${this.props.options.eventMetric}': ${err}`)
        })
    } else {
      this.dashboardAlert(alertError, `Failed to find Event Metric '${this.props.options.eventMetric}'`)
    }
  }

  dashboardAlert = (type: any, msg: string ) => {
    SystemJS.load('app/core/app_events')
      .then((events: any) => {
        events.emit(type, [msg]);
      })
  }

  refreshDashboard = () => {
    //
    // TODO: This is such a hack and needs to be replaced with something better
    // Source: https://community.grafana.com/t/refresh-the-dashboard-from-the-react-panel-plugin/31255/7
    //
    const refreshPicker = document.getElementsByClassName('refresh-picker');
    if (refreshPicker.length > 0) {
      const btnGroup = refreshPicker[0].getElementsByClassName('button-group');
      if (btnGroup.length > 0){ 
        const buttons = btnGroup[0].getElementsByClassName('toolbar-button')
        if (buttons.length > 0){ 
          const button = buttons[0];
          // @ts-ignore
          button.click()
        }
      }
    }
  }

  dismissModal = () => {
    this.setState({machineEvent: null})
  }

  render() {
    const { width } = this.props;
    const { machineEvent } = this.state;

    const { events, reasons } = this.transform(this.props.data);
    
    const count = events?.length;
    const reasonCount = reasons?.length;

    if (!count || !reasonCount) {
      return <div>No data</div>;
    }

    return <>
      {
        machineEvent
          ? <Modal isOpen={!!machineEvent} title={"Reason"} onDismiss={this.dismissModal} onClickBackdrop={this.dismissModal}>
            <p>Select the Reason for this event.</p>
            <HorizontalGroup spacing="lg">
              {reasons.length > 0 &&
                reasons.map((reason) => {
                  return (<Button key={reason.id} size={"md"} onClick={() => {this.setReason(machineEvent, reason)}}>{reason.text}</Button>)
                })}
            </HorizontalGroup>
          </Modal>
          : <></>
      }
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
          { events.length > 0 &&
          events.map((event) => {
            return (
              <tr onClick={(e) => {return this.onRowClick(e, event)}} key={event.id}>
                <td>{event.startDateTime}</td>
                <td>{event.endDateTime}</td>
                <td>{event.duration}</td>
                <td>{event.timeType}</td>
                <td>{event.reason}</td>
                <td>{event.comment}</td>
              </tr>
            )
          })
          }
        </tbody>
      </table>
    </>
  }
}
