type GtagEventParams = Record<string, string | number | boolean>;

type GtagWindow = Window & {
  gtag?: (
    command: "event",
    eventName: string,
    params?: GtagEventParams,
  ) => void;
};

function trackEvent(eventName: string, params?: GtagEventParams) {
  if (typeof window === "undefined") {
    return;
  }

  const gtag = (window as GtagWindow).gtag;

  if (typeof gtag !== "function") {
    return;
  }

  try {
    gtag("event", eventName, params);
  } catch {
    // Analytics must never block diagnosis result navigation.
  }
}

export function trackDiagnosisComplete(typeCode: string) {
  trackEvent("diagnosis_complete", {
    type_code: typeCode,
  });
}
