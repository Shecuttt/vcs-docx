import * as Diff from 'diff';

interface ParagraphDiffProps {
  p1: string;
  p2: string;
}

export default function ParagraphDiff({ p1, p2 }: ParagraphDiffProps) {
  // If exact match, just render normal
  if (p1 === p2) {
    return <div className="diff-paragraph">{p1}</div>;
  }

  // If one is empty
  if (!p1 && p2) {
    return <div className="diff-paragraph diff-added-para">{p2}</div>;
  }
  if (p1 && !p2) {
    return <div className="diff-paragraph diff-removed-para">{p1}</div>;
  }

  // Word level diff for modified paragraphs
  const diffParts = Diff.diffWords(p1, p2);

  return (
    <div className="diff-paragraph diff-modified-para">
      {diffParts.map((part, index) => {
        if (part.added) {
          return <span key={index} className="diff-word-added">{part.value}</span>;
        }
        if (part.removed) {
          return <span key={index} className="diff-word-removed">{part.value}</span>;
        }
        return <span key={index}>{part.value}</span>;
      })}
    </div>
  );
}
