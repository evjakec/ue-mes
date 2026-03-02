import {
    SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { InventoryItemEntity } from "../../../models/inventory-item-entity";
import { useState } from "react";
import { BiCaretDownCircle, BiCaretUpCircle } from "react-icons/bi";
import classes from './InventoryList.module.css'

const columnHelper = createColumnHelper<InventoryItemEntity>();

const columnsDefault = [
  columnHelper.accessor<(row: InventoryItemEntity) => string, string>(
    (row) => row.part.partNumber + ' (' + row.part.partRevision + ') - ' + row.part.description,
    {
      id: "part",
      cell: (info) => info.getValue(),
      header: () => <span>Part</span>,
    }
  ),
  columnHelper.accessor("part.unitOfMeasure.name",{
    id: 'unitOfMeasureName',
    cell: (info) => info.getValue(),
    header: () => <span>Unit of Measure</span>,
  }),
  columnHelper.accessor("inventoryItemAttributes",{
    id: 'inventoryItemAttributes',
    cell: (info) => flexRender(<div className={classes.inventoryItemAttributesDiv}>{info.getValue().map(inventoryItemAttribute => {
        return <span key={inventoryItemAttribute.itemAttributeType.itemAttributeTypeId}><b>{inventoryItemAttribute.itemAttributeType.name}: </b>{inventoryItemAttribute.attributeValue} <br/></span>;
      })}</div>, {id: info.getValue()}),
    header: () => <span>Attributes</span>,
  }),
  columnHelper.accessor("inventoryLocation.name",{
    id: 'inventoryLocationName',
    cell: (info) => info.getValue(),
    header: () => <span>Location</span>,
  }),
  columnHelper.accessor("quantity",{
    id: 'quantity',
    cell: (info) => info.getValue(),
    header: () => <span>Quantity</span>,
  }),
];

const InventoryList: React.FC<{inventoryItems:InventoryItemEntity[]}> = (props) => {
  const inventoryItemList = props.inventoryItems;
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: inventoryItemList,
    columns: columnsDefault,
    state: {
        sorting:sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  
  return (
    <div>
        {inventoryItemList !== undefined && inventoryItemList.length > 0 &&
        <table
            {...{
            style: {
                // width: "90rem"
                width: "100%"
                // width: table.getCenterTotalSize(),
            },
            }}
        >
            <thead>
            {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                    {header.isPlaceholder
                        ? null
                        : (
                            <div {...{className: header.column.getCanSort() ? 'cursor-pointer select-none' : '', onClick: header.column.getToggleSortingHandler()}}>
                                {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                                {{
                                  asc: <BiCaretUpCircle className={classes.sortIcon} />,
                                  desc: <BiCaretDownCircle className={classes.sortIcon} />,
                                 }[header.column.getIsSorted() as string] ?? null}
                            </div>
                        )}
                    </th>
                ))}
                </tr>
            ))}
            </thead>
            <tbody>
            {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                ))}
                </tr>
            ))}
            </tbody>
        </table>
        }
        {(inventoryItemList === undefined || inventoryItemList.length === 0) &&
        <div>Sorry, no inventory to be found</div>
        }   
    </div>
  );
};

export default InventoryList;
