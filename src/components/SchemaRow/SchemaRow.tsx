import { isMirroredNode, isReferenceNode, isRegularNode, SchemaNode } from '@stoplight/json-schema-tree';
import { clsx } from 'clsx';
import { useSetAtom } from 'jotai';
import * as React from 'react';

import { COMBINER_NAME_MAP } from '../../consts';
import { useJSVOptionsContext } from '../../contexts';
import { getNodeId, getOriginalNodeId } from '../../hash';
import { isPropertyRequired, visibleChildren } from '../../tree';
import { extractVendorExtensions } from '../../utils/extractVendorExtensions';
import {
  Caret,
  ChildStack,
  Description,
  Divider,
  Error,
  getValidationsFromSchema,
  NodeAnnotation,
  Properties,
  Select,
  Types,
  useHasProperties,
  Validations,
} from '../shared';
import { hoveredNodeAtom, isNodeHoveredAtom } from './state';
import { useChoices } from './useChoices';

type ChangeType = 'added' | 'removed' | 'modified';

export interface SchemaRowProps {
  schemaNode: SchemaNode;
  nestingLevel: number;
  pl?: number;
  parentNodeId?: string;
  parentChangeType?: ChangeType;
}

export const SchemaRow: React.FC<SchemaRowProps> = React.memo(
  ({ schemaNode, nestingLevel, pl, parentNodeId, parentChangeType }) => {
    const {
      defaultExpandedDepth,
      renderRowAddon,
      renderExtensionAddon,
      onGoToRef,
      hideExamples,
      renderRootTreeLines,
      nodeHasChanged,
      viewMode,
    } = useJSVOptionsContext();

    const setHoveredNode = useSetAtom(hoveredNodeAtom);

    const nodeId = getNodeId(schemaNode, parentNodeId);

    // @ts-expect-error originalFragment does exist...
    const originalNodeId = schemaNode.originalFragment?.$ref ? getOriginalNodeId(schemaNode, parentNodeId) : nodeId;
    const mode = viewMode === 'standalone' ? undefined : viewMode;
    const hasChanged = nodeHasChanged?.({ nodeId: originalNodeId, mode });

    const [isExpanded, setExpanded] = React.useState<boolean>(
      !isMirroredNode(schemaNode) && nestingLevel <= defaultExpandedDepth,
    );

    const { selectedChoice, setSelectedChoice, choices } = useChoices(schemaNode);
    const typeToShow = selectedChoice.type;
    const description = isRegularNode(typeToShow) ? typeToShow.annotations.description : null;

    const rootLevel = renderRootTreeLines ? 1 : 2;
    const childNodes = React.useMemo(() => visibleChildren(typeToShow), [typeToShow]);
    const combiner = isRegularNode(schemaNode) && schemaNode.combiners?.length ? schemaNode.combiners[0] : null;
    const isCollapsible = childNodes.length > 0;
    const isRootLevel = nestingLevel < rootLevel;

    const required = isPropertyRequired(schemaNode);
    const deprecated = isRegularNode(schemaNode) && schemaNode.deprecated;
    const validations = isRegularNode(schemaNode) ? schemaNode.validations : {};
    const hasProperties = useHasProperties({ required, deprecated, validations });

    const [totalVendorExtensions, vendorExtensions] = React.useMemo(
      () => extractVendorExtensions(schemaNode.fragment),
      [schemaNode.fragment],
    );
    const hasVendorProperties = totalVendorExtensions > 0;

    const annotationRootOffset = renderRootTreeLines ? 0 : 8;
    let annotationLeftOffset = -20 - annotationRootOffset;
    if (nestingLevel > 1) {
      annotationLeftOffset =
        -1 * 29 * Math.max(nestingLevel - 1, 1) - Math.min(nestingLevel, 2) * 2 - 16 - annotationRootOffset;

      if (!renderRootTreeLines) {
        annotationLeftOffset += 27;
      }
    }

    if (parentChangeType === 'added' && hasChanged && hasChanged.type === 'removed') {
      return null;
    }

    if (parentChangeType === 'removed' && hasChanged && hasChanged.type === 'added') {
      return null;
    }

    const lastSubpath = schemaNode.subpath.length > 0 ? schemaNode.subpath[schemaNode.subpath.length - 1] : null;
    const isHoveredAtom = isNodeHoveredAtom(schemaNode);

    return (
      <>
        <div
          className="jsv-row"
          style={{ paddingLeft: pl ? `${pl * 0.25}rem` : undefined }}
          data-id={originalNodeId}
          data-test="schema-row"
          onMouseEnter={(e) => {
            e.stopPropagation();
            setHoveredNode(selectedChoice.type);
          }}
        >
          {!isRootLevel && (
            <span className={clsx('jsv-nubbin', isCollapsible && 'jsv-nubbin-short')} />
          )}
          {parentChangeType !== 'added' && parentChangeType !== 'removed' ? (
            <NodeAnnotation change={hasChanged} style={{ left: annotationLeftOffset }} />
          ) : null}
          <div className={clsx('jsv-row-content', isCollapsible && !isRootLevel && 'jsv-ml-2')}>
            <div
              className={clsx('jsv-row-header', isCollapsible && 'jsv-cursor-pointer')}
              onClick={isCollapsible ? () => setExpanded(!isExpanded) : undefined}
            >
              {isCollapsible ? <Caret isExpanded={isExpanded} /> : null}
              <div className="jsv-types-container">
                {schemaNode.subpath.length > 0 && shouldShowPropertyName(schemaNode) && (
                  <span
                    className="jsv-property-name"
                    data-test={`property-name-${lastSubpath}`}
                  >
                    {lastSubpath}
                  </span>
                )}

                {choices.length === 1 && <Types schemaNode={typeToShow} />}

                {onGoToRef && isReferenceNode(schemaNode) && schemaNode.external ? (
                  <a
                    href="#"
                    className="jsv-link"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onGoToRef(schemaNode);
                    }}
                  >
                    (go to ref)
                  </a>
                ) : null}

                {schemaNode.subpath.length > 1 && schemaNode.subpath[0] === 'patternProperties' ? (
                  <span className="jsv-type jsv-ml-2">(pattern property)</span>
                ) : null}

                {choices.length > 1 && (
                  <Select
                    aria-label="Pick a type"
                    prefix={combiner ? `${COMBINER_NAME_MAP[combiner]}: ` : undefined}
                    options={choices.map((choice, index) => ({
                      value: String(index),
                      label: choice.title,
                    }))}
                    value={String(choices.indexOf(selectedChoice))}
                    onChange={selectedIndex => setSelectedChoice(choices[Number(selectedIndex)])}
                  />
                )}
              </div>
              {hasProperties && <Divider hoveredAtom={isHoveredAtom} />}
              <Properties required={required} deprecated={deprecated} validations={validations} />
            </div>
            {typeof description === 'string' &&
              (!combiner || schemaNode.parent?.fragment.description !== description) &&
              description.length > 0 && <Description value={description} />}
            <Validations
              validations={isRegularNode(schemaNode) ? getValidationsFromSchema(schemaNode) : {}}
              hideExamples={hideExamples}
            />
            {hasVendorProperties && renderExtensionAddon ? (
              <div>{renderExtensionAddon({ schemaNode, nestingLevel, vendorExtensions })}</div>
            ) : null}
          </div>
          <Error schemaNode={schemaNode} />
          {renderRowAddon ? <div>{renderRowAddon({ schemaNode, nestingLevel })}</div> : null}
        </div>
        {isCollapsible && isExpanded ? (
          <ChildStack
            schemaNode={schemaNode}
            childNodes={childNodes}
            currentNestingLevel={nestingLevel}
            parentNodeId={nodeId}
            parentChangeType={parentChangeType ? parentChangeType : hasChanged ? hasChanged?.type : undefined}
          />
        ) : null}
      </>
    );
  },
);

SchemaRow.displayName = 'SchemaRow';

function shouldShowPropertyName(schemaNode: SchemaNode) {
  return (
    schemaNode.subpath.length === 2 &&
    (schemaNode.subpath[0] === 'properties' || schemaNode.subpath[0] === 'patternProperties')
  );
}
