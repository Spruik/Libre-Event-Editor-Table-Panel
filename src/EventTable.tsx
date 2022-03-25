import { dateTimeAsMoment, GrafanaTheme } from "@grafana/data";
import { formatSecsAsDaysHrsMinsSecs } from "LibreEventEditorTablePanel";
import React, { ReactElement } from "react";
import { useTable } from "react-table";
import styled from "styled-components";
import { MachineEvent } from "types";

interface TableRecord {
  start: string;
  end: string | 0 | undefined;
  duration: string;
  timeCategory: string;
  reason: string | undefined;
  comment: string | undefined;
  packmlstate: string;
  rowData: MachineEvent;
}

interface TableProps {
  columns: Array<{ Header: string; accessor: string }>;
  data: TableRecord[];
  onRowClick: (row: React.SetStateAction<MachineEvent | null>) => void;
}

function Table({ columns, data, onRowClick }: TableProps) {
  // Use the state and functions returned from useTable to build your UI
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data,
    });

  // Render the UI for your table
  return (
    <table className="fixed_header" {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup, index) => (
          <tr
            key={index + ""}
            className="header_row"
            {...headerGroup.getHeaderGroupProps()}
          >
            {headerGroup.headers.map((column, index) => (
              <th key={index + ""} {...column.getHeaderProps()}>
                {column.render("Header")}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, index) => {
          prepareRow(row);
          return (
            <tr
              key={index + ""}
              {...row.getRowProps()}
              onClick={() => {
                onRowClick(row.original.rowData);
              }}
            >
              {row.cells.map((cell, index) => {
                return (
                  <td key={index.toString()} {...cell.getCellProps()}>
                    {cell.render("Cell")}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

interface StyledTableProps {
  events: MachineEvent[];
  setModalData: (row: React.SetStateAction<MachineEvent | null>) => void;
  theme: GrafanaTheme | any;
  options: { height: number; width: number };
}

export default function StyledTable({
  events,
  setModalData,
  theme,
  options,
}: StyledTableProps): ReactElement {
  const Style = styled.div`
    .fixed_header {
      table-layout: fixed;
      width: 100%;
    }

    .fixed_header tbody {
      display: block;
      width: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      height: ${options.height - 35}px;
    }

    .header_row {
      display: flex;
      background: ${theme.type === "dark"
        ? "rgb(34, 37, 43)"
        : "rgb(244, 245, 245)"};
      color: #33a2e5;
      width: 100%;
    }

    .fixed_header th,
    .fixed_header td {
      width: ${options.width / 7}px;
      text-align: left;
      padding: 6px;
      border-right: ${theme.type === "dark"
        ? "1px solid rgba(204, 204, 220, 0.07)"
        : "1px solid rgba(36, 41, 46, 0.12)"};
    }

    .fixed_header th:last-child,
    .fixed_header td:last-child {
      border-right: none;
    }

    .fixed_header td:last-child {
      width: ${options.width / 7 - 7}px;
    }

    .fixed_header tr {
      border-bottom: ${theme.type === "dark"
        ? "1px solid rgba(204, 204, 220, 0.07)"
        : "1px solid rgba(36, 41, 46, 0.12)"};
    }

    tr {
      :not(.header_row):hover {
        background-color: ${theme.palette.gray95};
        color: ${theme.palette.black};
        cursor: pointer;
        height: 1.2em; /* more precisely it should be (2.4x2.4)/2.8  */
        border-color: ${theme.palette.gray95};
        box-shadow: 0 0 10px ${theme.palette.gray95};
      }
    }
  `;
  const columns = React.useMemo(
    () => [
      {
        Header: "Start",
        accessor: "start",
      },
      {
        Header: "End",
        accessor: "end",
      },
      {
        Header: "Duration",
        accessor: "duration",
      },
      {
        Header: "PackML State",
        accessor: "packmlstate",
      },
      {
        Header: "Time Category",
        accessor: "timeCategory",
      },
      {
        Header: "Reason",
        accessor: "reason",
      },
      {
        Header: "Comment",
        accessor: "comment",
      },
    ],
    []
  );

  const makeData = (events: MachineEvent[]) => {
    return events.map((event: MachineEvent) => {
      return {
        start: dateTimeAsMoment(event.startDateTime).format(
          "YYYY-MM-DD[, ]HH:mm:ss"
        ),
        end:
          event.endDateTime &&
          dateTimeAsMoment(event.endDateTime).format("YYYY-MM-DD[, ]HH:mm:ss"),
        duration: formatSecsAsDaysHrsMinsSecs(event.duration),
        timeCategory: event.timeType,
        reason: event.reason,
        comment: event.comment,
        packmlstate: event.packMLStatus,
        rowData: event,
      };
    });
  };

  const data = React.useMemo(() => makeData(events), [events]);

  return (
    <Style>
      <Table columns={columns} data={data} onRowClick={setModalData} />
    </Style>
  );
}
