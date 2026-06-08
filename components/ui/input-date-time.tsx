"use client";

import { CalendarDateTime, getLocalTimeZone } from "@internationalized/date";
import { FunctionComponent, useState } from "react";
import { DateField, DateInput } from "./datefield-rac";

export const InputDateTime: FunctionComponent<{
  value?: Date | string;
  onChange?: (date: Date) => void;
}> = ({ value, onChange }) => {
  const [_value, setValue] = useState(() => {
    const jsDate = value
      ? typeof value === "string"
        ? new Date(value)
        : value
      : new Date(); // Your JavaScript Date object
    return new CalendarDateTime(
      jsDate.getFullYear(),
      jsDate.getMonth() + 1,
      jsDate.getDate(),
      jsDate.getHours(),
      jsDate.getMinutes(),
      jsDate.getSeconds(),
      jsDate.getMilliseconds(),
    );
  });
  return (
    <DateField
      granularity="minute"
      hourCycle={24}
      value={_value}
      onChange={(v) => {
        const date = v?.toDate(getLocalTimeZone());
        onChange && date && onChange(date);
        v && setValue(v);
      }}
    >
      <DateInput />
    </DateField>
  );
};
