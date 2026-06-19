import React, { useEffect } from "react";
import { useRouter } from "next/router";
import withAuth from "@/core/withAuth";
import { buildPaymentReturnDestination } from "../../utils/paymentReturnState";

function PaymentCancel() {
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
        status: "cancel",
        paymentId,
        returnContext,
      })
    );
  }, [router]);

  return null;
}

export default withAuth(PaymentCancel);
