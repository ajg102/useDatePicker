export type Value = Date | undefined | (Date | undefined)[];

export interface StateDefinition {
  isVisible: boolean;
  visibleDate: Date;
  value: Value;
}

export enum ActionTypes {
  OpenCalendar,
  CloseCalendar,
  ToggleCalendar,
  NextMonth,
  PreviousMonth,
  OnChange,
  Reset,
}

export type Actions =
  | { type: ActionTypes.CloseCalendar }
  | { type: ActionTypes.OpenCalendar }
  | { type: ActionTypes.NextMonth }
  | { type: ActionTypes.PreviousMonth }
  | { type: ActionTypes.ToggleCalendar }
  | { type: ActionTypes.OnChange; payload: Date }
  | { type: ActionTypes.Reset };
