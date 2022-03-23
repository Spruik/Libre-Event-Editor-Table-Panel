import React, { ReactElement, useState } from 'react';
import { HorizontalGroup, Slider } from '@grafana/ui';
import { dateTimeAsMoment } from '@grafana/data';

interface Props {
  startDateTime: Date;
  endDateTime: Date;
  onAfterChange: (selectedDate: Date) => void;
}

export default function DateTimeSlider({ startDateTime, endDateTime, onAfterChange }: Props): ReactElement {
  const [chosenDateTime, setChosenDateTime] = useState<Date>(startDateTime);

  const startUnix = startDateTime.valueOf();
  const endUnix = endDateTime.valueOf();

  const numberOfFiveMinSegments = Math.floor((endUnix - startUnix) / (1000 * 60 * 1));

  return (
    <div>
      <h3> Split Event by Time </h3>
      <div>
        Selected Time: <b>{chosenDateTime && chosenDateTime.toLocaleString()}</b>{' '}
      </div>
      <div>
        <Slider
          step={true ? 1 : undefined}
          value={0}
          min={0}
          max={numberOfFiveMinSegments}
          tooltipAlwaysVisible={true}
          //@ts-ignore
          onChange={(value: number) => {
            setChosenDateTime(
              dateTimeAsMoment(startDateTime)
                .add(value, 'minute')
                .toDate()
            );
          }}
          onAfterChange={(value?: number | undefined) => {
            onAfterChange(chosenDateTime);
          }}
        />
        <div>
          <h5 style={{ textAlign: 'right' }}>Minutes</h5>
        </div>
      </div>
      <HorizontalGroup>
        <div>
          {' '}
          Start Time: <b>{startDateTime.toLocaleString()}</b>{' '}
        </div>
        <div>
          {' '}
          End Time: <b>{endDateTime.toLocaleString()}</b>
        </div>
      </HorizontalGroup>
    </div>
  );
}
