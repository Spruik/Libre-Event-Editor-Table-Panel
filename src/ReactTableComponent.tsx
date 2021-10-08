import { dateTimeAsMoment } from "@grafana/data"
import { formatSecsAsDaysHrsMinsSecs } from "LibreEventEditorTablePanel"
import React from "react"
import { useTable } from "react-table"
import styled from 'styled-components'
import TableScrollbar from 'react-table-scrollbar'
import { MachineEvent } from "types"


function Table({ columns, data, onRowClick }) {
    // Use the state and functions returned from useTable to build your UI
    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
    } = useTable({
      columns,
      data,
    })
  
    // Render the UI for your table
    return (
      <table className="fixed_header" {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr className="header_row" {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()} onClick={() => {onRowClick(row.original.entireRow)}}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

 
  function Example( events: MachineEvent[], modalPop, theme, options) {
    const Styles = styled.div`

    table{
      width:100%

    }

    padding-left: 5px;
    
    .fixed_header{
      table-layout: fixed;
  }
  
  .fixed_header tbody{
    display:block;
    width: 100%;
    overflow: auto;
    height: ${options.height-21}px;
  }
  
  .fixed_header thead tr {
     display: block;
  }
  
  
  .fixed_header th, .fixed_header td {
    text-align: left;
    width: 300px;
  }

    tr {
      :not(.header_row):hover{
        background-color: ${theme.palette.gray95};
        color: ${theme.palette.black};
        cursor: pointer;
        height: 1.2em; /* more precisely it should be (2.4x2.4)/2.8  */
        border-color: ${theme.palette.gray95};
        box-shadow: 0 0 10px ${theme.palette.gray95};
      }
    }
  }
  `
    const columns = React.useMemo(
      () => [
        
            {
              Header: 'Start',
              accessor: 'start',
            },
            {
              Header: 'End',
              accessor: 'end',
            },
            {
              Header: 'Duration',
              accessor: 'duration',
            },
            {
              Header: 'Time Category',
              accessor: 'timeCategory',
            },
            {
              Header: 'Reason',
              accessor: 'reason',
            },
            {
              Header: 'Comment',
              accessor: 'comment',
            },
          ],
      []
    )

    const makeData = (events: MachineEvent[]) =>{

        return events.map((event:MachineEvent) =>{
            return (
                {
                    start: dateTimeAsMoment(event.startDateTime).format('YYYY-MM-DD[, ]HH:mm:ss'),
                    end: event.endDateTime && dateTimeAsMoment(event.endDateTime).format('YYYY-MM-DD[, ]HH:mm:ss'),
                    duration: formatSecsAsDaysHrsMinsSecs(event.duration),
                    timeCategory: event.timeType,
                    reason: event.reason,
                    comment: "This is a comment. There will be others.Beware",
                    entireRow: event
                }
            )
        })
    }

    
  
    const data = React.useMemo(() => makeData(events), [])
  
    return (
      <Styles>
        <Table columns={columns} data={data} onRowClick={modalPop}/>
      </Styles>

    )
  }
  
  export default Example
  