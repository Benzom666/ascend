import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Card,
  Col,
  Nav,
  Row,
  Spinner,
  Tab,
  Table,
} from "react-bootstrap";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import "chart.js/auto";
import axios from "axios";
import moment from "moment";
import { Navigate } from "react-router-dom";

import Utils from "../../utility";
import PageHeader from "../pageContainer/header";
import SideBar from "../sideBar/sidebar";
import {
  createDefaultPricingConfig,
  formatBulletTextarea,
  mergePricingConfig,
  parseBulletTextarea,
} from "./pricingConfigDefaults";
import "./SubscriptionAnalytics.css";

const EMPTY_ANALYTICS = {
  totalInterestedTokens: 0,
  totalSuperInterestedTokens: 0,
  totalChatTokens: 0,
  totalRevenue: 0,
  totalTransactions: 0,
  completedRevenue: 0,
  completedTransactions: 0,
  pendingTransactions: 0,
  failedTransactions: 0,
  uniqueBuyers: 0,
  averageTransactionValue: 0,
  tokenDistribution: {
    interested: 0,
    superInterested: 0,
    chat: 0,
  },
  productBreakdown: [],
  chatBreakdown: {
    totalChats: 0,
    aLaCarteChats: 0,
    queensBundleChats: 0,
    aLaCarteOrders: 0,
    queensBundleOrders: 0,
    queensBundlePurchases: 0,
    aLaCarteRevenue: 0,
    queensBundleRevenue: 0,
  },
  paymentStatusBreakdown: [],
  revenueOverTime: [],
  subscriptionTrends: [],
  topBuyers: [],
  recentTransactions: [],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#d6d6df",
        boxWidth: 14,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: "#161621",
      titleColor: "#ffffff",
      bodyColor: "#d6d6df",
      borderColor: "#343447",
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#8f90a6",
      },
      grid: {
        color: "rgba(255,255,255,0.05)",
      },
    },
    y: {
      ticks: {
        color: "#8f90a6",
      },
      grid: {
        color: "rgba(255,255,255,0.05)",
      },
    },
  },
};

const doughnutOptions = {
  ...chartOptions,
  scales: undefined,
};

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatDateTime(value) {
  return value ? moment(value).format("DD MMM YYYY, h:mm A") : "-";
}

function buildCSV(topBuyers) {
  const headers = [
    "Rank",
    "Username",
    "Total Spent",
    "Transactions",
    "Interested Tokens",
    "Super Interested Tokens",
    "Total Chat Tokens",
    "A La Carte Chats",
    "Queens Bundle Chats",
    "Queens Bundle Purchases",
  ];

  const rows = topBuyers.map((buyer, index) => [
    index + 1,
    buyer.username || "Unknown",
    Number(buyer.totalSpent || 0).toFixed(2),
    buyer.transactionCount || 0,
    buyer.interestedTokens || 0,
    buyer.superInterestedTokens || 0,
    buyer.chatTokens || 0,
    buyer.aLaCarteChats || 0,
    buyer.queensBundleChats || 0,
    buyer.queensBundleCount || 0,
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function statusTone(status) {
  if (["completed", "complete", "paid"].includes(status)) {
    return "success";
  }

  if (["failed", "cancelled", "canceled", "declined", "expired"].includes(status)) {
    return "danger";
  }

  return "warning";
}

function setNestedValue(target, path, value) {
  const keys = String(path || "").split(".");
  const root = { ...target };
  let cursor = root;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }

    cursor[key] = {
      ...(cursor[key] || {}),
    };
    cursor = cursor[key];
  });

  return root;
}

function getNestedValue(target, path, fallback = "") {
  return String(path || "")
    .split(".")
    .reduce(
      (currentValue, key) =>
        currentValue && currentValue[key] !== undefined ? currentValue[key] : undefined,
      target
    ) ?? fallback;
}

const SubscriptionAnalytics = () => {
  const token = localStorage.getItem("accessToken");
  const [loading, setLoading] = useState(true);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [pricingSaving, setPricingSaving] = useState(false);
  const [error, setError] = useState("");
  const [pricingError, setPricingError] = useState("");
  const [pricingSavedMessage, setPricingSavedMessage] = useState("");
  const [analyticsData, setAnalyticsData] = useState(EMPTY_ANALYTICS);
  const [pricingConfig, setPricingConfig] = useState(createDefaultPricingConfig());
  const [filters, setFilters] = useState({
    days: 30,
    paymentStatus: "all",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let active = true;

    const fetchAnalytics = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        params.append("days", String(filters.days));
        params.append("payment_status", filters.paymentStatus);

        if (filters.startDate) {
          params.append("start_date", filters.startDate);
        }

        if (filters.endDate) {
          params.append("end_date", filters.endDate);
        }

        const response = await axios.get(
          `${Utils.constants.API_URL}/dashboard/subscription-analytics?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!active) {
          return;
        }

        setAnalyticsData({
          ...EMPTY_ANALYTICS,
          ...(response?.data?.data || {}),
        });
      } catch (fetchError) {
        if (!active) {
          return;
        }

        setAnalyticsData(EMPTY_ANALYTICS);
        setError(
          fetchError?.response?.data?.message ||
            fetchError?.message ||
            "Failed to load subscription analytics."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      active = false;
    };
  }, [filters, token]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let active = true;

    const fetchPricingConfig = async () => {
      setPricingLoading(true);
      setPricingError("");

      try {
        const response = await axios.get(
          `${Utils.constants.API_URL}/dashboard/pricing-config`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!active) {
          return;
        }

        setPricingConfig(mergePricingConfig(response?.data?.data || {}));
      } catch (fetchError) {
        if (!active) {
          return;
        }

        setPricingConfig(createDefaultPricingConfig());
        setPricingError(
          fetchError?.response?.data?.message ||
            fetchError?.message ||
            "Failed to load pricing configuration."
        );
      } finally {
        if (active) {
          setPricingLoading(false);
        }
      }
    };

    fetchPricingConfig();

    return () => {
      active = false;
    };
  }, [token]);

  const handlePricingFieldChange = (field, value) => {
    setPricingSavedMessage("");
    setPricingConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedPricingFieldChange = (path, value) => {
    setPricingSavedMessage("");
    setPricingConfig((prev) => setNestedValue(prev, path, value));
  };

  const handleBulletFieldChange = (path, value) => {
    handleNestedPricingFieldChange(path, parseBulletTextarea(value));
  };

  const handleDiscountOptionChange = (index, field, value) => {
    setPricingSavedMessage("");
    setPricingConfig((prev) => ({
      ...prev,
      discountOptions: prev.discountOptions.map((option, optionIndex) =>
        optionIndex === index
          ? {
              ...option,
              [field]: value,
            }
          : option
      ),
    }));
  };

  const savePricingConfig = async () => {
    setPricingSaving(true);
    setPricingError("");
    setPricingSavedMessage("");

    try {
      const response = await axios.put(
        `${Utils.constants.API_URL}/dashboard/pricing-config`,
        pricingConfig,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPricingConfig(mergePricingConfig(response?.data?.data || {}));
      setPricingSavedMessage("Pricing settings updated.");
    } catch (saveError) {
      setPricingError(
        saveError?.response?.data?.message ||
          saveError?.message ||
          "Failed to update pricing configuration."
      );
    } finally {
      setPricingSaving(false);
    }
  };

  const summaryCards = [
    {
      label: "Filtered Revenue",
      value: formatCurrency(analyticsData.totalRevenue),
      tone: "revenue",
    },
    {
      label: "Completed Revenue",
      value: formatCurrency(analyticsData.completedRevenue),
      tone: "success",
    },
    {
      label: "Transactions",
      value: formatNumber(analyticsData.totalTransactions),
      tone: "transactions",
    },
    {
      label: "Unique Buyers",
      value: formatNumber(analyticsData.uniqueBuyers),
      tone: "buyers",
    },
    {
      label: "Interested",
      value: formatNumber(analyticsData.totalInterestedTokens),
      tone: "interested",
    },
    {
      label: "Super Interested",
      value: formatNumber(analyticsData.totalSuperInterestedTokens),
      tone: "super",
    },
    {
      label: "Girls Chat Total",
      value: formatNumber(analyticsData.totalChatTokens),
      tone: "chat",
    },
    {
      label: "Average Order",
      value: formatCurrency(analyticsData.averageTransactionValue),
      tone: "average",
    },
  ];

  const tokenDistributionData = useMemo(
    () => ({
      labels: ["Interested", "Super Interested", "Girls Chat"],
      datasets: [
        {
          data: [
            analyticsData.tokenDistribution?.interested || 0,
            analyticsData.tokenDistribution?.superInterested || 0,
            analyticsData.tokenDistribution?.chat || 0,
          ],
          backgroundColor: ["#5d89b3", "#f24462", "#e6a23c"],
          borderColor: ["#5d89b3", "#f24462", "#e6a23c"],
          borderWidth: 1,
        },
      ],
    }),
    [analyticsData.tokenDistribution]
  );

  const revenueData = useMemo(
    () => ({
      labels: analyticsData.revenueOverTime.map((item) => moment(item.date).format("DD/MM")),
      datasets: [
        {
          label: "All Revenue",
          data: analyticsData.revenueOverTime.map((item) => Number(item.revenue || 0)),
          borderColor: "#f24462",
          backgroundColor: "rgba(242, 68, 98, 0.18)",
          fill: true,
          tension: 0.3,
        },
        {
          label: "Completed Revenue",
          data: analyticsData.revenueOverTime.map((item) => Number(item.completedRevenue || 0)),
          borderColor: "#31c48d",
          backgroundColor: "rgba(49, 196, 141, 0.12)",
          fill: true,
          tension: 0.3,
        },
      ],
    }),
    [analyticsData.revenueOverTime]
  );

  const productRevenueData = useMemo(
    () => ({
      labels: analyticsData.productBreakdown.map((item) => item.label),
      datasets: [
        {
          label: "Revenue",
          data: analyticsData.productBreakdown.map((item) => Number(item.revenue || 0)),
          backgroundColor: ["#5d89b3", "#f24462", "#f59e0b", "#8b5cf6"],
          borderRadius: 8,
        },
      ],
    }),
    [analyticsData.productBreakdown]
  );

  const subscriptionTrendData = useMemo(
    () => ({
      labels: analyticsData.subscriptionTrends.map((item) => moment(item.date).format("DD/MM")),
      datasets: [
        {
          label: "Interested",
          data: analyticsData.subscriptionTrends.map((item) => Number(item.interested || 0)),
          backgroundColor: "#5d89b3",
        },
        {
          label: "Super Interested",
          data: analyticsData.subscriptionTrends.map((item) => Number(item.superInterested || 0)),
          backgroundColor: "#f24462",
        },
        {
          label: "A La Carte Chats",
          data: analyticsData.subscriptionTrends.map((item) => Number(item.aLaCarteChats || 0)),
          backgroundColor: "#f59e0b",
        },
        {
          label: "Queens Bundle Chats",
          data: analyticsData.subscriptionTrends.map((item) => Number(item.queensBundleChats || 0)),
          backgroundColor: "#8b5cf6",
        },
      ],
    }),
    [analyticsData.subscriptionTrends]
  );

  const statusMixData = useMemo(
    () => ({
      labels: analyticsData.paymentStatusBreakdown.map((item) => item.status),
      datasets: [
        {
          data: analyticsData.paymentStatusBreakdown.map((item) => Number(item.count || 0)),
          backgroundColor: ["#31c48d", "#f59e0b", "#ef4444", "#60a5fa", "#8b5cf6", "#6b7280"],
          borderWidth: 1,
          borderColor: "#181824",
        },
      ],
    }),
    [analyticsData.paymentStatusBreakdown]
  );

  const chatSplitData = useMemo(
    () => ({
      labels: ["A La Carte", "Queens Bundle"],
      datasets: [
        {
          data: [
            analyticsData.chatBreakdown?.aLaCarteChats || 0,
            analyticsData.chatBreakdown?.queensBundleChats || 0,
          ],
          backgroundColor: ["#f59e0b", "#8b5cf6"],
          borderWidth: 1,
          borderColor: "#181824",
        },
      ],
    }),
    [analyticsData.chatBreakdown]
  );

  const completedRate =
    analyticsData.totalTransactions > 0
      ? (analyticsData.completedTransactions / analyticsData.totalTransactions) * 100
      : 0;
  const girlsChatRevenue =
    Number(analyticsData.chatBreakdown?.aLaCarteRevenue || 0) +
    Number(analyticsData.chatBreakdown?.queensBundleRevenue || 0);
  const girlsChatBundleShare =
    analyticsData.chatBreakdown?.totalChats > 0
      ? (analyticsData.chatBreakdown.queensBundleChats /
          analyticsData.chatBreakdown.totalChats) *
        100
      : 0;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      days: 30,
      paymentStatus: "all",
      startDate: "",
      endDate: "",
    });
  };

  const exportCSV = () => {
    if (!analyticsData.topBuyers.length) {
      return;
    }

    const blob = new Blob([buildCSV(analyticsData.topBuyers)], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `subscription-analytics-${moment().format("YYYY-MM-DD")}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const paywallContentSections = [
    {
      title: "Men Paywall",
      description:
        "Controls the male first-date paywall popup. Templates support {{percentageOff}}, {{label}}, and {{timeRemaining}}.",
      fields: [
        ["Title", "content.paywalls.menFirstDate.title", "textarea"],
        ["Subtitle", "content.paywalls.menFirstDate.subtitle", "textarea"],
        ["Default Offer Title", "content.paywalls.menFirstDate.offerTitleDefault", "text"],
        ["Discount Offer Template", "content.paywalls.menFirstDate.offerTitleTemplate", "text"],
        ["Offer Subtitle", "content.paywalls.menFirstDate.offerSubtitle", "text"],
        ["Timer Template", "content.paywalls.menFirstDate.timerTemplate", "text"],
        ["CTA Label", "content.paywalls.menFirstDate.ctaLabel", "text"],
        ["Footer", "content.paywalls.menFirstDate.footer", "textarea"],
      ],
    },
    {
      title: "Women Paywall",
      description:
        "Controls the women chat paywall popup. Templates support {{percentageOff}}, {{label}}, {{bundlePrice}}, {{bundleChats}}, and {{timeRemaining}}.",
      fields: [
        ["Title", "content.paywalls.womenChat.title", "textarea"],
        ["Subtitle", "content.paywalls.womenChat.subtitle", "textarea"],
        ["Default Offer Title", "content.paywalls.womenChat.offerTitleDefault", "text"],
        ["Discount Offer Template", "content.paywalls.womenChat.offerTitleTemplate", "text"],
        ["Offer Subtitle", "content.paywalls.womenChat.offerSubtitle", "text"],
        ["Timer Template", "content.paywalls.womenChat.timerTemplate", "text"],
        ["CTA Label", "content.paywalls.womenChat.ctaLabel", "text"],
        ["Footer", "content.paywalls.womenChat.footer", "textarea"],
      ],
    },
  ];

  const pricingMenuSections = [
    {
      title: "Men Pricing Menu",
      description:
        "Updates the token pricing modal and membership purchase page. Footer templates support {{amount}} and {{label}}.",
      textFields: [
        ["Interested Title", "content.pricingMenus.men.interested.title", "text"],
        ["Interested Subtitle", "content.pricingMenus.men.interested.subtitle", "text"],
        ["Interested Price Suffix", "content.pricingMenus.men.interested.priceSuffix", "text"],
        ["Super Interested Title", "content.pricingMenus.men.superInterested.title", "text"],
        ["Super Interested Subtitle", "content.pricingMenus.men.superInterested.subtitle", "text"],
        ["Super Interested Price Suffix", "content.pricingMenus.men.superInterested.priceSuffix", "text"],
        ["Footer Without Discount", "content.pricingMenus.men.footerNoDiscountTemplate", "text"],
        ["Footer With Discount", "content.pricingMenus.men.footerDiscountTemplate", "text"],
        ["Subtotal Template", "content.pricingMenus.men.discountSubtotalTemplate", "text"],
        ["Discount Total Template", "content.pricingMenus.men.discountTotalTemplate", "text"],
        ["Checkout Label", "content.pricingMenus.men.checkoutLabel", "text"],
        ["Processing Label", "content.pricingMenus.men.processingCheckoutLabel", "text"],
        ["Minimum Purchase Alert", "content.pricingMenus.men.minPurchaseAlertTemplate", "text"],
      ],
      bulletFields: [
        ["Interested Bullets", "content.pricingMenus.men.interested.bullets"],
        ["Super Interested Bullets", "content.pricingMenus.men.superInterested.bullets"],
      ],
    },
    {
      title: "Women Pricing Menu",
      description:
        "Updates the women pricing modal. Footer templates support {{amount}} and {{label}}.",
      textFields: [
        ["A La Carte Title", "content.pricingMenus.women.aLaCarte.title", "text"],
        ["A La Carte Subtitle", "content.pricingMenus.women.aLaCarte.subtitle", "text"],
        ["A La Carte Price Suffix", "content.pricingMenus.women.aLaCarte.priceSuffix", "text"],
        ["Queens Bundle Title", "content.pricingMenus.women.queensBundle.title", "text"],
        ["Queens Bundle Subtitle", "content.pricingMenus.women.queensBundle.subtitle", "text"],
        ["Queens Bundle Price Suffix", "content.pricingMenus.women.queensBundle.priceSuffix", "text"],
        ["Queens Bundle Counter Label", "content.pricingMenus.women.queensBundle.bundleCountLabel", "text"],
        ["Footer Without Discount", "content.pricingMenus.women.footerNoDiscountTemplate", "text"],
        ["Footer With Discount", "content.pricingMenus.women.footerDiscountTemplate", "text"],
        ["Subtotal Template", "content.pricingMenus.women.discountSubtotalTemplate", "text"],
        ["Discount Total Template", "content.pricingMenus.women.discountTotalTemplate", "text"],
        ["Checkout Label", "content.pricingMenus.women.checkoutLabel", "text"],
        ["Processing Label", "content.pricingMenus.women.processingCheckoutLabel", "text"],
        ["Minimum Purchase Alert", "content.pricingMenus.women.minPurchaseAlertTemplate", "text"],
      ],
      bulletFields: [
        ["A La Carte Bullets", "content.pricingMenus.women.aLaCarte.bullets"],
        ["Queens Bundle Bullets", "content.pricingMenus.women.queensBundle.bullets"],
      ],
    },
  ];

  if (!token) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <div className="dashboardUi">
      <SideBar />
      <div className="inner-page userListUI subscription-analytics-page">
        <PageHeader title="Subscriptions & Pricing" />

        <Card className="subscription-panel subscription-filter-panel">
          <Card.Body>
            <div className="subscription-panel__header">
              <div>
                <h3>Paywall Pricing Controls</h3>
                <p>Update checkout pricing and choose from at least two live discount options.</p>
              </div>
              <div className="subscription-actions">
                <button
                  type="button"
                  className="subscription-btn subscription-btn--primary"
                  onClick={savePricingConfig}
                  disabled={pricingLoading || pricingSaving}
                >
                  {pricingSaving ? "Saving..." : "Save Pricing"}
                </button>
              </div>
            </div>

            {pricingError ? (
              <Alert variant="danger" className="subscription-alert">
                {pricingError}
              </Alert>
            ) : null}
            {pricingSavedMessage ? (
              <Alert variant="success" className="subscription-alert">
                {pricingSavedMessage}
              </Alert>
            ) : null}

            <Row className="g-3">
              <Col md={3}>
                <label className="subscription-label">Paywall Enabled</label>
                <select
                  className="subscription-control"
                  value={pricingConfig.paywallEnabled ? "enabled" : "disabled"}
                  onChange={(e) =>
                    handlePricingFieldChange(
                      "paywallEnabled",
                      e.target.value === "enabled"
                    )
                  }
                  disabled={pricingLoading}
                >
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </Col>
              <Col md={3}>
                <label className="subscription-label">Interested Price</label>
                <input
                  className="subscription-control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricingConfig.menInterestedPrice}
                  onChange={(e) =>
                    handlePricingFieldChange("menInterestedPrice", Number(e.target.value))
                  }
                  disabled={pricingLoading}
                />
              </Col>
              <Col md={3}>
                <label className="subscription-label">Super Interested Price</label>
                <input
                  className="subscription-control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricingConfig.menSuperInterestedPrice}
                  onChange={(e) =>
                    handlePricingFieldChange(
                      "menSuperInterestedPrice",
                      Number(e.target.value)
                    )
                  }
                  disabled={pricingLoading}
                />
              </Col>
              <Col md={3}>
                <label className="subscription-label">Men Min Purchase</label>
                <input
                  className="subscription-control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricingConfig.menMinimumPurchase}
                  onChange={(e) =>
                    handlePricingFieldChange("menMinimumPurchase", Number(e.target.value))
                  }
                  disabled={pricingLoading}
                />
              </Col>
              <Col md={3}>
                <label className="subscription-label">A La Carte Price</label>
                <input
                  className="subscription-control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricingConfig.womenALaCartePrice}
                  onChange={(e) =>
                    handlePricingFieldChange("womenALaCartePrice", Number(e.target.value))
                  }
                  disabled={pricingLoading}
                />
              </Col>
              <Col md={3}>
                <label className="subscription-label">Queens Bundle Price</label>
                <input
                  className="subscription-control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricingConfig.womenQueensBundlePrice}
                  onChange={(e) =>
                    handlePricingFieldChange(
                      "womenQueensBundlePrice",
                      Number(e.target.value)
                    )
                  }
                  disabled={pricingLoading}
                />
              </Col>
              <Col md={3}>
                <label className="subscription-label">Queens Bundle Chats</label>
                <input
                  className="subscription-control"
                  type="number"
                  min="1"
                  step="1"
                  value={pricingConfig.womenQueensBundleChats}
                  onChange={(e) =>
                    handlePricingFieldChange(
                      "womenQueensBundleChats",
                      Number(e.target.value)
                    )
                  }
                  disabled={pricingLoading}
                />
              </Col>
              <Col md={3}>
                <label className="subscription-label">Women Min Purchase</label>
                <input
                  className="subscription-control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricingConfig.womenMinimumPurchase}
                  onChange={(e) =>
                    handlePricingFieldChange("womenMinimumPurchase", Number(e.target.value))
                  }
                  disabled={pricingLoading}
                />
              </Col>
              <Col md={3}>
                <label className="subscription-label">Offer Duration Hours</label>
                <input
                  className="subscription-control"
                  type="number"
                  min="1"
                  step="1"
                  value={pricingConfig.defaultOfferHours}
                  onChange={(e) =>
                    handlePricingFieldChange("defaultOfferHours", Number(e.target.value))
                  }
                  disabled={pricingLoading}
                />
              </Col>
              <Col md={3}>
                <label className="subscription-label">Active Discount</label>
                <select
                  className="subscription-control"
                  value={pricingConfig.activeDiscountKey}
                  onChange={(e) =>
                    handlePricingFieldChange("activeDiscountKey", e.target.value)
                  }
                  disabled={pricingLoading}
                >
                  <option value="">No Discount</option>
                  {pricingConfig.discountOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Col>
              {pricingConfig.discountOptions.map((option, index) => (
                <React.Fragment key={option.key}>
                  <Col md={2}>
                    <label className="subscription-label">Discount Label</label>
                    <input
                      className="subscription-control"
                      type="text"
                      value={option.label}
                      onChange={(e) =>
                        handleDiscountOptionChange(index, "label", e.target.value)
                      }
                      disabled={pricingLoading}
                    />
                  </Col>
                  <Col md={2}>
                    <label className="subscription-label">% Off</label>
                    <input
                      className="subscription-control"
                      type="number"
                      min="0"
                      max="50"
                      step="1"
                      value={option.percentageOff}
                      onChange={(e) =>
                        handleDiscountOptionChange(
                          index,
                          "percentageOff",
                          Number(e.target.value)
                        )
                      }
                      disabled={pricingLoading}
                    />
                  </Col>
                  <Col md={2}>
                    <label className="subscription-label">Status</label>
                    <select
                      className="subscription-control"
                      value={option.enabled ? "enabled" : "disabled"}
                      onChange={(e) =>
                        handleDiscountOptionChange(
                          index,
                          "enabled",
                          e.target.value === "enabled"
                        )
                      }
                      disabled={pricingLoading}
                    >
                      <option value="enabled">Enabled</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </Col>
                </React.Fragment>
              ))}
            </Row>

            <div className="subscription-editor-stack">
              {paywallContentSections.map((section) => (
                <Card key={section.title} className="subscription-editor-card">
                  <Card.Body>
                    <div className="subscription-panel__header">
                      <div>
                        <h3>{section.title}</h3>
                        <p>{section.description}</p>
                      </div>
                    </div>
                    <Row className="g-3">
                      {section.fields.map(([label, path, fieldType]) => (
                        <Col md={fieldType === "textarea" ? 6 : 4} key={path}>
                          <label className="subscription-label">{label}</label>
                          {fieldType === "textarea" ? (
                            <textarea
                              className="subscription-control subscription-control--textarea"
                              rows={4}
                              value={getNestedValue(pricingConfig, path)}
                              onChange={(e) =>
                                handleNestedPricingFieldChange(path, e.target.value)
                              }
                              disabled={pricingLoading}
                            />
                          ) : (
                            <input
                              className="subscription-control"
                              type="text"
                              value={getNestedValue(pricingConfig, path)}
                              onChange={(e) =>
                                handleNestedPricingFieldChange(path, e.target.value)
                              }
                              disabled={pricingLoading}
                            />
                          )}
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              ))}

              {pricingMenuSections.map((section) => (
                <Card key={section.title} className="subscription-editor-card">
                  <Card.Body>
                    <div className="subscription-panel__header">
                      <div>
                        <h3>{section.title}</h3>
                        <p>{section.description}</p>
                      </div>
                    </div>
                    <Row className="g-3">
                      {section.textFields.map(([label, path]) => (
                        <Col md={4} key={path}>
                          <label className="subscription-label">{label}</label>
                          <input
                            className="subscription-control"
                            type="text"
                            value={getNestedValue(pricingConfig, path)}
                            onChange={(e) =>
                              handleNestedPricingFieldChange(path, e.target.value)
                            }
                            disabled={pricingLoading}
                          />
                        </Col>
                      ))}
                      {section.bulletFields.map(([label, path]) => (
                        <Col md={6} key={path}>
                          <label className="subscription-label">{label}</label>
                          <textarea
                            className="subscription-control subscription-control--textarea"
                            rows={4}
                            value={formatBulletTextarea(getNestedValue(pricingConfig, path, []))}
                            onChange={(e) => handleBulletFieldChange(path, e.target.value)}
                            disabled={pricingLoading}
                          />
                          <small className="subscription-hint">
                            One bullet per line.
                          </small>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Card.Body>
        </Card>

        <Tab.Container defaultActiveKey="overview">
          <Nav variant="tabs" className="subscription-tabs">
            <Nav.Item>
              <Nav.Link eventKey="overview">Overview</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content className="subscription-content">
            <Tab.Pane eventKey="overview">
              <Card className="subscription-panel subscription-filter-panel">
                <Card.Body>
                  <div className="subscription-panel__header">
                    <div>
                      <h3>Filters</h3>
                      <p>Every metric and chart below respects the same filter set.</p>
                    </div>
                    <div className="subscription-actions">
                      <button
                        type="button"
                        className="subscription-btn subscription-btn--secondary"
                        onClick={resetFilters}
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        className="subscription-btn subscription-btn--primary"
                        onClick={exportCSV}
                        disabled={!analyticsData.topBuyers.length}
                      >
                        Export Top Buyers
                      </button>
                    </div>
                  </div>

                  <Row className="g-3">
                    <Col md={3}>
                      <label className="subscription-label">Time Period</label>
                      <select
                        className="subscription-control"
                        value={filters.days}
                        onChange={(e) => handleFilterChange("days", Number(e.target.value))}
                      >
                        <option value={0}>All Time</option>
                        <option value={7}>Last 7 Days</option>
                        <option value={30}>Last 30 Days</option>
                        <option value={90}>Last 90 Days</option>
                        <option value={180}>Last 6 Months</option>
                        <option value={365}>Last 12 Months</option>
                      </select>
                    </Col>
                    <Col md={3}>
                      <label className="subscription-label">Payment Status</label>
                      <select
                        className="subscription-control"
                        value={filters.paymentStatus}
                        onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
                      >
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                      </select>
                    </Col>
                    <Col md={3}>
                      <label className="subscription-label">Start Date</label>
                      <input
                        className="subscription-control"
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange("startDate", e.target.value)}
                      />
                    </Col>
                    <Col md={3}>
                      <label className="subscription-label">End Date</label>
                      <input
                        className="subscription-control"
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange("endDate", e.target.value)}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {error ? (
                <Alert variant="danger" className="subscription-alert">
                  {error}
                </Alert>
              ) : null}

              {loading ? (
                <div className="subscription-loading">
                  <Spinner animation="border" variant="light" />
                </div>
              ) : (
                <>
                  <Row className="g-3 subscription-summary-row">
                    {summaryCards.map((card) => (
                      <Col md={6} xl={3} key={card.label}>
                        <Card className={`subscription-summary subscription-summary--${card.tone}`}>
                          <Card.Body>
                            <span className="subscription-summary__label">{card.label}</span>
                            <strong className="subscription-summary__value">{card.value}</strong>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  <Row className="g-3">
                    <Col lg={8}>
                      <Card className="subscription-panel">
                        <Card.Body>
                          <div className="subscription-panel__header">
                            <div>
                              <h3>Revenue Over Time</h3>
                              <p>Filtered revenue and completed revenue tracked day by day.</p>
                            </div>
                          </div>
                          <div className="subscription-chart">
                            <Line data={revenueData} options={chartOptions} />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col lg={4}>
                      <Card className="subscription-panel">
                        <Card.Body>
                          <div className="subscription-panel__header">
                            <div>
                              <h3>Status Mix</h3>
                              <p>Transaction count split by payment status.</p>
                            </div>
                          </div>
                          <div className="subscription-chart subscription-chart--small">
                            <Doughnut data={statusMixData} options={doughnutOptions} />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Row className="g-3">
                    <Col lg={7}>
                      <Card className="subscription-panel">
                        <Card.Body>
                          <div className="subscription-panel__header">
                            <div>
                              <h3>Product Revenue</h3>
                              <p>Revenue contribution by token product and girls chat package type.</p>
                            </div>
                          </div>
                          <div className="subscription-chart">
                            <Bar data={productRevenueData} options={chartOptions} />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col lg={5}>
                      <Card className="subscription-panel">
                        <Card.Body>
                          <div className="subscription-panel__header">
                            <div>
                              <h3>Girls Chat Split</h3>
                              <p>Queens Bundle vs A La Carte, using stored metadata with legacy fallback.</p>
                            </div>
                          </div>
                          <div className="subscription-chart subscription-chart--small">
                            <Doughnut data={chatSplitData} options={doughnutOptions} />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Row className="g-3">
                    <Col lg={8}>
                      <Card className="subscription-panel">
                        <Card.Body>
                          <div className="subscription-panel__header">
                            <div>
                              <h3>Volume Trends</h3>
                              <p>Interested, super interested, A La Carte chats, and Queens Bundle chats over time.</p>
                            </div>
                          </div>
                          <div className="subscription-chart">
                            <Bar data={subscriptionTrendData} options={chartOptions} />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col lg={4}>
                      <Card className="subscription-panel">
                        <Card.Body>
                          <div className="subscription-panel__header">
                            <div>
                              <h3>Analytics Signals</h3>
                              <p>Quick checkpoints for purchase quality and girls chat mix.</p>
                            </div>
                          </div>
                          <div className="subscription-metrics">
                            <div className="subscription-metric">
                              <span>Completed Rate</span>
                              <strong>{formatPercent(completedRate)}</strong>
                            </div>
                            <div className="subscription-metric">
                              <span>Girls Chat Revenue</span>
                              <strong>{formatCurrency(girlsChatRevenue)}</strong>
                            </div>
                            <div className="subscription-metric">
                              <span>Queens Bundle Share</span>
                              <strong>{formatPercent(girlsChatBundleShare)}</strong>
                            </div>
                            <div className="subscription-metric">
                              <span>Queens Bundle Purchases</span>
                              <strong>
                                {formatNumber(analyticsData.chatBreakdown?.queensBundlePurchases)}
                              </strong>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Row className="g-3">
                    <Col lg={6}>
                      <Card className="subscription-panel">
                        <Card.Body>
                          <div className="subscription-panel__header">
                            <div>
                              <h3>Girls Chat Breakdown</h3>
                              <p>Separate package-level analytics for women’s chat purchases.</p>
                            </div>
                          </div>
                          <div className="subscription-stat-grid">
                            <div className="subscription-stat-card">
                              <span>Total Girls Chats</span>
                              <strong>{formatNumber(analyticsData.chatBreakdown?.totalChats)}</strong>
                            </div>
                            <div className="subscription-stat-card">
                              <span>A La Carte Chats</span>
                              <strong>{formatNumber(analyticsData.chatBreakdown?.aLaCarteChats)}</strong>
                            </div>
                            <div className="subscription-stat-card">
                              <span>Queens Bundle Chats</span>
                              <strong>{formatNumber(analyticsData.chatBreakdown?.queensBundleChats)}</strong>
                            </div>
                            <div className="subscription-stat-card">
                              <span>A La Carte Revenue</span>
                              <strong>{formatCurrency(analyticsData.chatBreakdown?.aLaCarteRevenue)}</strong>
                            </div>
                            <div className="subscription-stat-card">
                              <span>Queens Bundle Revenue</span>
                              <strong>{formatCurrency(analyticsData.chatBreakdown?.queensBundleRevenue)}</strong>
                            </div>
                            <div className="subscription-stat-card">
                              <span>Bundle Orders</span>
                              <strong>{formatNumber(analyticsData.chatBreakdown?.queensBundleOrders)}</strong>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col lg={6}>
                      <Card className="subscription-panel">
                        <Card.Body>
                          <div className="subscription-panel__header">
                            <div>
                              <h3>Payment Status Detail</h3>
                              <p>Operational view of which statuses are driving volume and revenue.</p>
                            </div>
                          </div>
                          <div className="subscription-table-wrap">
                            <Table striped bordered hover variant="dark" className="subscription-table">
                              <thead>
                                <tr>
                                  <th>Status</th>
                                  <th>Count</th>
                                  <th>Revenue</th>
                                  <th>Chat</th>
                                </tr>
                              </thead>
                              <tbody>
                                {analyticsData.paymentStatusBreakdown.length ? (
                                  analyticsData.paymentStatusBreakdown.map((item) => (
                                    <tr key={item.status}>
                                      <td>
                                        <Badge bg={statusTone(item.status)}>{item.status}</Badge>
                                      </td>
                                      <td>{formatNumber(item.count)}</td>
                                      <td>{formatCurrency(item.revenue)}</td>
                                      <td>{formatNumber(item.chatTokens)}</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="4" className="text-center">
                                      No status data found for the current filters.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </Table>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Card className="subscription-panel">
                    <Card.Body>
                      <div className="subscription-panel__header">
                        <div>
                          <h3>Product Breakdown</h3>
                          <p>Revenue, order count, and unit volume by product.</p>
                        </div>
                      </div>
                      <div className="subscription-table-wrap">
                        <Table striped bordered hover variant="dark" className="subscription-table">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Units</th>
                              <th>Orders</th>
                              <th>Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analyticsData.productBreakdown.length ? (
                              analyticsData.productBreakdown.map((product) => (
                                <tr key={product.key}>
                                  <td>{product.label}</td>
                                  <td>{formatNumber(product.units)}</td>
                                  <td>{formatNumber(product.orders)}</td>
                                  <td>{formatCurrency(product.revenue)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="text-center">
                                  No product breakdown data found for the current filters.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className="subscription-panel">
                    <Card.Body>
                      <div className="subscription-panel__header">
                        <div>
                          <h3>Top Buyers</h3>
                          <p>Highest spenders with the girls chat split shown separately.</p>
                        </div>
                      </div>
                      <div className="subscription-table-wrap">
                        <Table striped bordered hover variant="dark" className="subscription-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Username</th>
                              <th>Total Spent</th>
                              <th>Transactions</th>
                              <th>Interested</th>
                              <th>Super</th>
                              <th>A La Carte</th>
                              <th>Queens Bundle</th>
                              <th>Total Chat</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analyticsData.topBuyers.length ? (
                              analyticsData.topBuyers.map((buyer, index) => (
                                <tr key={`${buyer.username}-${index}`}>
                                  <td>{index + 1}</td>
                                  <td>{buyer.username || "Unknown"}</td>
                                  <td>{formatCurrency(buyer.totalSpent)}</td>
                                  <td>{formatNumber(buyer.transactionCount)}</td>
                                  <td>{formatNumber(buyer.interestedTokens)}</td>
                                  <td>{formatNumber(buyer.superInterestedTokens)}</td>
                                  <td>{formatNumber(buyer.aLaCarteChats)}</td>
                                  <td>{formatNumber(buyer.queensBundleChats)}</td>
                                  <td>{formatNumber(buyer.chatTokens)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="9" className="text-center">
                                  No buyer data found for the current filters.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className="subscription-panel">
                    <Card.Body>
                      <div className="subscription-panel__header">
                        <div>
                          <h3>Recent Transactions</h3>
                          <p>Latest payment records included in the current filter set.</p>
                        </div>
                      </div>
                      <div className="subscription-table-wrap">
                        <Table striped bordered hover variant="dark" className="subscription-table">
                          <thead>
                            <tr>
                              <th>User</th>
                              <th>Status</th>
                              <th>Amount</th>
                              <th>Interested</th>
                              <th>Super</th>
                              <th>A La Carte</th>
                              <th>Queens Bundle</th>
                              <th>Created</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analyticsData.recentTransactions.length ? (
                              analyticsData.recentTransactions.map((item) => (
                                <tr key={item.id}>
                                  <td>{item.username || "Unknown"}</td>
                                  <td>
                                    <Badge bg={statusTone(item.paymentStatus)}>
                                      {item.paymentStatus}
                                    </Badge>
                                  </td>
                                  <td>{formatCurrency(item.amount)}</td>
                                  <td>{formatNumber(item.interestedTokens)}</td>
                                  <td>{formatNumber(item.superInterestedTokens)}</td>
                                  <td>{formatNumber(item.aLaCarteChats)}</td>
                                  <td>{formatNumber(item.queensBundleChats)}</td>
                                  <td>{formatDateTime(item.createdAt)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="8" className="text-center">
                                  No recent transaction data found for the current filters.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>

                  <Row className="g-3">
                    <Col lg={5}>
                      <Card className="subscription-panel">
                        <Card.Body>
                          <div className="subscription-panel__header">
                            <div>
                              <h3>Token Mix</h3>
                              <p>How purchased units split across the full token catalog.</p>
                            </div>
                          </div>
                          <div className="subscription-chart subscription-chart--small">
                            <Doughnut data={tokenDistributionData} options={doughnutOptions} />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col lg={7}>
                      <Card className="subscription-panel">
                        <Card.Body>
                          <div className="subscription-panel__header">
                            <div>
                              <h3>Filter Scope</h3>
                              <p>These values make it easier to validate that the dashboard is looking at the right data slice.</p>
                            </div>
                          </div>
                          <div className="subscription-stat-grid">
                            <div className="subscription-stat-card">
                              <span>Completed Transactions</span>
                              <strong>{formatNumber(analyticsData.completedTransactions)}</strong>
                            </div>
                            <div className="subscription-stat-card">
                              <span>Pending Transactions</span>
                              <strong>{formatNumber(analyticsData.pendingTransactions)}</strong>
                            </div>
                            <div className="subscription-stat-card">
                              <span>Failed Transactions</span>
                              <strong>{formatNumber(analyticsData.failedTransactions)}</strong>
                            </div>
                            <div className="subscription-stat-card">
                              <span>Total Filtered Revenue</span>
                              <strong>{formatCurrency(analyticsData.totalRevenue)}</strong>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </>
              )}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </div>
  );
};

export default SubscriptionAnalytics;
