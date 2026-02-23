import { SchemaNode } from '@stoplight/json-schema-tree';
import { clsx } from 'clsx';
import * as React from 'react';

import { useJSVOptionsContext } from '../../contexts';
import { SchemaRow, SchemaRowProps } from '../SchemaRow';

type ChangeType = 'added' | 'removed' | 'modified';

type ChildStackProps = {
  schemaNode: SchemaNode;
  childNodes: readonly SchemaNode[];
  currentNestingLevel: number;
  className?: string;
  parentNodeId?: string;
  RowComponent?: React.FC<SchemaRowProps>;
  parentChangeType?: ChangeType;
};

export const ChildStack = React.memo(
  ({
    childNodes,
    currentNestingLevel,
    className,
    RowComponent = SchemaRow,
    parentNodeId,
    parentChangeType,
  }: ChildStackProps) => {
    const { renderRootTreeLines } = useJSVOptionsContext();
    const rootLevel = renderRootTreeLines ? 0 : 1;
    const isRootLevel = currentNestingLevel < rootLevel;

    return (
      <div
        className={clsx(
          'jsv-child-stack',
          !isRootLevel && 'jsv-child-stack-nested',
          className,
        )}
        data-level={currentNestingLevel}
      >
        {childNodes.map((childNode: SchemaNode) => (
          <RowComponent
            key={childNode.id}
            schemaNode={childNode}
            nestingLevel={currentNestingLevel + 1}
            parentNodeId={parentNodeId}
            parentChangeType={parentChangeType}
          />
        ))}
      </div>
    );
  },
);

ChildStack.displayName = 'ChildStack';
