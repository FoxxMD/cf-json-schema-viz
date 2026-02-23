import { clsx } from 'clsx';
import { Atom, useAtomValue } from 'jotai';
import * as React from 'react';

interface DividerProps {
  hoveredAtom: Atom<boolean>;
}

export const Divider: React.FC<DividerProps> = ({ hoveredAtom }) => {
  const isHovered = useAtomValue(hoveredAtom);

  return (
    <span className={clsx('jsv-divider', isHovered && 'jsv-divider-visible')} />
  );
};
