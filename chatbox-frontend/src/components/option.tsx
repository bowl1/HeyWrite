import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "../lib/utils";

export type OptionType = {
  value: string;
  label: string;
};

export const toneOptions: OptionType[] = [
  { value: "Formal", label: "Formal" },
  { value: "Humorous", label: "Humorous" },
];

export const languageOptions: OptionType[] = [
  { value: "English", label: "English" },
  { value: "Danish", label: "Dansk" },
  { value: "Chinese", label: "中文" },
];

type CustomSelectProps = {
  label: string;
  options: OptionType[];
  value: OptionType | null;
  onChange: (option: OptionType | null) => void;
  className?: string;
};

export const CustomSelect = ({
  label,
  options,
  value,
  onChange,
  className,
}: CustomSelectProps) => (
  <div className="flex items-center gap-3">
    <label className="heading-caveat text-lg font-semibold text-slate-800 whitespace-nowrap">
      {label}
    </label>
    <Select
      value={value?.value}
      onValueChange={(val) => {
        const selected = options.find((opt) => opt.value === val) || null;
        onChange(selected);
      }}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
