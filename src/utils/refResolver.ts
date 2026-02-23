import { resolveInlineRef } from '@stoplight/json';

export type ReferenceInfo = {
  source: string | null;
  pointer: string | null;
};

export type ReferenceResolver = (ref: ReferenceInfo, propertyPath: string[] | null, currentObject?: object) => unknown;

export const defaultResolver =
  (contextObject: object): ReferenceResolver =>
  ({ pointer }, _, currentObject) => {
    const activeObject = contextObject ?? currentObject;

    if (pointer === null) {
      return null;
    }

    if (pointer === '#') {
      return activeObject;
    }

    const resolved = resolveInlineRef(activeObject as Record<string, unknown>, pointer);

    if (resolved) return resolved;

    throw new ReferenceError(`Could not resolve '${pointer}`);
  };
