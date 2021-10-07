import { Button, HorizontalGroup, Modal, TextArea, VerticalGroup } from '@grafana/ui';
import DateTimeSlider from 'DateTimeSlider';
import React, { ReactElement, useState } from 'react';
import { ReasonSelector } from 'ReasonSelector';
import { Equipment, MachineEvent, Reason } from './types';
interface Props {
  machineEvent: MachineEvent;
  equipment: Equipment;
  title: string;
  reasons: Reason[];
  dismissModal: () => void;
  onAssignReason: (equipment: Equipment, event: MachineEvent, reason: Reason) => void;
  onSplitEvent: (equipment: Equipment, event: MachineEvent, newDateTime: Date) => void;
  onEditComment: (equipment: Equipment, event: MachineEvent, comment: string) => void;
}

export default function ReasonPanel({
  machineEvent,
  equipment,
  title,
  reasons,
  dismissModal,
  onAssignReason,
  onSplitEvent,
  onEditComment,
}: Props): ReactElement {
  const [finalReason, setFinalReason] = useState<Reason | undefined>(undefined);
  const [finalDateTime, setFinalDateTime] = useState<Date | undefined>(undefined);
  const [finalComment, setFinalComment] = useState<string>(machineEvent.comment ? machineEvent.comment : '');

  const machineEventEndTime = machineEvent?.endDateTime ? new Date(machineEvent.endDateTime) : new Date();
  const machineEventStartTime = new Date(machineEvent.startDateTime);

  return (
    <Modal isOpen={!!machineEvent} title={title} onDismiss={dismissModal} onClickBackdrop={dismissModal}>
      <div>
        <div>
          <h3> Edit Event Comment </h3>
          <div>
            <TextArea
              css={{}}
              invalid={false}
              placeholder={'Type your comment here'}
              disabled={false}
              value={finalComment}
              //@ts-ignore
              onChange={value => setFinalComment(value.target.value)}
            />
          </div>
          <div>
            <Button onClick={() => onEditComment(equipment, machineEvent, finalComment)}>Edit Comment</Button>
          </div>
        </div>
        <hr />
        <div>
          <VerticalGroup>
            <h3> Assign Reason to Event </h3>
            <div>
              <ReasonSelector
                reasons={reasons}
                onFinalReasonSelection={reason => {
                  console.log(finalReason);
                  setFinalReason(reason);
                }}
              ></ReasonSelector>
            </div>
            <div>
              {finalReason && (
                <HorizontalGroup>
                  <Button
                    size="md"
                    onClick={() => {
                      onAssignReason(equipment, machineEvent, finalReason);
                    }}
                  >
                    Assign Reason
                  </Button>
                </HorizontalGroup>
              )}
            </div>
          </VerticalGroup>
        </div>
        <hr />
        <div>
          <DateTimeSlider
            startDateTime={new Date(machineEventStartTime)}
            endDateTime={machineEventEndTime}
            onAfterChange={setFinalDateTime}
          ></DateTimeSlider>
          <div>
            <div>
              {finalDateTime && (
                <Button
                  onClick={() => {
                    onSplitEvent(equipment, machineEvent, finalDateTime);
                  }}
                >
                  {' '}
                  Split Event{' '}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
