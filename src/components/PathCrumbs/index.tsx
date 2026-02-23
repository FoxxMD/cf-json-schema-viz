import { useAtomValue } from 'jotai';
import * as React from 'react';

import { useJSVOptionsContext } from '../../contexts';
import { pathCrumbsAtom } from './state';

const SCROLL_THRESHOLD = 20; // pixels scrolled before showing crumbs

export const PathCrumbs: React.FC<{ parentCrumbs?: string[] }> = ({ parentCrumbs = [] }) => {
  const pathCrumbs = useAtomValue(pathCrumbsAtom);
  const { disableCrumbs } = useJSVOptionsContext();
  const crumbsRef = React.useRef<HTMLDivElement>(null);
  const [style, setStyle] = React.useState<React.CSSProperties>({
    position: 'fixed',
    top: -100, // Start off-screen
    left: 0,
    width: 0,
  });
  const [hasScrolled, setHasScrolled] = React.useState(false);

  // JS-based sticky positioning
  React.useEffect(() => {
    const crumbsEl = crumbsRef.current;
    if (!crumbsEl) return;

    const scrollContainer = crumbsEl.closest('.jsv-root') as HTMLElement;
    if (!scrollContainer) return;

    const updatePosition = () => {
      const containerRect = scrollContainer.getBoundingClientRect();
      const scrolled = scrollContainer.scrollTop > SCROLL_THRESHOLD;
      
      setHasScrolled(scrolled);
      setStyle({
        position: 'fixed',
        top: Math.max(0, containerRect.top),
        left: containerRect.left,
        width: containerRect.width,
      });
    };

    updatePosition();
    scrollContainer.addEventListener('scroll', updatePosition);
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      scrollContainer.removeEventListener('scroll', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  if (disableCrumbs) {
    return null;
  }

  const parentCrumbElems: React.ReactNode[] = [];
  parentCrumbs.forEach((crumb, i) => {
    parentCrumbElems.push(<span key={i}>{crumb}</span>);
  });

  const pathCrumbElems: React.ReactNode[] = [];
  pathCrumbs.forEach((crumb, i) => {
    if (pathCrumbs[i + 1]) {
      pathCrumbElems.push(<span key={i}>{crumb}</span>);
    } else {
      pathCrumbElems.push(
        <span key={i} className="jsv-crumb-current">
          {crumb}
        </span>,
      );
    }
  });

  // Only show content when there's at least one crumb to display AND user has scrolled
  const hasCrumbs = parentCrumbElems.length > 0 || pathCrumbElems.length > 0;
  const isVisible = hasCrumbs && hasScrolled;

  return (
    <div ref={crumbsRef} className="jsv-crumbs" style={style} data-visible={isVisible}>
      {parentCrumbElems.map((elem, i) => (
        <React.Fragment key={`parent-${i}`}>
          {elem}
          {i < parentCrumbElems.length - 1 && <span>/</span>}
        </React.Fragment>
      ))}
      {parentCrumbElems.length > 0 && pathCrumbElems.length > 0 && <span>/</span>}
      {pathCrumbElems.map((elem, i) => (
        <React.Fragment key={`path-${i}`}>
          {elem}
          {i < pathCrumbElems.length - 1 && <span style={{ fontWeight: 700 }}>.</span>}
        </React.Fragment>
      ))}
    </div>
  );
};
