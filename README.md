# cf-json-schema-viz

A lightweight, CSS-in-JS-free React component for rendering JSON Schema definitions in a collapsible tree view.

**This is a fork of [@stoplight/json-schema-viewer](https://github.com/stoplightio/json-schema-viewer)**, rewritten to remove Tailwind CSS and other heavy dependencies, making it suitable for use as a standalone package in documentation sites.

## Why This Fork?

The original `@stoplight/json-schema-viewer` is an excellent component, but it relies on Stoplight's Mosaic design system which brings in Tailwind CSS and other dependencies that may conflict with existing styling systems. This fork:

- **No Tailwind CSS** - Uses pure CSS with CSS custom properties for theming
- **No Mosaic dependencies** - Removed `@stoplight/mosaic` and related packages
- **Smaller bundle** - Significantly reduced dependency footprint
- **CSS custom properties** - Easy theming via CSS variables
- **Dark mode support** - Built-in dark mode via `data-theme="dark"`

## Installation

```bash
npm install cf-json-schema-viz
# or
pnpm add cf-json-schema-viz
# or
yarn add cf-json-schema-viz
```

## Usage

```tsx
import { JsonSchemaViewer } from 'cf-json-schema-viz';
import 'cf-json-schema-viz/styles.css';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'The name of the item' },
    count: { type: 'integer', minimum: 0 },
  },
  required: ['name'],
};

function App() {
  return (
    <JsonSchemaViewer
      schema={schema}
      defaultExpandedDepth={2}
      maxHeight={500}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `schema` | `JSONSchema` | required | The JSON Schema to render |
| `defaultExpandedDepth` | `number` | `1` | How many levels to expand by default |
| `maxHeight` | `number` | - | Maximum height in pixels (enables scrolling) |
| `emptyText` | `string` | `'No schema defined'` | Text shown when schema is empty |
| `disableCrumbs` | `boolean` | `false` | Disable the breadcrumb header |
| `data-theme` | `'dark' \| 'light'` | - | Theme mode |

## Theming

The component uses CSS custom properties for theming. You can override these variables:

```css
:root {
  --jsv-font-sans: ui-sans-serif, system-ui, sans-serif;
  --jsv-font-mono: ui-monospace, monospace;
  --jsv-font-size: 0.875rem;
  
  --jsv-color-body: #1a1a1a;
  --jsv-color-muted: #6b7280;
  --jsv-color-border: #e5e7eb;
  --jsv-color-canvas: #f4f4f5;
  --jsv-color-bg: #ffffff;
  
  --jsv-color-primary: #f6821f;
  --jsv-color-danger: #dc2626;
  --jsv-color-warning: #f97316;
  --jsv-color-success: #16a34a;
}
```

For dark mode, the component automatically adjusts colors when `data-theme="dark"` is set on the component or a parent element.

## Features

- Full JSON Schema Draft 4+ support, including `oneOf` and `anyOf` combiners
- Renders nested objects to any depth
- Collapsible sections
- Validation properties display
- Markdown descriptions
- Sticky breadcrumb header showing current path when scrolling
- Keyboard accessible

## Credits

This project is a fork of [@stoplight/json-schema-viewer](https://github.com/stoplightio/json-schema-viewer) by [Stoplight](https://stoplight.io/). The core schema parsing is powered by [@stoplight/json-schema-tree](https://github.com/stoplightio/json-schema-tree).

## License

Apache-2.0 (same as the original project)
