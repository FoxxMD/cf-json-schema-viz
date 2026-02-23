import { isReferenceNode, isRegularNode, ReferenceNode, SchemaNode, SchemaNodeKind } from '@stoplight/json-schema-tree';
import { Warning } from '@phosphor-icons/react';
import * as React from 'react';

import { isFlattenableNode } from '../../tree';
import { getInternalSchemaError } from '../../utils/getInternalSchemaError';

function useRefNode(schemaNode: SchemaNode) {
  return React.useMemo<ReferenceNode | null>(() => {
    if (isReferenceNode(schemaNode)) {
      return schemaNode;
    }

    if (
      isRegularNode(schemaNode) &&
      (isFlattenableNode(schemaNode) ||
        (schemaNode.primaryType === SchemaNodeKind.Array && schemaNode.children?.length === 1))
    ) {
      return (schemaNode.children?.find(isReferenceNode) as ReferenceNode | undefined) ?? null;
    }

    return null;
  }, [schemaNode]);
}

export const Error: React.FC<{ schemaNode: SchemaNode }> = ({ schemaNode }) => {
  const refNode = useRefNode(schemaNode);
  const error = getInternalSchemaError(schemaNode) ?? refNode?.error;

  if (typeof error !== 'string') return null;

  return (
    <span className="inline-block ml-1.5" title={error}>
      <Warning className="jsv-error" size={16} aria-label={error} />
    </span>
  );
};
