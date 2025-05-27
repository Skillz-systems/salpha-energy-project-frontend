import React, { useState, useEffect, useCallback } from "react";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import settingsicon from "../../assets/settings.svg";
import producticon from "../../assets/product-grey.svg";
import { SaleStore } from "@/stores/SaleStore";
import { Tag } from "../Products/ProductDetails";
import { NameTag } from "../CardComponents/CardComponent";
import { ProductDetailRow } from "./ProductSaleDisplay";
import { IoReturnUpBack } from "react-icons/io5";
import { formatNumberWithCommas } from "@/utils/helpers";
import creditcardicon from "../../assets/creditcardgrey.svg";
import { toast } from "react-toastify";
import { useApiCall } from "@/utils/useApiCall";
import { usePaystack } from "@/utils/usePaystack";

// Enhanced Paystack type definitions
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  metadata?: Record<string, any>;
  channels?: string[];
  onClose: () => void;
  callback: (response: PaystackResponse) => void;
}

interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  trxref: string;
  redirecturl?: string;
}

const SalesSummary = ({
  setSummaryState,
  resetSaleModalState,
  loading,
  getIsFormFilled,
  apiErrorMessage,
}: {
  setSummaryState: React.Dispatch<React.SetStateAction<boolean>>;
  resetSaleModalState: () => void;
  loading: boolean;
  getIsFormFilled: () => boolean;
  apiErrorMessage: React.ReactNode;
}) => {
  const { apiCall } = useApiCall();
  const { isReady, error: paystackError, loading: paymentLoading, initializePayment } = usePaystack();
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const paymentInfo = SaleStore.paymentDetails;

  // Verify payment with backend
  const verifyPayment = async (reference: string) => {
    try {
      console.log('Verifying payment with reference:', reference);
      
      const response = await apiCall({
        endpoint: "/v1/payment/verify/callback",
        method: "post",
        data: { reference },
        showToast: false,
      });

      console.log('Payment verification response:', response);

      // Check for successful verification
      if (response?.data?.status === "success" || response?.status === "success") {
        toast.success("Payment verified successfully!");
        resetSaleModalState();
        return true;
      } else {
        console.error("Payment verification failed - unexpected response:", response);
        throw new Error("Payment verification failed - invalid response");
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      
      // More detailed error handling
      if (error?.response?.status === 404) {
        toast.error("Payment verification endpoint not found. Please contact support.");
      } else if (error?.response?.status === 500) {
        toast.error("Server error during payment verification. Please contact support.");
      } else if (error?.response?.data?.message) {
        toast.error(`Payment verification failed: ${error.response.data.message}`);
      } else {
        toast.error("Payment verification failed. Please contact support.");
      }
      
      return false;
    }
  };

  // Handle payment initialization
  const handlePayment = useCallback(() => {
    if (!paymentInfo || !paymentInfo.publicKey) {
      setPaymentError("Payment details not found.");
      return;
    }

    if (!paymentInfo.email || !paymentInfo.amount || !paymentInfo.reference) {
      setPaymentError("Invalid payment information. Please check your details.");
      return;
    }

    setPaymentError(null);

    const success = initializePayment({
      key: paymentInfo.publicKey,
      email: paymentInfo.email,
      amount: paymentInfo.amount,
      currency: paymentInfo.currency || "NGN",
      ref: paymentInfo.reference,
      metadata: {
        ...paymentInfo.metadata,
        custom_fields: [
          {
            display_name: "Sale ID",
            variable_name: "sale_id",
            value: paymentInfo.metadata?.saleId || "",
          },
          {
            display_name: "Customer Name",
            variable_name: "customer_name", 
            value: paymentInfo.metadata?.customerName || "",
          }
        ]
      },
      channels: paymentInfo.channels,
      onClose: () => {
        toast.info("Payment was cancelled");
      },
      callback: async (response) => {
        if (response.status === "success") {
          // Verify payment with backend
          const isVerified = await verifyPayment(response.reference);
          if (!isVerified) {
            setPaymentError("Payment completed but verification failed. Please contact support with reference: " + response.reference);
          }
        } else {
          toast.error("Payment failed. Please try again.");
          setPaymentError("Payment was not successful. Please try again.");
        }
      }
    });

    if (!success) {
      setPaymentError("Failed to initialize payment. Please try again.");
    }
  }, [paymentInfo, initializePayment, verifyPayment]);

  // Clear errors when payment info changes
  useEffect(() => {
    if (paymentInfo) {
      setPaymentError(null);
    }
  }, [paymentInfo]);

  // Combine errors from hook and local state
  const displayError = paymentError || paystackError;

  return (
    <>
      {!SaleStore.paymentDetails.reference ? (
        <>
          <div className="flex w-full">
            <p
              className="flex gap-1 items-center text-xs font-bold text-textDarkGrey cursor-pointer hover:underline"
              onClick={() => setSummaryState(false)}
            >
              <IoReturnUpBack />
              Back to form
            </p>
          </div>
          <div className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
            <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
              <img src={settingsicon} alt="Settings Icon" /> GENERAL DETAILS
            </p>
            <ProductDetailRow
              label="Sale Category"
              value={SaleStore.category}
            />
            <div className="flex items-center justify-between">
              <Tag name="Customer" />
              <div className="text-xs font-bold text-textDarkGrey">
                <NameTag name={SaleStore.customer?.customerName} />
              </div>
            </div>
          </div>
          {SaleStore.products.map((item, index) => {
            const params = SaleStore.getParametersByProductId(item?.productId);
            const paramList = [
              "Payment Mode",
              "Number of Installments",
              "Initial Deposit",
              "Discount",
            ];
            const recipient = SaleStore.getRecipientByProductId(
              item?.productId
            );
            const miscellaneousCosts = SaleStore.getMiscellaneousByProductId(
              item?.productId
            ).costs;
            const miscCostsExist = Object.keys(miscellaneousCosts).length >= 1;

            return (
              <div
                key={index}
                className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]"
              >
                <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
                  <img src={producticon} alt="Product Icon" /> PRODUCT{" "}
                  {index + 1}
                </p>

                <ProductDetailRow
                  label="Product Category"
                  value={item.productTag}
                />
                <ProductDetailRow
                  label="Product Name"
                  value={item.productName}
                />
                <ProductDetailRow
                  label="Product Units"
                  value={item.productUnits}
                />
                <ProductDetailRow
                  label="Product Price"
                  value={item.productPrice}
                />

                <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
                  {Object.entries(params || {}).map(([key, value], index) =>
                    !value ? null : (
                      <ProductDetailRow
                        key={key}
                        label={paramList[index]}
                        value={
                          value >= 1 ? formatNumberWithCommas(value) : value
                        }
                        showNaira={Boolean(value >= 2)}
                      />
                    )
                  )}
                </div>

                {!miscCostsExist ? null : (
                  <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
                    {Array.from(miscellaneousCosts.entries()).map(
                      ([name, cost]) => (
                        <ProductDetailRow
                          key={index}
                          label={name}
                          value={formatNumberWithCommas(cost)}
                          showNaira={true}
                        />
                      )
                    )}
                  </div>
                )}

                <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
                  <ProductDetailRow
                    label="Recipient Name"
                    value={`${recipient?.firstname} ${recipient?.lastname}`}
                  />
                  <ProductDetailRow
                    label="Recipient Address"
                    value={recipient?.address as string}
                  />
                </div>
              </div>
            );
          })}

          {apiErrorMessage}

          <ProceedButton
            type="submit"
            loading={loading}
            variant={getIsFormFilled() ? "gradient" : "gray"}
            disabled={!getIsFormFilled()}
          />
        </>
      ) : (
        <>
          <div className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
            <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
              <img src={creditcardicon} alt="Settings Icon" /> PAYMENT DETAILS
            </p>
            <div className="flex items-center justify-between">
              <Tag name="Customer Email" />
              <div className="text-xs font-bold text-textDarkGrey">
                <NameTag name={paymentInfo?.email || "N/A"} />
              </div>
            </div>
            <ProductDetailRow
              label="Payment Amount"
              value={formatNumberWithCommas(paymentInfo?.amount || 0)}
            />
            <ProductDetailRow
              label="Payment Currency"
              value={paymentInfo?.currency || ""}
            />
            <ProductDetailRow
              label="Payment Reference"
              value={paymentInfo?.reference || ""}
            />
          </div>

          {displayError && (
            <div className="p-3 mt-4 border border-red-500 rounded-md bg-red-50">
              <p className="text-red-600 text-sm">{displayError}</p>
            </div>
          )}

          <ProceedButton
            type="button"
            onClick={handlePayment}
            loading={paymentLoading}
            variant="gradient"
            disabled={paymentLoading || !isReady}
          />
        </>
      )}
    </>
  );
};

export default SalesSummary;
