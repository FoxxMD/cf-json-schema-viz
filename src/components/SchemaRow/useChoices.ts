import { extractPointerFromRef, pointerToPath } from '@stoplight/json';
import { isReferenceNode, isRegularNode, SchemaNode } from '@stoplight/json-schema-tree';
import * as React from 'react';

import { isComplexArray, isNonEmptyParentNode } from '../../tree';
import { printName } from '../../utils';

/** one option among several mutually exclusive sub-schemas */
export type Choice = {
  title: string;
  type: SchemaNode;
};

function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

function calculateChoiceTitle(node: SchemaNode, isPlural: boolean, index?: number): string {
  const primitiveSuffix = isPlural ? 's' : '';
  if (isRegularNode(node)) {
    // Check for explicit title first
    const fragment = node.originalFragment as { 
      title?: string; 
      properties?: Record<string, unknown>;
      oneOf?: Array<{ title?: string }>;
      anyOf?: Array<{ title?: string }>;
    };
    if (fragment.title) {
      return fragment.title;
    }
    
    const realName = printName(node, { shouldUseRefNameFallback: true });
    if (realName) {
      return realName;
    }
    
    // For objects without a title, try to create a meaningful name
    if (node.primaryType === 'object') {
      // If this object contains a nested oneOf/anyOf, use titles from those
      const nestedCombiner = fragment.oneOf || fragment.anyOf;
      if (nestedCombiner && nestedCombiner.length > 0) {
        const nestedTitles = nestedCombiner
          .map(item => item.title)
          .filter((t): t is string => typeof t === 'string');
        if (nestedTitles.length > 0) {
          return nestedTitles.join(' / ');
        }
      }
      
      if (fragment.properties) {
        const propKeys = Object.keys(fragment.properties);
        if (propKeys.length > 0) {
          // Try to find a distinguishing property by looking at the first property's type
          const firstProp = fragment.properties[propKeys[0]] as { type?: string } | undefined;
          if (firstProp?.type && propKeys.length <= 3) {
            // e.g., "object (audio: object)" or "object (audio: string)"
            return `object (${propKeys[0]}: ${firstProp.type})`;
          }
          // Just list the property names if there are few
          if (propKeys.length <= 2) {
            return `object {${propKeys.join(', ')}}`;
          }
        }
      }
      // Fall back to "Option N" if we have an index
      if (typeof index === 'number') {
        return `Option ${index + 1}`;
      }
    }
    
    return node.primaryType !== null
      ? node.primaryType + primitiveSuffix
      : 'any';
  }
  if (isReferenceNode(node)) {
    if (node.value) {
      const value = extractPointerFromRef(node.value);
      const lastPiece = !node.error && value ? last(pointerToPath(value)) : null;
      if (typeof lastPiece === 'string') {
        return lastPiece.split('.')[0];
      }
    }
    return '$ref' + primitiveSuffix;
  }

  return 'any';
}

function makeChoice(node: SchemaNode, index?: number): Choice {
  return {
    type: node,
    title: calculateChoiceTitle(node, false, index),
  };
}

function makeArrayChoice(node: SchemaNode, combiner?: string): Choice {
  const itemTitle = calculateChoiceTitle(node, true);
  const title = itemTitle !== 'any' ? `array ${combiner ? `(${combiner})` : null} [${itemTitle}]` : 'array';
  return {
    type: node,
    title,
  };
}

/**
 * Enumerates the sub-schema type for a given node.
 *
 * Usually a node has one choice, only one possible type: itself. If a node is
 * a oneOf or anyOf combiner, the possible types are the sub-types of the
 * combiner.
 */
export const useChoices = (schemaNode: SchemaNode) => {
  const choices: Choice[] = React.useMemo(() => {
    // handle flattening of arrays that contain oneOfs, same logic as below
    if (
      isComplexArray(schemaNode) &&
      isNonEmptyParentNode(schemaNode.children[0]) &&
      shouldShowChildSelector(schemaNode.children[0])
    ) {
      return schemaNode.children[0].children.map(child =>
        makeArrayChoice(child, schemaNode.children[0].combiners?.[0]),
      );
    }

    // if current node is a combiner, offer its children
    if (isNonEmptyParentNode(schemaNode) && shouldShowChildSelector(schemaNode)) {
      return schemaNode.children.map((child, index) => makeChoice(child, index));
    }
    // regular node, single choice - itself
    return [makeChoice(schemaNode)];
  }, [schemaNode]);

  const defaultChoice = choices[0];

  const [selectedChoice, setSelectedChoice] = React.useState<Choice | undefined>(defaultChoice);

  React.useEffect(() => {
    setSelectedChoice(defaultChoice);
  }, [defaultChoice]);

  const actualSelectedChoice = selectedChoice && choices.includes(selectedChoice) ? selectedChoice : defaultChoice;

  return { selectedChoice: actualSelectedChoice, setSelectedChoice, choices };
};

const shouldShowChildSelector = (schemaNode: SchemaNode) =>
  isNonEmptyParentNode(schemaNode) && ['anyOf', 'oneOf'].includes(schemaNode.combiners?.[0] ?? '');
