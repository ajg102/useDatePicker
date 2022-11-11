import {
  add,
  compareAsc,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isAfter,
  isBefore,
  isEqual,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useReducer } from "react";
// import { useCallback, useState } from "react";
import { Actions, ActionTypes, StateDefinition } from "./types";

// function useReducer(reducer: any, initState: any) {
//   const [state, setState] = useState(initState);

//   const dispatch = useCallback(
//     (action: Actions) => {
//       const nextState = reducer(state, action);
//       setState(nextState);
//     },
//     [setState, state]
//   );

//   return [state, dispatch];
// }

const reducer = (state: StateDefinition, action: Actions) => {
  switch (action.type) {
    case ActionTypes.CloseCalendar: {
      if (!state.isVisible) return state;
      return {
        ...state,
        isVisible: false,
      };
    }
    case ActionTypes.OpenCalendar: {
      if (state.isVisible) return state;
      return { ...state, isVisible: true };
    }
    case ActionTypes.ToggleCalendar: {
      return { ...state, isVisible: !state.isVisible };
    }
    case ActionTypes.PreviousMonth: {
      return { ...state, visibleDate: add(state.visibleDate, { months: -1 }) };
    }
    case ActionTypes.NextMonth: {
      return { ...state, visibleDate: add(state.visibleDate, { months: 1 }) };
    }
    case ActionTypes.Reset: {
      return {
        ...state,
        value: Array.isArray(state.value) ? [undefined, undefined] : undefined,
      };
    }
    case ActionTypes.OnChange: {
      if (!(action.payload instanceof Date)) {
        console.warn("Invalid date type provided to onChange");
        return { ...state };
      }
      const currentValue = state.value;
      // if we are in single value mode

      if (!Array.isArray(currentValue)) {
        // if we already have a value and it is equal to the payload, clear value
        const newValue =
          currentValue && isEqual(action.payload, currentValue)
            ? undefined
            : action.payload;
        return {
          ...state,
          value: newValue,
        };
      }
      // otherwise we have a range
      const isExistingValueIndex = currentValue.findIndex(
        (item) => item && isEqual(item, action.payload)
      );

      if (isExistingValueIndex >= 0) {
        //if value included, remove it
        currentValue[isExistingValueIndex] = undefined;
        return { ...state, value: currentValue };
      }

      const firstUndefinedIndex = currentValue.findIndex((item) => !item);

      if (firstUndefinedIndex < 0) {
        if (isBefore(action.payload, currentValue[0] as Date)) {
          currentValue[0] = action.payload;
        } else if (isAfter(action.payload, currentValue[1] as Date)) {
          currentValue[1] = action.payload;
        } else {
          const dist1 = Math.abs(
            action.payload.getTime() - (currentValue[0] as Date).getTime()
          );
          const dist2 = Math.abs(
            action.payload.getTime() - (currentValue[1] as Date).getTime()
          );
          if (dist1 < dist2) {
            currentValue[0] = action.payload;
          } else {
            currentValue[1] = action.payload;
          }
        }
      } else {
        currentValue[firstUndefinedIndex] = action.payload;
      }

      return {
        ...state,
        value: currentValue.sort((a, b) => {
          if (!a || !b) return -100;
          return compareAsc(a, b);
        }),
      };
    }
    default:
      return state;
  }
};

const useDatePicker = (options?: any) => {
  const resolvedOptions = {
    fullWeek: false,
    range: false,
    ...options,
  };

  const [state, dispatch] = useReducer(reducer, {
    isVisible: false,
    visibleDate: startOfMonth(new Date()),
    value: resolvedOptions.range ? [undefined, undefined] : undefined,
  });

  const instance = {
    state,
    reset: () => dispatch({ type: ActionTypes.Reset }),
    nextMonth: () => dispatch({ type: ActionTypes.NextMonth }),
    prevMonth: () => dispatch({ type: ActionTypes.PreviousMonth }),
    openCalendar: () => dispatch({ type: ActionTypes.OpenCalendar }),
    closeCalendar: () => dispatch({ type: ActionTypes.CloseCalendar }),
    toggleCalendar: () => dispatch({ type: ActionTypes.ToggleCalendar }),
    onDateSelected: (value: Date) =>
      dispatch({ type: ActionTypes.OnChange, payload: value }),
    getVisibleDays: () =>
      eachDayOfInterval({
        start: resolvedOptions.fullWeek
          ? startOfWeek(startOfMonth(state.visibleDate))
          : startOfMonth(state.visibleDate),
        end: resolvedOptions.fullWeek
          ? endOfWeek(endOfMonth(state.visibleDate))
          : endOfMonth(state.visibleDate),
      }),
  };

  return instance;
};

export default useDatePicker;
