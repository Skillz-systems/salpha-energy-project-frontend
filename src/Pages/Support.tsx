import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PageLayout from "./PageLayout";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import ActionButton from "@/Components/ActionButtonComponent/ActionButton";
import circleAction from "../assets/settings/addCircle.svg";
import customerbadge from "../assets/customers/customerbadge.png";
import cancelled from "../assets/cancelled.svg";
import greencustomer from "../assets/customers/greencustomer.svg";
import { DropDown } from "@/Components/DropDownComponent/DropDown";
import { SideMenu } from "@/Components/SideMenuComponent/SideMenu";
import { useGetRequest } from "@/utils/useApiCall";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import CreateNewTicket from "@/Components/Support/CreateNewTicket";

const TicketTable = lazy(() => import("@/Components/Support/TicketTable"));

const Support = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(20);
  const [tableQueryParams, setTableQueryParams] = useState<Record<
    string,
    any
  > | null>({});

  const queryString = Object.entries(tableQueryParams || {})
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const {
    data: ticketData,
    isLoading: ticketLoading,
    mutate: allTicketRefresh,
    error: allTicketError,
    errorStates: allTicketErrorStates,
  } = useGetRequest(
    `/v1/tickets?page=${currentPage}&limit=${entriesPerPage}${queryString && `&${queryString}`
    }`,
    true,
    60000
  );
  const fetchTicketStats = useGetRequest("/v1/tickets/stats", true);

  const paginationInfo = () => {
    const total = ticketData?.total;
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
      case "/tickets/all":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
        }));
        break;
      case "/tickets/active":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          status: "active",
        }));
        break;
      case "/tickets/open":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          status: "open",
        }));
        break;
      default:
        setTableQueryParams((prevParams) => ({
          ...prevParams,
        }));
    }
  }, [location.pathname]);

  const navigationList = [
    {
      title: "All Tickets",
      link: "/tickets/all",
      count: fetchTicketStats?.data?.totalTicketCount || 0,
    },
    {
      title: "Active Tickets",
      link: "/tickets/active",
      count: fetchTicketStats?.data?.activeTicketCount || 0,
    },
    {
      title: "Open Tickets",
      link: "/tickets/open",
      count: fetchTicketStats?.data?.openTicketCount || 0,
    },
  ];

  const dropDownList = {
    items: ["Export List"],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          console.log("Exporting list...");
          break;
        default:
          break;
      }
    },
    showCustomButton: true,
  };

  const ticketPaths = ["all", "active", "open"];

  return (
    <>
      <PageLayout pageName="Support" badge={customerbadge}>
        <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
          <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
            <TitlePill
              icon={greencustomer}
              iconBgColor="bg-[#E3FAD6]"
              topText="All"
              bottomText="TICKETS"
              value={fetchTicketStats?.data?.totalTicketCount || 0}
            />
            <TitlePill
              icon={greencustomer}
              iconBgColor="bg-[#E3FAD6]"
              topText="Active"
              bottomText="TICKETS"
              value={fetchTicketStats?.data?.activeTicketCount || 0}
            />
            <TitlePill
              icon={cancelled}
              iconBgColor="bg-[#FFDBDE]"
              topText="Open"
              bottomText="TICKETS"
              value={fetchTicketStats?.data?.openTicketCount || 0}
            />
          </div>
          <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end">
            <ActionButton
              label="New Ticket"
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
                  element={<Navigate to="/tickets/all" replace />}
                />
                {ticketPaths.map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <TicketTable
                        ticketData={ticketData}
                        isLoading={ticketLoading}
                        refreshTable={allTicketRefresh}
                        error={allTicketError}
                        errorData={allTicketErrorStates}
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
      <CreateNewTicket
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        allTicketRefresh={allTicketRefresh}
      />
    </>
  );
};

export default Support;
