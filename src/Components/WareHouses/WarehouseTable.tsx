import { useState, useEffect, useRef } from "react";
import { PaginationType, Table } from "../TableComponent/Table";
import { KeyedMutator } from "swr";
import { ApiErrorStatesType } from "../../utils/useApiCall";
import { ErrorComponent } from "@/Pages/ErrorPage";
import { formatNumberWithCommas } from "@/utils/helpers";
import { DropDown } from "../DropDownComponent/DropDown";
import MainWarehouse from "../../assets/warehouse/MainWarehouse.png";
import LagosWarehouse from "../../assets/warehouse/LagosWarehouse.png";
import AbujaWarehouse from "../../assets/warehouse/AbujaWarehouse.png";
import SokotoWarehouse from "../../assets/warehouse/SokotoWarehouse.png";
import { useNavigate } from "react-router-dom";
import edit from "../../assets/edit.svg";

interface AllWarehouseEntries {
  id: string;
  name: string;
  inventoryClass: string;
  capacity: number;
  status: "ACTIVE" | "INACTIVE";
  image?: string;
  value: number;
}

const generateWarehouseEntries = (data: any): AllWarehouseEntries[] => {
  const entries: AllWarehouseEntries[] = (data?.updatedResults ?? []).map(
    (warehouse: any) => {
      return {
        id: warehouse?.id,
        name: warehouse?.name,
        image: warehouse?.image || `src/assets/warehouse/${warehouse?.name?.toLowerCase().replace(/\s+/g, '')}.png`,
        inventoryClass: warehouse?.category?.name || "",
        capacity: warehouse?.capacity || 0,
        status: warehouse?.status || "ACTIVE",
        value: warehouse?.priceRange?.minimumInventoryBatchPrice || 0,
      };
    }
  );
  return entries;
};

// Custom dropdown menu component
interface WarehouseDropdownProps {
  items: string[];
  onClickLink: (index: number, warehouse: any) => void;
  warehouse: any;
}

const WarehouseDropdown = ({ items, onClickLink, warehouse }: WarehouseDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-10 h-7 p-2 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow hover:bg-gray-100"
      >
        <img src={edit} alt="Options" className="w-[16px] cursor-pointer" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
          {items.map((item: string, index: number) => (
            <button
              key={index}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                onClickLink(index, warehouse);
                setIsOpen(false);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const WarehouseTable = ({
  warehouseData,
  isLoading,
  refreshTable,
  error,
  errorData,
  paginationInfo,
  setTableQueryParams,
}: {
  warehouseData: any;
  isLoading: boolean;
  refreshTable: KeyedMutator<any>;
  error: any;
  errorData: ApiErrorStatesType;
  paginationInfo: PaginationType;
  setTableQueryParams: React.Dispatch<
    React.SetStateAction<Record<string, any> | null>
  >;
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [queryValue, setQueryValue] = useState<string>("");
  const [isSearchQuery, setIsSearchQuery] = useState<boolean>(false);

  const filterList = [
    {
      name: "Search",
      onSearch: async (query: string) => {
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          search: query,
        }));
      },
      isSearch: true,
    },
    {
      onDateClick: (date: string) => {
        setQueryValue(date);
        setIsSearchQuery(false);
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          createdAt: date.split("T")[0],
        }));
      },
      isDate: true,
    },
  ];

  const dropDownList = {
    items: ["View warehouse", "View Inventory Log", "Deactivate warehouse"],
    onClickLink: (index: number, cardData: any) => {
      switch (index) {
        case 0:
          navigate(`/inventory?warehouseId=${cardData?.id}`);
          break;
        case 1:
          console.log("View Inventory Log", cardData?.id);
          break;
        case 2:
          console.log("Deactivate warehouse", cardData?.id);
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  const getTableData = () => {
    return generateWarehouseEntries(warehouseData);
  };

  // Create a pagination function that returns the correct structure
  const getPaginationInfo: PaginationType = () => {
    return {
      total: mockWarehouses.length,
      currentPage: 1,
      entriesPerPage: 10,
      setCurrentPage: () => {},
      setEntriesPerPage: () => {}
    };
  };

  // Mock data for development without API
  const mockWarehouses = [
    {
      id: "1",
      name: "Main Warehouse",
      value: 40000000,
      status: "ACTIVE",
      image: MainWarehouse
    },
    {
      id: "2",
      name: "Lagos Warehouse",
      value: 10000000,
      status: "ACTIVE",
      image: LagosWarehouse
    },
    {
      id: "3",
      name: "Abuja Warehouse",
      value: 5000000,
      status: "ACTIVE",
      image: AbujaWarehouse
    },
    {
      id: "4",
      name: "Sokoto Warehouse",
      value: 2000000, 
      status: "INACTIVE",
      image: SokotoWarehouse
    }
  ];

  return (
    <>
      {!error ? (
        <div className="w-full">
          <Table
            tableType="card"
            tableTitle="ALL WAREHOUSES"
            tableClassname="flex flex-wrap items-start justify-start gap-8"
            tableData={warehouseData ? getTableData() : mockWarehouses}
            loading={isLoading}
            filterList={filterList}
            cardComponent={(data: any[]) => {
              return data?.map((warehouse: any, index: number) => {
                return (
                  <div
                    key={warehouse.id || index}
                    className="relative bg-white rounded-[28px] border-4 border-white shadow-md flex flex-col items-stretch w-full max-w-[440px]"
                    style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.06)" }}
                  >
                    <img
                      src={warehouse.image}
                      alt={warehouse.name}
                      className="w-full aspect-[16/7] object-cover rounded-[20px] mt-2"
                    />
                    <div className="flex items-center justify-between gap-2 px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="px-4 py-1 bg-purpleBlue border border-blue-300 text-dark-700 rounded-full text-base font-medium truncate max-w-[160px]" title={warehouse.name}>
                          {warehouse.name}
                        </span>
                        <span className="flex items-center px-4 py-1 bg-green-100 text-green-700 rounded-full text-base font-medium gap-1">
                          <span className="text-lg">₦</span>
                          {formatNumberWithCommas(warehouse.value)}
                        </span>
                      </div>
                      <WarehouseDropdown 
                        items={dropDownList.items}
                        onClickLink={dropDownList.onClickLink}
                        warehouse={warehouse}
                      />
                    </div>
                  </div>
                );
              });
            }}
            refreshTable={async () => {
              await refreshTable();
            }}
            queryValue={isSearchQuery ? queryValue : ""}
            paginationInfo={getPaginationInfo}
            clearFilters={() => setTableQueryParams({})}
          />
          {/* Uncomment and implement the warehouse modal when ready */}
          {/* {warehouseId && (
            <WarehouseDetailModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              warehouseID={warehouseId}
              refreshTable={refreshTable}
            />
          )} */}
        </div>
      ) : (
        <ErrorComponent
          message="Failed to fetch warehouse list."
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorData}
        />
      )}
    </>
  );
};

export default WarehouseTable;