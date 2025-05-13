import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { Modal } from "@/Components/ModalComponent/Modal";
// import editInput from "../../assets/settings/editInput.svg";
import { DropDown } from "../DropDownComponent/DropDown";
import { useGetRequest } from "@/utils/useApiCall";
import { TicketType } from "./TicketTable";
import TabComponent from "../TabComponent/TabComponent";
// import { Icon } from "../Settings/UserModal";
// import call from "../../assets/settings/call.svg";
// import message from "../../assets/settings/message.svg";
import TicketDetails, { DetailsType } from "./TicketDetails";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";

const TicketModal = ({
  isOpen,
  setIsOpen,
  ticketID,
  refreshTable,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  ticketID: string;
  refreshTable: KeyedMutator<any>;
}) => {
  // const [displayInput, setDisplayInput] = useState<boolean>(false);
  const [tabContent, setTabContent] = useState<string>("ticketDetails");

  const fetchSingleTicket = useGetRequest(
    `/v1/tickets/single/${ticketID}`,
    false
  );

  
  const generateTicketEntries = (data: TicketType): DetailsType => {
    return {
      ticketId: data?.id,
      subject: data?.subject,
      category: data?.category,
      priority: data?.priority,
      description: data?.description,
      type: data?.type,
      status: data?.status,
      createdAt: data?.createdAt,
      updatedAt: data?.updatedAt,
    };
  };
  // const handleCancelClick = () => setDisplayInput(false);

  const dropDownList = {
    items: ["Delete Ticket"],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          console.log("Delete Ticket");
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  const tabNames = [
    { name: "Ticket Details", key: "ticketDetails", count: null },
    { name: "Ticket History", key: "ticketHistory", count: null },
    { name: "Ticket Actions", key: "ticketActions", count: null },
    { name: "Ticket Logs", key: "ticketLogs", count: null },
    { name: "Ticket Attachments", key: "ticketAttachments", count: 0 },
    { name: "Ticket Comments", key: "ticketComments", count: 0 },
  ];

  // const handleCallClick = () => {
  //   const callURL = `tel:${fetchSingleCustomer?.data?.phone}`;
  //   window.open(callURL, "_self");
  // };

  // const handleWhatsAppClick = () => {
  //   const whatsappURL = `https://wa.me/${fetchSingleCustomer?.data?.phone}`;
  //   window.open(whatsappURL, "_blank");
  // };

  return (
    <Modal
      layout="right"
      bodyStyle="pb-44 overflow-auto"
      isOpen={isOpen}
      onClose={() => {
        setTabContent("ticketDetails");
        setIsOpen(false);
        // setDisplayInput(false)
      }}
      leftHeaderContainerClass="pl-2"
    // rightHeaderComponents={
    //   displayInput ? (
    //     <p
    //       className="text-xs text-textDarkGrey font-semibold cursor-pointer over"
    //       onClick={handleCancelClick}
    //       title="Cancel editing customer details"
    //     >
    //       Cancel Edit
    //     </p>
    //   ) : (
    //     <button
    //       className="flex items-center justify-center w-[24px] h-[24px] bg-white border border-strokeGreyTwo rounded-full hover:bg-slate-100"
    //       onClick={() => setDisplayInput(true)}
    //     >
    //       <img src={editInput} alt="Edit Button" width="15px" />
    //     </button>
    //   )
    // }
    >
      <div className="bg-white">
        <header
          className={`flex items-center ${fetchSingleTicket?.data?.subject
              ? "justify-between"
              : "justify-end"
            } bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree`}
        >
          {fetchSingleTicket?.data?.subject && (
            <p className="flex items-center justify-center bg-paleLightBlue w-max p-2 h-[24px] text-textBlack text-xs font-semibold rounded-full">
              {fetchSingleTicket?.data?.subject}
            </p>
          )}
          <div className="flex items-center justify-end gap-2">
            {/* <Icon icon={call} iconText="Call" handleClick={handleCallClick} />
            <Icon
              icon={message}
              iconText="Message"
              handleClick={handleWhatsAppClick}
            /> */}
            <DropDown {...dropDownList} />
          </div>
        </header>
        <div className="flex flex-col w-full gap-4 px-4 py-2">
          <TabComponent
            tabs={tabNames.map(({ name, key, count }) => ({
              name,
              key,
              count,
            }))}
            onTabSelect={(key) => setTabContent(key)}
            tabsContainerClass="p-2 rounded-[20px]"
          />
          {tabContent === "ticketDetails" ? (
            <DataStateWrapper
              isLoading={fetchSingleTicket?.isLoading}
              error={fetchSingleTicket?.error}
              errorStates={fetchSingleTicket?.errorStates}
              refreshData={fetchSingleTicket?.mutate}
              errorMessage="Failed to fetch ticket details"
            >
              <TicketDetails
                {...generateTicketEntries(fetchSingleTicket?.data)}
                refreshTable={refreshTable}
                displayInput={false}
              />
            </DataStateWrapper>
          ) : (
            <div>
              {tabNames?.find((item) => item.key === tabContent)?.name} Coming
              Soon
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TicketModal;
