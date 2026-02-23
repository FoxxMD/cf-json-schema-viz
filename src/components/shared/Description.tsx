import * as React from 'react';

export interface DescriptionProps {
  value: unknown;
}

export const Description: React.FC<DescriptionProps> = ({ value }) => {
  const [showAll, setShowAll] = React.useState(false);

  if (typeof value !== 'string' || value.trim().length === 0) return null;

  const paragraphs = value.split('\n\n');

  if (paragraphs.length <= 1 || showAll) {
    return (
      <div className="jsv-description" data-test="property-description">
        {value}
      </div>
    );
  }

  const firstParagraph = paragraphs[0];

  return (
    <div className="jsv-description" data-test="property-description">
      <p>
        <span className="mr-1">{firstParagraph}</span>
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
