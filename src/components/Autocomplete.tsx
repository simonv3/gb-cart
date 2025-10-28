import { useState } from "react";
import { useCombobox, autocomplete } from "@szhsin/react-autocomplete";
import { Input } from "./components";
import styled from "@emotion/styled";
import { debounce } from "lodash";
import React from "react";

const OptionList = styled.ul`
  li {
    padding: 8px 12px;
    &:hover {
      background: #eee;
    }
  }
`;

export type AutocompleteItem = {
  id: string;
  name: string;
  originalData?: unknown;
};

const Autocomplete: React.FC<{
  items?: AutocompleteItem[];
  label: string;
  selected?: AutocompleteItem;
  onSelectChange: (value?: AutocompleteItem) => void;
  fetchData?: (inputValue?: string) => Promise<AutocompleteItem[]>;
}> = ({
  items: existingItems = [],
  label,
  selected,
  onSelectChange,
  fetchData,
}) => {
  const [value, setValue] = useState<string>();
  const [items, setItems] = useState<AutocompleteItem[]>(existingItems);

  const filteredItems =
    value && !fetchData
      ? items.filter((item) =>
          item.name.toLowerCase().includes(value.toLowerCase())
        )
      : items;

  const debounced = React.useMemo(
    () =>
      debounce(async (inputValue?: string) => {
        if (fetchData) {
          const fetchedItems = await fetchData(inputValue);
          setItems(fetchedItems);
        }
      }, 1000),
    [fetchData]
  );

  const {
    getLabelProps,
    getInputProps,
    getClearProps,
    getToggleProps,
    getListProps,
    getItemProps,
    isItemSelected,
    open,
    focusIndex,
    isInputEmpty,
  } = useCombobox({
    items: filteredItems,
    getItemValue: (item) => item.name,
    value: value,
    onChange: (newValue) => {
      setValue(newValue);
      debounced(newValue);
    },
    selected,
    isEqual: (a, b) => a?.id === b?.id,
    onSelectChange,
    feature: autocomplete({
      // The `select` option controls autocomplete in free or select mode
      select: true, // or false
      // Other options: rovingText, deselectOnClear, deselectOnChange, closeOnSelect
    }),
  });

  return (
    <div style={{ position: "relative" }}>
      <label {...getLabelProps()} style={{ fontWeight: "bold" }}>
        {label}
      </label>
      <div>
        <Input placeholder="Select or type..." {...getInputProps()} />
        {!isInputEmpty && <button {...getClearProps()}>X</button>}
        <button {...getToggleProps()}>{open ? "↑" : "↓"}</button>
      </div>

      <OptionList
        {...getListProps()}
        style={{
          display: open ? "block" : "none",
          position: "absolute",
          listStyle: "none",
          color: "#000",
          background: "#fafafa",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
          overflow: "auto",
          maxHeight: 300,
          width: "100%",
          margin: 0,
          zIndex: 1,
          padding: 0,
        }}
      >
        {filteredItems.length ? (
          filteredItems.map((item, index) => (
            <li
              style={{
                background: isItemSelected(item)
                  ? "lightblue"
                  : focusIndex === index
                  ? "#ddd"
                  : "none",
                textDecoration: isItemSelected(item) ? "underline" : "none",
                width: "100%",
              }}
              key={item.id}
              {...getItemProps({ item, index })}
            >
              {item.name}
            </li>
          ))
        ) : (
          <li>{fetchData ? "Start typing to search..." : "No results"}</li>
        )}
      </OptionList>
    </div>
  );
};

export default Autocomplete;
