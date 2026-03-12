import * as React from 'react';
import { JsonSchemaViewerErrorBoundary } from '../JsonSchemaViewer';
import { useJSVOptionsContext } from '../../contexts';

const Markdown = React.lazy(async () => { 
  return await import ('react-markdown');
});

export interface DescriptionProps {
  value: unknown;
}

interface MarkupProps {
  value: string
}
const MarkupWithFallback: React.FC<MarkupProps> = ({value}) => {
  return (
    <JsonSchemaViewerErrorBoundary fallback={value}>
          <React.Suspense>
            <Markdown>{value}</Markdown>
          </React.Suspense>
        </JsonSchemaViewerErrorBoundary>
  );
}

export const Description: React.FC<DescriptionProps> = ({ value }) => {
  const [showAll, setShowAll] = React.useState(false);
  const {markup = false} = useJSVOptionsContext();

  if (typeof value !== 'string' || value.trim().length === 0) return null;

  const paragraphs = value.split('\n\n');

  if (paragraphs.length <= 1 || showAll) {
    return (
      <div className="jsv-description" data-test="property-description">
        {markup ? <MarkupWithFallback value={value}/>: value}
      </div>
    );
  }

  const firstParagraph = paragraphs[0];

  return (
    <div className="jsv-description" data-test="property-description">
      <p>
        <span className="mr-1">{markup ? <MarkupWithFallback value={firstParagraph}/>: firstParagraph}</span>
        <button
          type="button"
          className="text-jsv-primary cursor-pointer hover:underline"
          onClick={() => setShowAll(true)}
        >
          Show all...
        </button>
      </p>
    </div>
  );
};
