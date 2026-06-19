import { useEffect } from "react";

const CREATE_DATE_ROUTES = [
  "/create-date/choose-city",
  "/create-date/choose-date-type",
  "/create-date/date-event",
  "/create-date/duration",
  "/create-date/description",
  "/create-date/review",
];

const getModeSuffix = (router) => {
  if (router?.query?.new_edit) return "?new_edit=true";
  if (router?.query?.edit) return "?edit=true";
  return "";
};

export const getPreviousCreateDatePath = (router) => {
  const pathname = router?.pathname || "";
  const suffix = getModeSuffix(router);
  const currentIndex = CREATE_DATE_ROUTES.findIndex((route) =>
    pathname.includes(route.replace("/create-date/", ""))
  );

  if (currentIndex <= 0) {
    return "/user/user-list";
  }

  return `${CREATE_DATE_ROUTES[currentIndex - 1]}${suffix}`;
};

export const useCreateDateBrowserBack = (router) => {
  useEffect(() => {
    if (!router?.isReady) return undefined;
    if (!router?.pathname?.startsWith("/create-date/")) return undefined;

    const handleBeforePopState = () => {
      const previousPath = getPreviousCreateDatePath(router);
      router.replace(previousPath);
      return false;
    };

    router.beforePopState(handleBeforePopState);

    return () => {
      router.beforePopState(() => true);
    };
  }, [router]);
};
