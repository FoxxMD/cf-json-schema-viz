import { clsx } from 'clsx';
import * as React from 'react';

type ChangeType = 'added' | 'removed' | 'modified';

export interface NodeAnnotationProps {
  change?: { type: ChangeType } | null;
  style?: React.CSSProperties;
}

export const NodeAnnotation: React.FC<NodeAnnotationProps> = ({ change, style }) => {
  if (!change) return null;

  return (
    <span
      className={clsx(
        'jsv-annotation',
        change.type === 'added' && 'jsv-annotation-added',
        change.type === 'removed' && 'jsv-annotation-removed',
        change.type === 'modified' && 'jsv-annotation-modified',
      )}
      style={style}
      aria-label={`${change.type} property`}
    />
  );
};
