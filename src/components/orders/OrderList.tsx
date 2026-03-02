import { useLoaderData } from "react-router-dom"
import {OrderEntity} from "../../models/order-entity";
import { ExpandedState, createColumnHelper, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import OrderItemList from "./OrderItemList";
import React, { useState } from "react";

const columnHelper = createColumnHelper<OrderEntity>();
const renderRowSubComponent = 
    (order:OrderEntity) => {
      return (<OrderItemList orderItems={order.orderItems} />)
    }

const columnsDefault = [
    columnHelper.accessor('number', {
      id:"orderNumber",
      cell: info => info.getValue(),
      header: "Order Number",
    }),
    columnHelper.accessor<(row: OrderEntity) => string, string>(row => row.orderItems.length.toString(), {
      id: 'partNumber',
      cell: info => info.getValue(),
      header: () => <span>Part Count</span>
    }),
    columnHelper.accessor<'orderState',string>('orderState', {
        id:"orderState",
        cell: info => info.getValue(),
        header: () => <span>Order State</span>,
    }),
    columnHelper.accessor<(row: OrderEntity) => string, string>(row => row.customer.name, {
        id: 'customer',
        cell: info => info.getValue(),
        header: () => <span>Customer</span>,
    }),
    columnHelper.accessor<'totalQuantity',number>('totalQuantity', {
      id:"totalQuantity",
      cell: info => info.renderValue(),
      header: () => <span>Total Quantity</span>
    })
  ];

const OrderList:React.FC = () => {
    const orderList = useLoaderData() as OrderEntity[];
    const [expanded, setExpanded] = useState<ExpandedState>({})

    const table = useReactTable({ data:orderList,
        columns:columnsDefault,
        getCoreRowModel: getCoreRowModel(),
        state:{
          expanded
        },
        onExpandedChange: setExpanded,
        getExpandedRowModel: getExpandedRowModel(),
      })
      
    return (
    <div>
    <table {...{
            style: {
              width:'90%' // table.getCenterTotalSize(),
            },
          }}>
      <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <React.Fragment key={row.id}>
          <tr key={row.id} onClick={() => {row.toggleExpanded();}}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
          {row.getIsExpanded() ? (
            <tr className="subRow">
              <td colSpan={5} className="subCell">
                {renderRowSubComponent(row.original)}
              </td>
            </tr>
          ) : null}
          </React.Fragment>
        ))}
      </tbody>
    </table>
    </div>
    )
}

export default OrderList;