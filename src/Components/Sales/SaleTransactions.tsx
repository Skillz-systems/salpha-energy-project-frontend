import { CardComponent } from "../CardComponents/CardComponent";
import { SaleTransactionsType } from "./SalesDetailsModal";
import { toast } from "react-toastify";
import { useCallback, useEffect, useState } from "react";

type PaymentInfo = {
  id: string;
  transactionRef: string;
  amount: number;
  paymentStatus: "PENDING" | "COMPLETED";
  paymentDate: string;
  saleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

const public_key =
  import.meta.env.PAYSTACK_PUBLIC_KEY ||
  "pk_test_764eb722cb244dc71a3dc8aba7875f6a7d1e9fd9";
const base_url = import.meta.env.VITE_API_BASE_URL;

const SaleTransactions = ({
  data,
}: {
  data: {
    entries: SaleTransactionsType[];
    paymentInfo: PaymentInfo[];
    customer: {
      name: string;
      phone_number: any;
      email: any;
    };
  };
}) => {
  const [paymentConfig, setPaymentConfig] = useState<any>(null);

  const getPaymentInfoById = (paymentId: string) => {
    const selectedPaymentData = data?.paymentInfo?.find(
      (p) => p.id === paymentId
    );

    const newPaymentData = {
      key: public_key,
      email: data.customer.email || "",
      amount: (selectedPaymentData?.amount || 0) * 100, // Paystack uses kobo
      currency: "NGN",
      ref: selectedPaymentData?.transactionRef,
      metadata: {
        saleId: selectedPaymentData?.saleId,
        customerName: data.customer.name
      },
      channels: ["card", "bank", "ussd", "qr", "mobile_money"],
    };

    setPaymentConfig(newPaymentData);
  };

  const initializePayment = useCallback(() => {
    if (!paymentConfig) {
      console.error("Payment configuration is missing.");
      return;
    }

    try {
      const handler = window.PaystackPop.setup({
        ...paymentConfig,
        callback: (response: any) => {
          console.log("Paystack Response:", response);
          toast.success("Payment Successful");
        },
        onClose: () => {
          toast.info("Payment Cancelled");
        },
      });
      
      handler.openIframe();
    } catch (error) {
      console.error("Paystack initialization error:", error);
      toast.error("Failed to initialize payment. Please try again.");
    }
  }, [paymentConfig]);

  useEffect(() => {
    if (paymentConfig) {
      initializePayment();
    }
  }, [initializePayment, paymentConfig]);

  const dropDownList = {
    items: ["Make Payment"],
    onClickLink: (index: number, cardData: any) => {
      switch (index) {
        case 0:
          getPaymentInfoById(cardData?.productId);
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {data?.entries?.map((item, index) => (
        <CardComponent
          key={index}
          variant="salesTransactions"
          transactionId={item?.transactionId}
          productId={item?.transactionId}
          transactionStatus={item?.paymentStatus}
          datetime={item?.datetime}
          productType={item?.productCategory}
          productTag={item?.paymentMode}
          transactionAmount={item?.amount}
          dropDownList={dropDownList}
          showDropdown={item?.paymentStatus === "COMPLETED" ? false : true}
        />
      ))}
    </div>
  );
};

export default SaleTransactions;
