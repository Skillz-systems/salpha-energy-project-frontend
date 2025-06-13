import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import inventorygradient from "../assets/inventory/inventorygradient.svg";
import cancelled from "../assets/cancelled.svg";
import circleAction from "../assets/settings/addCircle.svg";
import ActionButton from "@/Components/ActionButtonComponent/ActionButton";
import { DropDown } from "@/Components/DropDownComponent/DropDown";
import { SideMenu } from "@/Components/SideMenuComponent/SideMenu";
import CreateNewInventory, {
  InventoryFormType,
} from "@/Components/Inventory/CreateNewInventory";
import { useGetRequest } from "@/utils/useApiCall";
import ReturnToWarehouseButton from "@/Components/ReturnToWarehouseButton";
import inventorybadge from "../assets/inventory/inventorybadge.png";
const InventoryTable = lazy(
  () => import("@/Components/Inventory/InventoryTable")
);

type InventoryClass = "REGULAR" | "RETURNED" | "REFURBISHED";

const Inventory = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [formType, setFormType] = useState<InventoryFormType>("newInventory");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(20);
  const [tableQueryParams, setTableQueryParams] = useState<Record<
    string,
    any
  > | null>({});

  // Extract warehouseId from URL parameters
  const warehouseId = searchParams.get("warehouseId");

  const queryString = Object.entries(tableQueryParams || {})
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  // Add warehouseId to the inventory API call if it exists
  const inventoryEndpoint = `/v1/inventory?page=${currentPage}&limit=${entriesPerPage}${
    warehouseId ? `&warehouseId=${warehouseId}` : ""
  }${queryString && `&${queryString}`}`;

  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    mutate: allInventoryRefresh,
    errorStates: allInventoryErrorStates,
  } = useGetRequest(inventoryEndpoint, true, 60000);

  // Fetch warehouse details if warehouseId is provided
  const warehouseEndpoint = warehouseId ? `/v1/warehouses/${warehouseId}` : "";
  const {
    data: warehouseData,
    isLoading: warehouseLoading,
  } = useGetRequest(
    warehouseEndpoint,
    !!warehouseId,
    60000
  );

  // Add warehouseId to stats endpoint if it exists
  const statsEndpoint = warehouseId 
    ? `/v1/inventory/stats?warehouseId=${warehouseId}` 
    : "/v1/inventory/stats";

  const fetchInventoryStats = useGetRequest(statsEndpoint, true);

  const paginationInfo = () => {
    const total = inventoryData?.total;
    return {
      total,
      currentPage,
      entriesPerPage,
      setCurrentPage,
      setEntriesPerPage,
    };
  };

  function getFilteredClassCount(classList: InventoryClass) {
    const filteredClass =
      fetchInventoryStats?.data?.inventoryClassCounts?.find(
        (item: { inventoryClass: string }) => item.inventoryClass === classList
      )?.count || 0;
    return filteredClass;
  }

  // Get warehouse name for display
  const getWarehouseName = () => {
    if (!warehouseId) return null;
    
    // Use warehouse data from API
    if (warehouseData?.data?.name) {
      return warehouseData.data.name;
    }
    
    // If no data yet, return null (will show loading or no badge)
    return null;
  };

  const warehouseName = getWarehouseName();

  const navigationList = [
    {
      title: "All Inventory",
      link: warehouseId ? `/inventory/all?warehouseId=${warehouseId}` : "/inventory/all",
      count: fetchInventoryStats?.data?.totalInventoryCount || 0,
    },
    {
      title: "Regular",
      link: warehouseId ? `/inventory/regular?warehouseId=${warehouseId}` : "/inventory/regular",
      count: getFilteredClassCount("REGULAR"),
    },
    {
      title: "Returned",
      link: warehouseId ? `/inventory/returned?warehouseId=${warehouseId}` : "/inventory/returned",
      count: getFilteredClassCount("RETURNED"),
    },
    {
      title: "Refurbished",
      link: warehouseId ? `/inventory/refurbished?warehouseId=${warehouseId}` : "/inventory/refurbished",
      count: getFilteredClassCount("REFURBISHED"),
    },
  ];

  useEffect(() => {
    setTableQueryParams({});
    switch (location.pathname) {
      case "/inventory/all":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
        }));
        break;
      case "/inventory/regular":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          class: "REGULAR",
        }));
        break;
      case "/inventory/returned":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          class: "RETURNED",
        }));
        break;
      case "/inventory/refurbished":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          class: "REFURBISHED",
        }));
        break;
      default:
        setTableQueryParams((prevParams) => ({
          ...prevParams,
        }));
    }
  }, [location.pathname]);

  const dropDownList = {
    items: ["Create New Category", "Create New Sub-Category"],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          setFormType("newCategory");
          setIsOpen(true);
          break;
        case 1:
          setFormType("newSubCategory");
          setIsOpen(true);
          break;
        default:
          break;
      }
    },
    showCustomButton: true,
  };

  const inventoryPaths = ["all", "regular", "returned", "refurbished"];

  return (
    <>
      <PageLayout 
        pageName="Inventory" 
        badge={inventorybadge}
        warehouseName={warehouseName || undefined}
      >
        <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
          <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
            <TitlePill
              icon={inventorygradient}
              iconBgColor="bg-[#FDEEC2]"
              topText="All"
              bottomText="INVENTORY"
              value={fetchInventoryStats?.data?.totalInventoryCount || 0}
            />
            <TitlePill
              icon={inventorygradient}
              iconBgColor="bg-[#FDEEC2]"
              topText="Regular"
              bottomText="INVENTORY"
              value={getFilteredClassCount("REGULAR")}
            />
            <TitlePill
              icon={inventorygradient}
              iconBgColor="bg-[#FDEEC2]"
              topText="Returned"
              bottomText="INVENTORY"
              value={getFilteredClassCount("RETURNED")}
            />
            <TitlePill
              icon={cancelled}
              iconBgColor="bg-[#FFDBDE]"
              topText="Refurbished"
              bottomText="INVENTORY"
              value={getFilteredClassCount("REFURBISHED")}
            />
          </div>
          <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end">
            <ActionButton
              label="New Inventory"
              icon={<img src={circleAction} />}
              onClick={() => {
                setFormType("newInventory");
                setIsOpen(true);
              }}
            />
            <DropDown {...dropDownList} />
          </div>
        </section>
        
        <div className="flex flex-col w-full px-2 py-8 gap-4 lg:flex-row md:p-8">
          <div className="flex flex-col gap-4 sm:max-w-[208px]">
            <SideMenu navigationList={navigationList} />
            <ReturnToWarehouseButton />
          </div>
          <section className="relative items-start justify-center flex min-h-[415px] w-full overflow-hidden">
            <Suspense
              fallback={
                <LoadingSpinner parentClass="absolute top-[50%] w-full" />
              }
            >
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/inventory/all" replace />}
                />
                {inventoryPaths.map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <InventoryTable
                        inventoryData={inventoryData}
                        isLoading={inventoryLoading}
                        refreshTable={allInventoryRefresh}
                        errorData={allInventoryErrorStates}
                        paginationInfo={paginationInfo}
                        setTableQueryParams={setTableQueryParams}
                      />
                    }
                  />
                ))}
              </Routes>
            </Suspense>
          </section>
        </div>
      </PageLayout>
      <CreateNewInventory
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        formType={formType}
        allInventoryRefresh={allInventoryRefresh}
      />
    </>
  );
};

export default Inventory;
