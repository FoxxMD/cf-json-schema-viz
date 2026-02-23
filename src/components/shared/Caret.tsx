import { CaretRight } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import * as React from 'react';

export interface CaretProps {
  isExpanded: boolean;
}

export const Caret: React.FC<CaretProps> = ({ isExpanded }) => (
  <span
    className={clsx('jsv-caret', isExpanded && 'jsv-caret-expanded')}
    role="button"
    aria-expanded={isExpanded}
  >
    <CaretRight size={12} weight="bold" />
  </span>
);
