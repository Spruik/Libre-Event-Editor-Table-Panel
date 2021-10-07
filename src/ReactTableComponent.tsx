import { dateTimeAsMoment } from "@grafana/data"
import { formatSecsAsDaysHrsMinsSecs } from "LibreEventEditorTablePanel"
import React from "react"
import { useTable } from "react-table"
import styled from 'styled-components'
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
        
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
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

 
  function Example( events: MachineEvent[], modalPop, theme) {
    const Styles = styled.div`
    padding: 1rem;
   
    table {
      
      border-spacing: 0;
      height: 200px;

      tbody{
          overflowY: scroll;
          height: 50%;
      }
  
      tr {
        :last-child {
          td {
            border-bottom: 0;
          }
        }
        :hover{
          background-color: ${theme.palette.gray95};
          color: ${theme.palette.black};
          }
      }
  
      th,
      td {
        margin: 0;
        padding: 0.5rem;
  
        :last-child {
          border-right: 0;
        }
  
  
      }
    }
  
    .pagination {
      padding: 0.5rem;
    }
  `
    const columns = React.useMemo(
      () => [
        {
          Header: 'Header',
          columns: [
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
                    comment: event.comment,
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
  