import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import PageLayout from "./PageLayout";
import salesbadge from "../assets/sales/salesbadge.png";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import ActionButton from "@/Components/ActionButtonComponent/ActionButton";
import { DropDown } from "@/Components/DropDownComponent/DropDown";

import circleAction from "../assets/settings/addCircle.svg";
import gradientsales from "../assets/sales/gradientsales.svg";
import Green from "../assets/sales/Green.png";
import Red from "../assets/sales/Red.png";
import { SideMenu } from "@/Components/SideMenuComponent/SideMenu";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import CreateNewSale from "@/Components/Sales/CreateNewSale";
import { useGetRequest, useApiCall } from "@/utils/useApiCall";
import { observer } from "mobx-react-lite";
import { SaleStore } from "@/stores/SaleStore";
import BatchUploadSales from "@/Components/Sales/BatchUploadSales";
import ExportSalesModal from "@/Components/Sales/ExportSalesModal";

const SalesTable = lazy(() => import("@/Components/Sales/SalesTable"));

const Sales = observer(() => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { apiCall } = useApiCall();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(20);
  const [tableQueryParams, setTableQueryParams] = useState<Record<
    string,
    any
  > | null>({});

  const [isBatchOpen, setIsBatchOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  const queryString = Object.entries(tableQueryParams || {})
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const {
    data: salesData,
    isLoading: salesLoading,
    mutate: allSalesRefresh,
    error: allSalesError,
    errorStates: allSalesErrorStates,
  } = useGetRequest(
    `/v1/sales?page=${currentPage}&limit=${entriesPerPage}${
      queryString && `&${queryString}`
    }`,
    true,
    60000
  );

  const paginationInfo = () => {
    const total = salesData?.total;
    return {
      total,
      currentPage,
      entriesPerPage,
      setCurrentPage,
      setEntriesPerPage,
    };
  };

  useEffect(() => {
    setTableQueryParams({});
    switch (location.pathname) {
      case "/sales/all":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
        }));
        break;
      default:
        setTableQueryParams((prevParams) => ({
          ...prevParams,
        }));
    }
  }, [location.pathname]);

  useEffect(() => {
    SaleStore.purgeStore();
  }, []);

  const navigationList = [
    {
      title: "All Sales",
      link: "/sales/all",
      count: salesData?.total || 0,
    },
    {
      title: "New Sales",
      link: "/sales/new",
      count: salesData?.total || 0,
    },
    {
      title: "In Contract",
      link: "/sales/in contract",
      count: salesData?.total || 0,
    },
    {
      title: "In Payment",
      link: "/sales/in payment",
      count: salesData?.total || 0,
    },
    {
      title: "In Installment",
      link: "/sales/in installment",
      // count: salesData?.total || 0,
      count: 0,
    },
    {
      title: "Closed",
      link: "/sales/closed",
      // count: salesData?.total || 0,
      count: 0,
    },
  ];

  const dropDownList = {
    items: ["Batch Upload Sales", "Export Data"],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          setIsBatchOpen(true);
          break;
        case 1:
          setIsExportOpen(true);
          break;
        default:
          break;
      }
    },
    showCustomButton: true,
  };

  const salesPaths = ["all"];

  const tx_ref_param = searchParams.get("tx_ref")?.toString();
  const transaction_id = searchParams.get("transaction_id")?.toString();

  const verifyPayment = useCallback(async () => {
    try {
      apiCall({
        endpoint: `/v1/payment/verify/callback?txref=${tx_ref_param}&transactionid=${transaction_id}`,
        method: "get",
        params: {
          txref: tx_ref_param,
          transactionid: transaction_id,
        },
        showToast: false,
      });
      console.log("VERIFIED SUCCESSFULLY");
    } catch (error) {
      console.error("Failed to verify payment:", error);
    }
  }, [apiCall, transaction_id, tx_ref_param]);

  useEffect(() => {
    if (tx_ref_param && transaction_id) verifyPayment();
  }, [tx_ref_param, transaction_id, verifyPayment]);

  return (
    <>
      <PageLayout pageName="Sales" badge={salesbadge}>
        <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
          <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
            <TitlePill
              icon={gradientsales}
              iconBgColor="bg-[#FDEEC2]"
              topText="All"
              bottomText="SALES"
              value={salesData?.total}
            />
            <TitlePill
              icon={Red}
              iconBgColor="bg-[#FDEEC2]"
              topText="ACTIVE"
              bottomText="SALES"
              value={salesData?.total}
            />
            <TitlePill
              icon={Green}
              iconBgColor="bg-[#FDEEC2]"
              topText="CANCELLED"
              bottomText="SALES"
              // value={salesData?.total}
              value={0}
            />
          </div>
          <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end">
            <ActionButton
              label="New Sales"
              icon={<img src={circleAction} />}
              onClick={() => {
                setIsOpen(true);
              }}
            />
            <DropDown {...dropDownList} />
          </div>
        </section>
        <div className="flex flex-col w-full px-2 py-8 gap-4 lg:flex-row md:p-8">
          <SideMenu navigationList={navigationList} />
          <section className="relative items-start justify-center flex min-h-[415px] w-full overflow-hidden">
            <Suspense
              fallback={
                <LoadingSpinner parentClass="absolute top-[50%] w-full" />
              }
            >
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/sales/all" replace />}
                />
                {salesPaths.map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <SalesTable
                        salesData={salesData}
                        isLoading={salesLoading}
                        refreshTable={allSalesRefresh}
                        error={allSalesError}
                        errorData={allSalesErrorStates}
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
      <CreateNewSale
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        allSalesRefresh={allSalesRefresh}
      />

      <BatchUploadSales
        isOpen={isBatchOpen}
        setIsOpen={setIsBatchOpen}
        allSalesRefresh={allSalesRefresh}
      />

      <ExportSalesModal isOpen={isExportOpen} setIsOpen={setIsExportOpen} />
    </>
  );
});

export default Sales;
