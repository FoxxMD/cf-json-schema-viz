import { isPlainObject } from '@stoplight/json';
import { isRegularNode, RegularNode, SchemaFragment } from '@stoplight/json-schema-tree';
import { Menu } from '@base-ui/react/menu';
import { CaretDown } from '@phosphor-icons/react';
import * as React from 'react';

import { COMBINER_NAME_MAP } from '../../consts';
import { useJSVOptionsContext } from '../../contexts';
import { isComplexArray, isDictionaryNode, visibleChildren } from '../../tree';
import { extractVendorExtensions } from '../../utils/extractVendorExtensions';
import { ChildStack, Description, Error, getValidationsFromSchema, Validations } from '../shared';
import { SchemaRow, SchemaRowProps } from './SchemaRow';
import { useChoices } from './useChoices';

function isEmpty(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0;
}

function getStoplightId(fragment: SchemaFragment | boolean): string | undefined {
  if (typeof fragment === 'boolean') return undefined;
  const xStoplight = fragment['x-stoplight' as keyof typeof fragment];
  if (isPlainObject(xStoplight)) {
    const id = (xStoplight as Record<string, unknown>).id;
    return typeof id === 'string' ? id : undefined;
  }
  return undefined;
}

export const TopLevelSchemaRow: React.FC<Pick<SchemaRowProps, 'schemaNode'> & { skipDescription?: boolean }> = ({
  schemaNode,
  skipDescription,
}) => {
  const { renderExtensionAddon } = useJSVOptionsContext();

  const { selectedChoice, setSelectedChoice, choices } = useChoices(schemaNode);
  const childNodes = React.useMemo(() => visibleChildren(selectedChoice.type), [selectedChoice.type]);
  const nestingLevel = 0;

  const nodeId = getStoplightId(schemaNode.fragment);
  
  const [totalVendorExtensions, vendorExtensions] = React.useMemo(
    () => extractVendorExtensions(schemaNode.fragment),
    [schemaNode.fragment],
  );
  const hasVendorProperties = totalVendorExtensions > 0;

  // oneOf/anyOf combiners get a dropdown selector - check this before object flattening
  if (isRegularNode(schemaNode) && choices.length > 1) {
    const combiner = isRegularNode(schemaNode) && schemaNode.combiners?.length ? schemaNode.combiners[0] : null;

    return (
      <>
        {schemaNode.annotations.description !== schemaNode.parent?.fragment.description && (
          <Description value={schemaNode.annotations.description} />
        )}
        <div className="jsv-top-section">
          <Menu.Root>
            <Menu.Trigger className="jsv-select-trigger">
              {selectedChoice.title}
              <CaretDown size={12} />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner className="jsv-select-positioner">
                <Menu.Popup className="jsv-select-popup">
                  {choices.map((choice, index) => (
                    <Menu.Item
                      key={index}
                      className="jsv-select-item"
                      onClick={() => setSelectedChoice(choice)}
                    >
                      {choice.title}
                    </Menu.Item>
                  ))}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>

          {combiner !== null ? (
            <span className="jsv-combiner-label">
              {`(${COMBINER_NAME_MAP[combiner]})`}
            </span>
          ) : null}
        </div>
        {childNodes.length > 0 ? (
          <ChildStack
            schemaNode={schemaNode}
            childNodes={childNodes}
            currentNestingLevel={nestingLevel}
            parentNodeId={nodeId}
          />
        ) : combiner ? (
          <SchemaRow schemaNode={selectedChoice.type} nestingLevel={nestingLevel} />
        ) : null}
      </>
    );
  }

  // regular objects are flattened at the top level
  if (isRegularNode(schemaNode) && isPureObjectNode(schemaNode)) {
    return (
      <>
        {!skipDescription ? <Description value={schemaNode.annotations.description} /> : null}
        {hasVendorProperties && renderExtensionAddon
          ? renderExtensionAddon({ schemaNode, nestingLevel, vendorExtensions })
          : null}
        <ChildStack
          schemaNode={schemaNode}
          childNodes={childNodes}
          currentNestingLevel={nestingLevel}
          parentNodeId={nodeId}
        />
        <Error schemaNode={schemaNode} />
      </>
    );
  }

  if (isComplexArray(schemaNode) && isPureObjectNode(schemaNode.children[0])) {
    const validations = isRegularNode(schemaNode) ? getValidationsFromSchema(schemaNode) : {};
    return (
      <>
        <Description value={schemaNode.annotations.description} />

        <div className="jsv-top-label">array of:</div>

        {!isEmpty(validations) && (
          <div className="jsv-validations" style={{ marginBottom: '0.25rem' }}>
            <Validations validations={validations} />
          </div>
        )}

        {childNodes.length > 0 ? (
          <ChildStack
            schemaNode={schemaNode}
            childNodes={childNodes}
            currentNestingLevel={nestingLevel}
            parentNodeId={nodeId}
          />
        ) : null}
      </>
    );
  }

  return <SchemaRow schemaNode={schemaNode} nestingLevel={nestingLevel} />;
};

function isPureObjectNode(schemaNode: RegularNode) {
  return schemaNode.primaryType === 'object' && schemaNode.types?.length === 1 && !isDictionaryNode(schemaNode);
}
