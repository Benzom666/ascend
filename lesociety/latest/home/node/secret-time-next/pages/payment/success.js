import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { buildPaymentReturnDestination } from "../../utils/paymentReturnState";

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const paymentId =
      typeof router.query?.payment_id === "string" ? router.query.payment_id : "";
    const returnContext =
      typeof router.query?.return_context === "string"
        ? router.query.return_context
        : "";

    router.replace(
      buildPaymentReturnDestination({
        status: "success",
        paymentId,
        returnContext,
      })
    );
  }, [router]);

  return null;
}
