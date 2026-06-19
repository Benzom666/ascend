import { countriesCode, dateCategory } from "utils/Utilities";
import { formatDateDuration } from "utils/dateDuration";
import { normalizeImageIndex } from "utils/dateState";
import { checkCreateDateLimit } from "utils/createDateAccessGuard";
import { formatDisplayText } from "utils/formatDisplayText";

const STORAGE_KEY = "create_date_flow";
const VALID_CREATE_DATE_PATHS = [
  "/create-date/choose-city",
  "/create-date/choose-date-type",
  "/create-date/date-event",
  "/create-date/location",
  "/create-date/duration",
  "/create-date/description",
  "/create-date/review",
  "/create-date/success",
  "/create-date/limit-reached",
];
const STORAGE_VERSION = 2;
const FLOW_MODE_CREATE = "create";
const FLOW_MODE_DRAFT_EDIT = "draft-edit";
const FLOW_MODE_EXISTING_EDIT = "edit-existing";

const getDefaultStore = () => ({
  version: STORAGE_VERSION,
  activeKey: FLOW_MODE_CREATE,
  flows: {},
});

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getFlowMode = (flow = {}) => {
  if (flow?.flowMode) return flow.flowMode;
  if (flow?.editMode) return FLOW_MODE_EXISTING_EDIT;
  return FLOW_MODE_CREATE;
};

const getFlowKey = (flow = {}) => {
  if (flow?.flowKey) return flow.flowKey;

  const mode = getFlowMode(flow);
  const dateId = flow?.dateId ? String(flow.dateId) : "";

  if (mode === FLOW_MODE_EXISTING_EDIT) {
    return dateId ? `${FLOW_MODE_EXISTING_EDIT}:${dateId}` : FLOW_MODE_EXISTING_EDIT;
  }

  if (mode === FLOW_MODE_DRAFT_EDIT) {
    return dateId ? `${FLOW_MODE_DRAFT_EDIT}:${dateId}` : FLOW_MODE_DRAFT_EDIT;
  }

  return FLOW_MODE_CREATE;
};

const normalizeFlow = (flow = {}) => {
  if (!isPlainObject(flow)) return {};

  const normalized = { ...flow };
  const flowMode = getFlowMode(flow);
  normalized.flowMode = flowMode;
  normalized.editMode = flowMode === FLOW_MODE_EXISTING_EDIT;
  normalized.updatedAt = typeof flow.updatedAt === "number" ? flow.updatedAt : Date.now();
  return normalized;
};

const migrateLegacyStore = (rawValue) => {
  if (!isPlainObject(rawValue)) {
    return getDefaultStore();
  }

  if (isPlainObject(rawValue.flows)) {
    const flows = Object.entries(rawValue.flows).reduce((acc, [key, value]) => {
      if (!isPlainObject(value)) return acc;
      acc[key] = normalizeFlow(value);
      return acc;
    }, {});

    return {
      version: STORAGE_VERSION,
      activeKey:
        typeof rawValue.activeKey === "string" && rawValue.activeKey
          ? rawValue.activeKey
          : Object.keys(flows)[0] || FLOW_MODE_CREATE,
      flows,
    };
  }

  const migratedFlow = normalizeFlow(rawValue);
  const flowKey = getFlowKey(migratedFlow);

  return {
    version: STORAGE_VERSION,
    activeKey: flowKey,
    flows: {
      [flowKey]: migratedFlow,
    },
  };
};

const readStore = () => {
  if (typeof window === "undefined") return getDefaultStore();

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return getDefaultStore();

    return migrateLegacyStore(JSON.parse(rawValue));
  } catch (error) {
    console.error("Failed to read create date flow", error);
    return getDefaultStore();
  }
};

const writeStore = (store) => {
  if (typeof window === "undefined") return store;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return store;
  } catch (error) {
    console.error("Failed to write create date flow", error);
    return store;
  }
};

const getLatestFlow = (flows = []) =>
  [...flows].sort((left, right) => (right?.updatedAt || 0) - (left?.updatedAt || 0))[0];

const mapServerDraftToFlow = (draftedDate, user = {}) => {
  if (!draftedDate) return null;

  const selectedDateType = dateCategory.find(
    (item) =>
      item?.label === draftedDate?.standard_class_date ||
      item?.label === draftedDate?.middle_class_dates ||
      item?.label === draftedDate?.executive_class_dates
  );
  const countryName =
    Object.keys(countriesCode).find(
      (key) =>
        countriesCode[key]?.toLowerCase() ===
        draftedDate?.country_code?.toLowerCase()
    ) ||
    draftedDate?.country ||
    "";

  const draftedCity = {
    name: draftedDate?.location,
    country: draftedDate?.country_code
      ? [{ short_code: draftedDate?.country_code, text: countryName }]
      : [],
    label: draftedDate?.province
      ? `${formatDisplayText(draftedDate?.location)}, ${draftedDate?.province?.toUpperCase()}`
      : formatDisplayText(draftedDate?.location),
    province: draftedDate?.province
      ? [{ short_code: draftedDate?.province?.toUpperCase() }]
      : [],
  };

  return {
    flowMode: FLOW_MODE_DRAFT_EDIT,
    editMode: false,
    city: draftedCity.label,
    cityData: draftedCity,
    selectedDateType: selectedDateType?.id || null,
    selectedPrice: draftedDate?.price,
    selectedDuration: formatDateDuration(draftedDate?.date_length),
    selectedDurationValue: draftedDate?.date_length,
    description: draftedDate?.date_details || "",
    dateId: draftedDate?._id || draftedDate?.id,
    image_index: normalizeImageIndex(draftedDate?.image_index),
    selectedAspirationName: user?.aspirationName || "",
    selectedCategory: user?.categatoryId || "",
    selectedAspiration: user?.aspirationId || "",
  };
};

const findRelatedFlow = (store = getDefaultStore(), context = {}) => {
  if (!isPlainObject(context) || !isPlainObject(store?.flows)) return null;

  const flows = Object.values(store.flows).filter(isPlainObject);
  const requestedDateId = context?.dateId ? String(context.dateId) : "";
  const requestedMode = context?.flowMode || null;

  if (requestedDateId) {
    const sameDateFlows = flows.filter(
      (flow) => String(flow?.dateId || "") === requestedDateId
    );

    if (requestedMode) {
      const sameModeMatch = getLatestFlow(
        sameDateFlows.filter((flow) => getFlowMode(flow) === requestedMode)
      );
      if (sameModeMatch) return sameModeMatch;
    }

    const sameDateMatch = getLatestFlow(sameDateFlows);
    if (sameDateMatch) return sameDateMatch;
  }

  if (requestedMode) {
    const sameModeMatch = getLatestFlow(
      flows.filter((flow) => getFlowMode(flow) === requestedMode)
    );
    if (sameModeMatch) return sameModeMatch;
  }

  const activeFlow = store.flows?.[store.activeKey];
  return isPlainObject(activeFlow) ? activeFlow : null;
};

const resolveFlowKeyFromContext = (context = {}, store = readStore()) => {
  if (typeof context === "string") return context;

  if (isPlainObject(context) && (context.flowMode || context.flowKey || context.dateId)) {
    if (
      context.flowMode &&
      !context.dateId &&
      !context.flowKey &&
      isPlainObject(store?.flows)
    ) {
      const matchingFlow = getLatestFlow(
        Object.values(store.flows).filter(
          (flow) => getFlowMode(flow) === context.flowMode
        )
      );
      if (matchingFlow) {
        return getFlowKey(matchingFlow);
      }
    }

    return getFlowKey(context);
  }

  return store.activeKey || FLOW_MODE_CREATE;
};

const getCreateLikeFlows = (store = readStore()) =>
  Object.values(store.flows || {}).filter((flow) => {
    const mode = getFlowMode(flow);
    return mode === FLOW_MODE_CREATE || mode === FLOW_MODE_DRAFT_EDIT;
  });

const isDraftBackedCreateFlow = (flow) =>
  Boolean(flow?.dateId && getCreateDateResumePath(flow, { includeExistingEdit: false }));

const getUsableCreateLikeFlows = (store = readStore()) =>
  getCreateLikeFlows(store).filter((flow) =>
    Boolean(getCreateDateResumePath(flow, { includeExistingEdit: false }))
  );

const getFlowForWrite = (store, context = null) => {
  const flowKey = resolveFlowKeyFromContext(context, store);
  const existingFlow = store?.flows?.[flowKey];
  if (isPlainObject(existingFlow)) return existingFlow;

  return findRelatedFlow(store, context) || {};
};

export const readAllCreateDateFlows = () => {
  const store = readStore();
  return store.flows;
};

export const readCreateDateFlow = (context = null) => {
  const store = readStore();
  const flowKey = resolveFlowKeyFromContext(context, store);
  return store.flows?.[flowKey] || {};
};

export const writeCreateDateFlow = (nextValue, context = null) => {
  const store = readStore();
  const currentFlow = getFlowForWrite(store, context);
  const mergedFlow = normalizeFlow({ ...currentFlow, ...nextValue, ...context });
  const flowKey = getFlowKey(mergedFlow);

  store.flows[flowKey] = mergedFlow;
  store.activeKey = flowKey;

  writeStore(store);
  return mergedFlow;
};

export const activateCreateDateFlow = (context = {}) => {
  const store = readStore();
  const flowKey = resolveFlowKeyFromContext(context, store);
  const relatedFlow = findRelatedFlow(store, context);
  const currentFlow =
    store.flows[flowKey] || normalizeFlow({ ...(relatedFlow || {}), ...context });

  store.flows[flowKey] = normalizeFlow(currentFlow);
  store.activeKey = flowKey;
  writeStore(store);

  return store.flows[flowKey];
};

export const clearCreateDateFlow = (context = null) => {
  if (typeof window === "undefined") return;

  const store = readStore();
  const flowKey = resolveFlowKeyFromContext(context, store);

  delete store.flows[flowKey];

  const remainingFlowKeys = Object.keys(store.flows);
  if (!remainingFlowKeys.length) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  const latestCreateLikeFlow = getLatestFlow(getCreateLikeFlows(store));
  store.activeKey =
    getFlowKey(latestCreateLikeFlow || store.flows[remainingFlowKeys[0]]);

  writeStore(store);
};

export const clearAllCreateDateFlows = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
};

const normalizeCreateDatePath = (path) =>
  typeof path === "string" ? path.split("?")[0].split("#")[0] : "";

export const isValidCreateDatePath = (path) => {
  const normalizedPath = normalizeCreateDatePath(path);
  return VALID_CREATE_DATE_PATHS.includes(normalizedPath);
};

export const getCreateDateFlowMode = (flow = readCreateDateFlow()) =>
  getFlowMode(flow);

export const isExistingDateEditFlow = (flow = readCreateDateFlow()) =>
  getCreateDateFlowMode(flow) === FLOW_MODE_EXISTING_EDIT;

const withModeQuery = (path, flow) => {
  if (!path) return path;
  const mode = getCreateDateFlowMode(flow);
  if (mode === FLOW_MODE_EXISTING_EDIT) return `${path}?new_edit=true`;
  if (mode === FLOW_MODE_DRAFT_EDIT) return `${path}?edit=true`;
  return path;
};

export const getCreateDateResumePath = (
  flow = readCreateDateFlow(),
  options = {}
) => {
  const { includeExistingEdit = true } = options;
  const effectiveFlow =
    getCreateDateFlowMode(flow) === FLOW_MODE_CREATE && flow?.dateId
      ? { ...flow, flowMode: FLOW_MODE_DRAFT_EDIT }
      : flow;
  const mode = getCreateDateFlowMode(effectiveFlow);

  if (!includeExistingEdit && mode === FLOW_MODE_EXISTING_EDIT) {
    return null;
  }

  if (isValidCreateDatePath(effectiveFlow?.resumePath)) {
    return withModeQuery(
      effectiveFlow.resumePath.split("?")[0],
      effectiveFlow
    );
  }

  if (mode === FLOW_MODE_EXISTING_EDIT) {
    if (effectiveFlow?.dateId && effectiveFlow?.description) {
      return "/create-date/review?new_edit=true";
    }

    if (effectiveFlow?.selectedDuration || effectiveFlow?.selectedDurationValue) {
      return "/create-date/description?new_edit=true";
    }

    if (
      effectiveFlow?.selectedPrice ||
      effectiveFlow?.selectedCategory ||
      effectiveFlow?.selectedAspiration
    ) {
      return "/create-date/duration?new_edit=true";
    }

    if (effectiveFlow?.selectedDateType) {
      return "/create-date/date-event?new_edit=true";
    }

    return "/create-date/description?new_edit=true";
  }

  if (effectiveFlow?.dateId && effectiveFlow?.description) {
    return withModeQuery("/create-date/review", effectiveFlow);
  }

  if (effectiveFlow?.selectedDuration || effectiveFlow?.selectedDurationValue) {
    return withModeQuery("/create-date/description", effectiveFlow);
  }

  if (
    effectiveFlow?.selectedPrice ||
    effectiveFlow?.selectedCategory ||
    effectiveFlow?.selectedAspiration
  ) {
    return withModeQuery("/create-date/duration", effectiveFlow);
  }

  if (effectiveFlow?.selectedDateType) {
    return withModeQuery("/create-date/date-event", effectiveFlow);
  }

  if (effectiveFlow?.cityData || effectiveFlow?.city) {
    return withModeQuery("/create-date/choose-date-type", effectiveFlow);
  }

  return null;
};

export const persistCreateDateResumePath = (path, context = null) => {
  if (!isValidCreateDatePath(path)) return;
  writeCreateDateFlow({ resumePath: path }, context);
};

export const getCreateDateEntryPath = () => {
  const store = readStore();
  const activeFlow = readCreateDateFlow();
  const activeFlowMode = getCreateDateFlowMode(activeFlow);

  if (
    activeFlow &&
    activeFlowMode === FLOW_MODE_DRAFT_EDIT &&
    isDraftBackedCreateFlow(activeFlow)
  ) {
    return getCreateDateResumePath(activeFlow, { includeExistingEdit: false });
  }

  if (
    activeFlow &&
    activeFlowMode === FLOW_MODE_CREATE &&
    isDraftBackedCreateFlow(activeFlow)
  ) {
    return getCreateDateResumePath(activeFlow, { includeExistingEdit: false });
  }

  const latestCreateLikeFlow = getLatestFlow(
    getUsableCreateLikeFlows(store).filter(isDraftBackedCreateFlow)
  );
  if (latestCreateLikeFlow) {
    return (
      getCreateDateResumePath(latestCreateLikeFlow, {
        includeExistingEdit: false,
      }) || "/create-date/choose-city?showIntro=true"
    );
  }

  return "/create-date/choose-city?showIntro=true";
};

export const startOrResumeCreateDate = (router, context = {}) => {
  const startFlow = async () => {
    try {
      // CRITICAL FIX: Check for existing draft FIRST (no API call needed)
      // This prevents the flash of choose-city/popup when resuming a draft
      const existingFlow = readCreateDateFlow();
      const hasResumableDraft = existingFlow?.resumePath && 
        existingFlow.resumePath !== "/create-date/choose-city";

      if (hasResumableDraft) {
        // Resume existing draft directly without showing popup/choose-city
        console.log("Resuming draft at:", existingFlow.resumePath);
        await router.push(existingFlow.resumePath);
        return { status: "resumed" };
      }

      if (!context?.skipLimitCheck) {
        const knownActiveCount = Number(context?.activeDatesCount);
        const hasKnownActiveCount = Number.isFinite(knownActiveCount);
        const limitCheck = hasKnownActiveCount
          ? {
              isBlocked: knownActiveCount >= 4,
              activeCount: knownActiveCount,
            }
          : await checkCreateDateLimit({
              token: context?.token,
              userName: context?.userName,
            });

        if (limitCheck?.isBlocked) {
          clearCreateDateFlow({ flowMode: FLOW_MODE_CREATE });
          clearCreateDateFlow({ flowMode: FLOW_MODE_DRAFT_EDIT });
          activateCreateDateFlow({ flowMode: FLOW_MODE_CREATE });

          if (typeof context?.onLimitReached === "function") {
            context.onLimitReached(limitCheck);
          } else {
            await router.push("/create-date/limit-reached");
          }

          return { status: "blocked", ...limitCheck };
        }
      }

      clearCreateDateFlow();
      activateCreateDateFlow({
        flowMode: FLOW_MODE_CREATE,
        resumePath: "/create-date/choose-city",
      });

      await router.push("/create-date/choose-city");
      return { status: "started" };
    } catch (error) {
      console.error("Failed to preflight create date entry", error);
      
      // On error, still clear flows and start fresh
      clearCreateDateFlow();
      activateCreateDateFlow({
        flowMode: FLOW_MODE_CREATE,
        resumePath: "/create-date/choose-city",
        image_index: undefined,
      });
      
      await router.push("/create-date/choose-city");
      return { status: "started" };
    }
  };

  return startFlow();
};
