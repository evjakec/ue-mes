import { useLoaderData } from "react-router-dom";
import { PartEntity } from "../../../models/part-entity";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import ButtonAction from "../../../ui/components/ButtonAction";
import CommonStyledText from "../../../ui/components/CommonStyledText";

const columnHelper = createColumnHelper<PartEntity>();

const columnsDefault = [
  columnHelper.accessor("partNumber", {
    cell: (info) => info.getValue(),
    header: "Part Number",
  }),
  columnHelper.accessor("partRevision", {
    cell: (info) => info.getValue(),
    header: "Revision",
  }),
  columnHelper.accessor("partType", {
    cell: (info) => flexRender(<CommonStyledText text={info.getValue()} />, {id: info.getValue()}),
    header: "Part Type",
  }),
  columnHelper.accessor("description", {
    cell: (info) => info.getValue(),
    header: "Description",
  }),
  columnHelper.accessor("isActive", {
    cell: (row) => {
      return (
        <input
          type="checkbox"
          defaultChecked={row.getValue()}
          disabled={true}
        />
      );
    },
    header: "Active",
  }),
  columnHelper.accessor<(row: PartEntity) => string, string>(
    (row) => row.unitOfMeasure.name + ' (' + row.unitOfMeasure.shortName + ')',
    {
      id: "unitOfMeasure",
      cell: (info) => info.getValue(),
      header: () => <span>Unit of Measure</span>,
    }
  ),
  columnHelper.accessor("partId",{
    id: 'actions',
    header: '',
    cell: (info) => flexRender(<ButtonAction url={"/inventory/part/edit-part/" + info.getValue()}  buttonAction="Edit" />, {id: info.getValue()})
  }),
];

const PartList: React.FC = () => {
  const partList = useLoaderData() as PartEntity[];

  const table = useReactTable({
    data: partList,
    columns: columnsDefault,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <table
        {...{
          style: {
            width:"75vw",
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
    </div>
  );
};

export default PartList;
