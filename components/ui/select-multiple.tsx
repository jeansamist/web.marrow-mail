import { FunctionComponent, useState } from "react";

import MultipleSelector, { Option } from "./multiselect";

export const SelectMultiple: FunctionComponent<{
  items: Option[];
  value?: Option[];
  placeholder?: string;
  onValueChange?: (value: Option[]) => void;
}> = ({ items, onValueChange, value, placeholder }) => {
  const [_value, setValue] = useState(value);
  return (
    <div>
      <MultipleSelector
        commandProps={{
          label: placeholder,
        }}
        value={_value}
        options={items}
        placeholder={placeholder}
        hideClearAllButton
        onChange={(value) => {
          setValue(value);
          onValueChange && onValueChange(value);
        }}
        hidePlaceholderWhenSelected
        emptyIndicator={<p className="text-center text-sm">No results found</p>}
      />
    </div>
  );
};
