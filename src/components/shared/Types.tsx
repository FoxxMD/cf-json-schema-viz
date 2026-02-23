import {
  isBooleanishNode,
  isReferenceNode,
  isRegularNode,
  RegularNode,
  SchemaCombinerName,
  SchemaNode,
  SchemaNodeKind,
} from '@stoplight/json-schema-tree';
import * as React from 'react';

import { printName } from '../../utils';
import { getApplicableFormats } from '../../utils/getApplicableFormats';

function shouldRenderName(type: SchemaNodeKind | SchemaCombinerName | '$ref'): boolean {
  return type === SchemaNodeKind.Array || type === SchemaNodeKind.Object || type === '$ref';
}

function getTypes(schemaNode: RegularNode): Array<SchemaNodeKind | SchemaCombinerName> {
  return [schemaNode.types, schemaNode.combiners].reduce<Array<SchemaNodeKind | SchemaCombinerName>>(
    (values, value) => {
      if (value === null) {
        return values;
      }

      values.push(...value);
      return values;
    },
    [],
  );
}

export const Types: React.FC<{ schemaNode: SchemaNode }> = ({ schemaNode }) => {
  if (isReferenceNode(schemaNode)) {
    return (
      <span className="jsv-type" data-test="property-type-ref">
        {schemaNode.value ?? '$ref'}
      </span>
    );
  }

  if (isBooleanishNode(schemaNode)) {
    return (
      <span className="jsv-type" data-test="property-type">
        {schemaNode.fragment ? 'any' : 'never'}
      </span>
    );
  }

  if (!isRegularNode(schemaNode)) {
    return null;
  }

  const formats = getApplicableFormats(schemaNode);
  const types = getTypes(schemaNode);

  if (types.length === 0) {
    return (
      <span className="jsv-type" data-test="property-type">
        {formats === null ? 'any' : `<${formats[1]}>`}
      </span>
    );
  }

  const rendered = types.map((type, i, { length }) => {
    let printedName;
    if (shouldRenderName(type)) {
      printedName = printName(schemaNode);
    }

    printedName ??= type + (formats === null || formats[0] !== type ? '' : `<${formats[1]}>`);

    return (
      <React.Fragment key={type}>
        <span className="jsv-type" data-test="property-type">
          {printedName}
        </span>

        {i < length - 1 && (
          <span key={`${i}-sep`} className="jsv-type">
            {' or '}
          </span>
        )}
      </React.Fragment>
    );
  });

  return rendered.length > 1 ? <span className="truncate">{rendered}</span> : <>{rendered}</>;
};

Types.displayName = 'JsonSchemaViewer.Types';
