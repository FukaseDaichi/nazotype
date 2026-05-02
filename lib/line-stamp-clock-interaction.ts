export const LINE_STAMP_CLOCK_INTERACTION_EVENT =
  "nazotype:line-stamp-clock-interaction";

export type LineStampClockInteractionState = {
  isDragging: boolean;
  isPointerDragging: boolean;
  angleDeg: number;
  selectedHour: number | null;
};

const INITIAL_STATE: LineStampClockInteractionState = {
  isDragging: false,
  isPointerDragging: false,
  angleDeg: 0,
  selectedHour: null,
};

let currentState: LineStampClockInteractionState = INITIAL_STATE;
const listeners = new Set<() => void>();

export function normalizeClockAngle(angleDeg: number) {
  return ((angleDeg % 360) + 360) % 360;
}

export function getClockHourFromAngle(angleDeg: number) {
  const roundedIndex = Math.round(normalizeClockAngle(angleDeg) / 30) % 12;
  return roundedIndex === 0 ? 12 : roundedIndex;
}

export function getLineStampClockInteractionSnapshot() {
  return currentState;
}

export function getLineStampClockInteractionServerSnapshot() {
  return INITIAL_STATE;
}

export function subscribeLineStampClockInteraction(onStoreChange: () => void) {
  listeners.add(onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
  };
}

export function setLineStampClockInteractionState(
  nextState: LineStampClockInteractionState,
) {
  const normalizedState = {
    ...nextState,
    angleDeg: normalizeClockAngle(nextState.angleDeg),
  };
  const shouldNotify =
    currentState.isDragging !== normalizedState.isDragging ||
    currentState.isPointerDragging !== normalizedState.isPointerDragging ||
    currentState.selectedHour !== normalizedState.selectedHour;

  if (!shouldNotify && currentState.angleDeg === normalizedState.angleDeg) {
    return;
  }

  currentState = normalizedState;

  if (!shouldNotify) {
    return;
  }

  for (const listener of listeners) {
    listener();
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(LINE_STAMP_CLOCK_INTERACTION_EVENT, {
        detail: currentState,
      }),
    );
  }
}

export function resetLineStampClockInteractionState(angleDeg = 0) {
  setLineStampClockInteractionState({
    isDragging: false,
    isPointerDragging: false,
    angleDeg,
    selectedHour: null,
  });
}
