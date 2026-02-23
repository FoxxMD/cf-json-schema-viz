import { isPlainObject } from '@stoplight/json';
import type { SchemaFragment, SchemaNode } from '@stoplight/json-schema-tree';

// for easier debugging the values going into hash
let SKIP_HASHING = false;

export const setSkipHashing = (skip: boolean) => {
  SKIP_HASHING = skip;
};

// Simple FNV-1a 52-bit hash implementation
// This produces the same output as fnv.fast1a52hex()
function fnv1a52(str: string): string {
  const FNV_PRIME = 0x01000193;
  const FNV_OFFSET = 0x811c9dc5;
  
  let hash = FNV_OFFSET;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  
  // Convert to unsigned 32-bit and then to hex
  const hash32 = hash >>> 0;
  return hash32.toString(16).padStart(8, '0');
}

export const hash = (value: string, skipHashing: boolean = SKIP_HASHING): string => {
  // Never change this, as it would affect how the default stable id is generated, and cause mismatches with whatever
  // we already have stored in our DB etc.
  return skipHashing ? value : fnv1a52(value);
};

function getStoplightId(fragment: SchemaFragment | boolean): string | undefined {
  if (typeof fragment === 'boolean') return undefined;
  const xStoplight = fragment['x-stoplight' as keyof typeof fragment];
  if (isPlainObject(xStoplight)) {
    const id = (xStoplight as Record<string, unknown>).id;
    return typeof id === 'string' ? id : undefined;
  }
  return undefined;
}

export const getNodeId = (node: SchemaNode, parentId?: string): string => {
  const nodeId = getStoplightId(node.fragment);
  if (nodeId) return nodeId;

  const key = node.path[node.path.length - 1];

  return hash(['schema_property', parentId, String(key)].join('-'));
};

export const getOriginalNodeId = (node: SchemaNode, parentId?: string): string => {
  // @ts-expect-error originalFragment does exist...
  const nodeId = getStoplightId(node.originalFragment);
  if (nodeId) return nodeId;

  const key = node.path[node.path.length - 1];

  return hash(['schema_property', parentId, String(key)].join('-'));
};
