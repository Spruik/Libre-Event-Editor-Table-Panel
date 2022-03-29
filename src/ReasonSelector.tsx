import { Button, HorizontalGroup, VerticalGroup } from "@grafana/ui";
import React, { useState } from "react";
import { Reason } from "./types";

interface Props {
  reasons: Reason[];
  onFinalReasonSelection: (finalReason: Reason | undefined) => void;
  parentReason?: Reason;
}

const filterReasons = (reasons: Reason[], parentReason: Reason | undefined) => {
  if (parentReason === undefined) {
    return reasons.filter((value, index, array) => {
      return value.parent === null;
    });
  }

  return reasons.filter((value, index, array) => {
    return value.parent === parentReason.id;
  });
};

export const ReasonSelector = ({
  reasons,
  onFinalReasonSelection,
  parentReason,
}: Props) => {
  const shownReasons = filterReasons(reasons, parentReason);
  const [selectedReason, setSelectedReason] = useState<Reason | undefined>();

  if (shownReasons.length < 1) {
    onFinalReasonSelection(parentReason);
    return null;
  } else {
    onFinalReasonSelection(undefined);
  }

  return (
    <VerticalGroup>
      <div>
        <HorizontalGroup spacing="lg">
          {reasons.length > 0 &&
            shownReasons.map((reason) => {
              return (
                <Button
                  key={reason.id}
                  variant={
                    reason.id !== selectedReason?.id ? "primary" : "destructive"
                  }
                  size={"sm"}
                  onClick={() => {
                    if (reason === selectedReason) {
                      setSelectedReason(undefined);
                      onFinalReasonSelection(undefined);
                    } else {
                      setSelectedReason(reason);
                    }
                  }}
                >
                  {reason.text}
                </Button>
              );
            })}
        </HorizontalGroup>
      </div>
      <div>
        {selectedReason && (
          <ReasonSelector
            reasons={reasons}
            parentReason={selectedReason}
            onFinalReasonSelection={onFinalReasonSelection}
          ></ReasonSelector>
        )}
      </div>
    </VerticalGroup>
  );
};
