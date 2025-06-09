import React from "react";
import Select from "react-select";
import { SelectGroup, Label, StyledSelect } from "../App-style";

export interface OptionType {
  value: string;
  label: string;
}

export const toneOptions: OptionType[] = [
  { value: "Formal", label: "Formal" },
  { value: "Casual", label: "Casual" },
  { value: "Polite Push", label: "Polite Push" },
  { value: "Concise & Direct", label: "Concise & Direct" },
  { value: "Humorous", label: "Humorous" },
  { value: "Creative", label: "Creative" },
];

export const languageOptions: OptionType[] = [
  { value: "English", label: "English" },
  { value: "Danish", label: "Dansk" },
  { value: "Chinese", label: "中文" },
];

// 自定义封装组件
interface CustomSelectProps {
  label: string;
  options: OptionType[];
  value: OptionType | null;
  onChange: (option: OptionType | null) => void;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
}) => (
  <SelectGroup>
    <Label>{label}</Label>
    <Select
      styles={StyledSelect}
      options={options}
      value={value}
      onChange={onChange}
      isSearchable={false}
    />
  </SelectGroup>
);