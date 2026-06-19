import { useEffect, useState } from "react";
import axios from "axios";
import { apiRequest } from "utils/Utilities";
import { apiURL } from "utils/Utilities";
import { getCookie } from "utils/cookie";
import { getActiveDateCount, getLatestDraftDate } from "utils/dateState";

export const CREATE_DATE_LIMIT_PATH = "/create-date/limit-reached";

// Redirect helper function
export const redirectToCreateDateLimit = (router) => {
  if (router?.replace) {
    router.replace(CREATE_DATE_LIMIT_PATH);
  } else if (router?.push) {
    router.push(CREATE_DATE_LIMIT_PATH);
  }
};

// Simple function: Check if user has 4+ active dates
export const checkCreateDateLimit = async ({ token, userName }) => {
  try {
    const res = await apiRequest({
      method: "GET",
      url: "date",
      token,
      timeout: 3000, // Reduced from 10s to 3s for faster response
      params: {
        user_name: userName,
        current_page: 1,
        per_page: 100,
      },
    });

    const dates = res?.data?.data?.dates || [];
    const activeCount = getActiveDateCount(dates);
    
    return {
      isBlocked: activeCount >= 4,
      activeCount,
      totalDates: dates.length,
    };
  } catch (error) {
    // On error, allow access (fail open for better UX)
    console.error("Failed to check date limit:", error);
    return {
      isBlocked: false,
      activeCount: 0,
      totalDates: 0,
      error: error.message,
    };
  }
};

// React hook for pages
export const useCreateDateAccessGuard = ({ router, token, userName, enabled = true }) => {
  const [isChecking, setIsChecking] = useState(enabled);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (!enabled || !router?.isReady || !token || !userName) {
      setIsChecking(false);
      setIsBlocked(false);
      return;
    }

    let mounted = true;

    const check = async () => {
      const result = await checkCreateDateLimit({ token, userName });
      
      if (!mounted) return;
      
      setIsBlocked(result.isBlocked);
      setIsChecking(false);
      
      if (result.isBlocked) {
        router.replace(CREATE_DATE_LIMIT_PATH);
      }
    };

    check();

    return () => { mounted = false; };
  }, [enabled, router?.isReady, token, userName]);

  return { isCheckingLimit: isChecking, isLimitBlocked: isBlocked };
};

// Server-side check
export const createDateLimitServerSideProps = async (context = {}) => {
  try {
    const { query = {}, req } = context;

    // Skip check for edit modes
    if (query?.new_edit || query?.edit) {
      return { props: {} };
    }

    const cookies = req?.headers?.cookie || "";
    
    // Get token
    const tokenMatch = cookies.match(/token=([^;]+)/);
    const token = tokenMatch?.[1];
    
    if (!token) {
      return { props: {} };
    }

    // Extract username from auth cookie
    let userName = "";
    const authMatch = cookies.match(/auth=([^;]+)/);
    
    if (authMatch) {
      try {
        const authData = JSON.parse(decodeURIComponent(authMatch[1]));
        userName = authData?.user?.user_name || authData?.user?.username || "";
      } catch (e) {
        console.error("Failed to parse auth cookie:", e.message);
        return { props: {} };
      }
    }

    if (!userName) {
      return { props: {} };
    }

    // Check limit via API
    const response = await axios({
      method: "GET",
      url: `${apiURL.replace(/\/$/, "")}/api/v1/date`,
      headers: { Authorization: `Bearer ${token}` },
      params: { 
        user_name: userName,
        current_page: 1, 
        per_page: 100 
      },
      timeout: 10000,
    });

    const dates = response?.data?.data?.dates || [];
    const activeCount = getActiveDateCount(dates);

    if (activeCount >= 4) {
      return {
        redirect: {
          destination: CREATE_DATE_LIMIT_PATH,
          permanent: false,
        },
      };
    }

    return { props: {} };
  } catch (error) {
    // Catch ALL errors to prevent 500 crashes
    console.error("Server-side limit check error:", error.message);
    return { props: {} };
  }
};
