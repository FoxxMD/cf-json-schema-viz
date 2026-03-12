import {
  isRegularNode,
  RootNode,
  SchemaTree as JsonSchemaTree,
  SchemaTreeRefDereferenceFn,
} from '@stoplight/json-schema-tree';
import { clsx } from 'clsx';
import { Provider, useSetAtom } from 'jotai';
import * as React from 'react';

import { JSVOptions, JSVOptionsContextProvider } from '../contexts';
import { shouldNodeBeIncluded } from '../tree/utils';
import { JSONSchema } from '../types';
import { PathCrumbs } from './PathCrumbs';
import { TopLevelSchemaRow } from './SchemaRow';
import { hoveredNodeAtom } from './SchemaRow/state';

export type JsonSchemaProps = Partial<JSVOptions> & {
  schema: JSONSchema;
  emptyText?: string;
  className?: string;
  resolveRef?: SchemaTreeRefDereferenceFn;
  /** Controls the level of recursion of refs. Prevents overly complex trees and running out of stack depth. */
  maxRefDepth?: number;
  onTreePopulated?: (props: { rootNode: RootNode; nodeCount: number }) => void;
  maxHeight?: number;
  parentCrumbs?: string[];
  skipTopLevelDescription?: boolean;
  /** Theme mode - set to "dark" for dark mode styling */
  'data-theme'?: 'dark' | 'light';
};

export const JsonSchemaViewer: React.FC<JsonSchemaProps> = ({
  viewMode = 'standalone',
  defaultExpandedDepth = 1,
  onGoToRef,
  renderRowAddon,
  renderExtensionAddon,
  hideExamples,
  renderRootTreeLines,
  disableCrumbs,
  nodeHasChanged,
  skipTopLevelDescription,
  markup,
  ...rest
}) => {
  const options = React.useMemo(
    () => ({
      defaultExpandedDepth,
      viewMode,
      onGoToRef,
      renderRowAddon,
      renderExtensionAddon,
      hideExamples,
      renderRootTreeLines,
      disableCrumbs,
      nodeHasChanged,
      markup
    }),
    [
      defaultExpandedDepth,
      viewMode,
      onGoToRef,
      renderRowAddon,
      renderExtensionAddon,
      hideExamples,
      renderRootTreeLines,
      disableCrumbs,
      nodeHasChanged,
      markup
    ],
  );

  return (
    <JSVOptionsContextProvider value={options}>
      <Provider>
        <JsonSchemaViewerInner
          viewMode={viewMode}
          skipTopLevelDescription={skipTopLevelDescription}
          {...rest}
        />
      </Provider>
    </JSVOptionsContextProvider>
  );
};

const JsonSchemaViewerInner: React.FC<
  Pick<
    JsonSchemaProps,
    | 'schema'
    | 'viewMode'
    | 'className'
    | 'resolveRef'
    | 'maxRefDepth'
    | 'emptyText'
    | 'onTreePopulated'
    | 'maxHeight'
    | 'parentCrumbs'
    | 'skipTopLevelDescription'
    | 'data-theme'
  >
> = ({
  schema,
  viewMode,
  className,
  resolveRef,
  maxRefDepth,
  emptyText = 'No schema defined',
  onTreePopulated,
  maxHeight,
  parentCrumbs,
  skipTopLevelDescription,
  'data-theme': dataTheme,
}) => {
  const setHoveredNode = useSetAtom(hoveredNodeAtom);
  const onMouseLeave = React.useCallback(() => {
    setHoveredNode(null);
  }, [setHoveredNode]);

  const { jsonSchemaTreeRoot, nodeCount } = React.useMemo(() => {
    const jsonSchemaTree = new JsonSchemaTree(schema, {
      mergeAllOf: true,
      refResolver: resolveRef,
      maxRefDepth,
    });

    let nodeCount = 0;

    jsonSchemaTree.walker.hookInto('filter', node => {
      if (shouldNodeBeIncluded(node, viewMode)) {
        nodeCount++;
        return true;
      }
      return false;
    });
    jsonSchemaTree.populate();

    return {
      jsonSchemaTreeRoot: jsonSchemaTree.root,
      nodeCount,
    };
  }, [schema, resolveRef, maxRefDepth, viewMode]);

  React.useEffect(() => {
    onTreePopulated?.({
      rootNode: jsonSchemaTreeRoot,
      nodeCount: nodeCount,
    });
  }, [jsonSchemaTreeRoot, onTreePopulated, nodeCount]);

  const isEmpty = React.useMemo(
    () => jsonSchemaTreeRoot.children.every(node => !isRegularNode(node) || node.unknown),
    [jsonSchemaTreeRoot],
  );

  if (isEmpty) {
    return (
      <div className={clsx('jsv-root', className)} data-test="empty-text" data-theme={dataTheme}>
        {emptyText}
      </div>
    );
  }

  return (
    <div
      className={clsx('jsv-root', className)}
      onMouseLeave={onMouseLeave}
      style={{ maxHeight, ...(maxHeight ? { overflowY: 'auto' } : {}) }}
      data-theme={dataTheme}
    >
      <PathCrumbs parentCrumbs={parentCrumbs} />
      <div className="jsv-content">
        <TopLevelSchemaRow schemaNode={jsonSchemaTreeRoot.children[0]} skipDescription={skipTopLevelDescription} />
      </div>
    </div>
  );
};

// Error boundary wrapper
export class JsonSchemaViewerErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{ padding: '1rem' }}>
          <strong style={{ color: 'var(--jsv-color-danger, #ef4444)' }}>Error</strong>
          {this.state.error !== null ? `: ${this.state.error.message}` : null}
        </div>
      );
    }

    return this.props.children;
  }
}
