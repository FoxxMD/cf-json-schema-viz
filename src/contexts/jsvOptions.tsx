import * as React from 'react';

import { ExtensionAddonRenderer, GoToRefHandler, RowAddonRenderer, ViewMode } from '../types';

export type ChangeType = 'added' | 'removed' | 'modified';

export type NodeHasChangedFn = (props: {
  nodeId: string;
  mode?: 'read' | 'write';
}) => { type: ChangeType } | undefined;

export type JSVOptions = {
  defaultExpandedDepth: number;
  viewMode: ViewMode;
  onGoToRef?: GoToRefHandler;
  renderRowAddon?: RowAddonRenderer;
  renderExtensionAddon?: ExtensionAddonRenderer;
  hideExamples?: boolean;
  renderRootTreeLines?: boolean;
  disableCrumbs?: boolean;
  nodeHasChanged?: NodeHasChangedFn;
};

const JSVOptionsContext = React.createContext<JSVOptions>({
  defaultExpandedDepth: 0,
  viewMode: 'standalone',
  hideExamples: false,
});

export const useJSVOptionsContext = () => React.useContext(JSVOptionsContext);

export const JSVOptionsContextProvider = JSVOptionsContext.Provider;
