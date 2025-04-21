import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { MRT_Localization_ES } from "material-react-table/locales/es";

function DataTable({
  data,
  columns,
  isLoading,
  topToolbar = true,
  bottomToolbar = true,
}) {
  const tableOptions = {
    columns: columns,
    data: data || [],
    enableRowSelection: false,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    isLoading: isLoading,
    localization: MRT_Localization_ES,
    enableTopToolbar: topToolbar,
    enableBottomToolbar: bottomToolbar,
  };
  const table = useMaterialReactTable(tableOptions);
  return <MaterialReactTable table={table} />;
}

export default DataTable;
