import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

function DataTable({ data, columns, isLoading }) {
  const tableOptions = {
    columns: columns,
    data: data || [],
    enableRowSelection: false,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    isLoading: isLoading,
  };
  const table = useMaterialReactTable(tableOptions);
  return <MaterialReactTable table={table} />;
}

export default DataTable;
