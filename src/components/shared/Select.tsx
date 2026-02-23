import { Select as BaseSelect } from '@base-ui/react/select';
import { CaretDown, Check } from '@phosphor-icons/react';
import * as React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  'aria-label'?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
}

export const Select: React.FC<SelectProps> = ({
  'aria-label': ariaLabel,
  options,
  value,
  onChange,
  prefix,
}) => {
  return (
    <BaseSelect.Root
      value={value}
      onValueChange={(newValue) => {
        if (newValue !== null) {
          onChange(newValue);
        }
      }}
    >
      <BaseSelect.Trigger
        aria-label={ariaLabel}
        className="jsv-select-trigger"
      >
        <BaseSelect.Value placeholder="">
          {(val) => {
            const selectedOption = options.find(opt => opt.value === val);
            return (
              <>
                {prefix}
                {selectedOption?.label ?? val}
              </>
            );
          }}
        </BaseSelect.Value>
        <BaseSelect.Icon>
          <CaretDown size={12} />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner className="jsv-select-positioner" sideOffset={4}>
          <BaseSelect.Popup className="jsv-select-popup">
            {options.map(option => (
              <BaseSelect.Item
                key={option.value}
                value={option.value}
                className="jsv-select-item"
              >
                <BaseSelect.ItemIndicator className="jsv-select-item-indicator">
                  <Check size={12} weight="bold" />
                </BaseSelect.ItemIndicator>
                <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
};
