import * as React from 'react';

import { useJSVOptionsContext } from '../../contexts';

export interface PropertiesProps {
  required: boolean;
  deprecated: boolean;
  validations: Record<string, unknown>;
}

export const useHasProperties = ({ required, deprecated, validations: { readOnly, writeOnly } }: PropertiesProps) => {
  const { viewMode } = useJSVOptionsContext();

  const showVisibilityValidations = viewMode === 'standalone' && !!readOnly !== !!writeOnly;

  return deprecated || showVisibilityValidations || required;
};

export const Properties: React.FC<PropertiesProps> = ({
  required,
  deprecated,
  validations: { readOnly, writeOnly },
}) => {
  const { viewMode } = useJSVOptionsContext();

  // Show readOnly writeOnly validations only in standalone mode and only if just one of them is present
  const showVisibilityValidations = viewMode === 'standalone' && !!readOnly !== !!writeOnly;
  const visibility = showVisibilityValidations ? (
    readOnly ? (
      <span className="jsv-badge jsv-badge-readonly" data-test="property-read-only">
        read-only
      </span>
    ) : (
      <span className="jsv-badge jsv-badge-readonly" data-test="property-write-only">
        write-only
      </span>
    )
  ) : null;

  return (
    <>
      {deprecated ? (
        <span className="jsv-badge jsv-badge-deprecated" data-test="property-deprecated">
          deprecated
        </span>
      ) : null}
      {visibility}
      {required && (
        <span className="jsv-badge jsv-badge-required" data-test="property-required">
          required
        </span>
      )}
    </>
  );
};
