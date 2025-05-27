import { useState, useEffect, useRef } from "react";
import { PaginationType, Table } from "../TableComponent/Table";
import { KeyedMutator } from "swr";
import { ApiErrorStatesType } from "../../utils/useApiCall";
import { ErrorComponent } from "@/Pages/ErrorPage";
import { formatNumberWithCommas } from "@/utils/helpers";
import { DropDown } from "../DropDownComponent/DropDown";
import { useNavigate } from "react-router-dom";
import edit from "../../assets/edit.svg";
import MainWarehouse from "../../assets/warehouse/mainWarehouse.png";
import WarehouseDetailModal from "./WarehouseDetailModal";

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
  console.log("generateWarehouseEntries - input data:", data);
  console.log("generateWarehouseEntries - data.data:", data?.data);
  console.log("generateWarehouseEntries - data.warehouses:", data?.warehouses);
  console.log("generateWarehouseEntries - data.results:", data?.results);
  console.log("generateWarehouseEntries - data.items:", data?.items);
  console.log("generateWarehouseEntries - all keys:", Object.keys(data || {}));
  
  // Try different possible array locations
  let warehouseArray = data?.data || data?.warehouses || data?.results || data?.items || [];
  
  // If still empty but we have a total, the data might be directly in the response
  if (warehouseArray.length === 0 && data?.total > 0) {
    // Check if the data is directly in the response object
    if (Array.isArray(data)) {
      warehouseArray = data;
    } else {
      // Look for any array property in the response
      const arrayKeys = Object.keys(data || {}).filter(key => Array.isArray(data[key]));
      if (arrayKeys.length > 0) {
        warehouseArray = data[arrayKeys[0]];
        console.log(`Found array in key: ${arrayKeys[0]}`, warehouseArray);
      }
    }
  }
  
  console.log("Final warehouseArray:", warehouseArray);
  
  const entries: AllWarehouseEntries[] = warehouseArray.map(
    (warehouse: any) => {
      console.log("Processing warehouse:", warehouse);
      console.log("Warehouse value fields:", {
        totalValue: warehouse?.totalValue,
        value: warehouse?.value,
        inventoryValue: warehouse?.inventoryValue,
        totalInventoryValue: warehouse?.totalInventoryValue,
        worth: warehouse?.worth,
        amount: warehouse?.amount,
        allKeys: Object.keys(warehouse || {})
      });
      
      // Try multiple possible value fields
      const warehouseValue = warehouse?.totalValue || 
                           warehouse?.value || 
                           warehouse?.inventoryValue || 
                           warehouse?.totalInventoryValue || 
                           warehouse?.worth || 
                           warehouse?.amount || 
                           0;
      
      return {
        id: warehouse?.id,
        name: warehouse?.name,
        image: warehouse?.image || MainWarehouse, // Default image if none provided
        inventoryClass: Array.isArray(warehouse?.inventoryClasses) 
          ? warehouse.inventoryClasses.join(", ") 
          : warehouse?.inventoryClasses || warehouse?.category?.name || "General",
        capacity: warehouse?.capacity || 0,
        status: warehouse?.status || "ACTIVE",
        value: warehouseValue,
      };
    }
  );
  
  console.log("generateWarehouseEntries - final entries:", entries);
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

  // Debug logging
  console.log("WarehouseTable - warehouseData:", warehouseData);
  console.log("WarehouseTable - isLoading:", isLoading);
  console.log("WarehouseTable - error:", error);
  console.log("WarehouseTable - errorData:", errorData);

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
    items: ["View warehouse", "View Details", "View Inventory Log", "Deactivate warehouse"],
    onClickLink: (index: number, cardData: any) => {
      switch (index) {
        case 0:
          navigate(`/inventory?warehouseId=${cardData?.id}`);
          break;
        case 1:
          setWarehouseId(cardData?.id);
          setIsOpen(true);
          break;
        case 2:
          console.log("View Inventory Log", cardData?.id);
          break;
        case 3:
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
    return paginationInfo();
  };

  return (
    <>
      {!error ? (
        <div className="w-full">
          <Table
            tableType="card"
            tableTitle="ALL WAREHOUSES"
            tableClassname="flex flex-wrap items-start justify-start gap-8"
            tableData={warehouseData ? getTableData() : []}
            loading={isLoading}
            filterList={filterList}
            cardComponent={(data: any[]) => {
              console.log("Card component - data:", data);
              
              if (!data || data.length === 0) {
                return (
                  <div className="w-full text-center py-8">
                    <p className="text-gray-500">No warehouses found</p>
                  </div>
                );
              }
              
              return data?.map((warehouse: any, index: number) => {
                console.log("Rendering warehouse card:", warehouse);
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
          {warehouseId && (
            <WarehouseDetailModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              warehouseID={warehouseId}
              refreshTable={refreshTable}
            />
          )}
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