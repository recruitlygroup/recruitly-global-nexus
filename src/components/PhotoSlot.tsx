// Real-photo slot. Loads /images/photos/<file>; falls back to a neutral block if the file is missing,
// so the layout never shows a broken image icon.
import { useState } from "react";

interface Props { file: string; alt: string; className?: string; }

const PhotoSlot = ({ file, alt, className = "" }: Props) => {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div role="img" aria-label={alt} className={`bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-semibold p-3 text-center ${className}`}>
        {alt}
      </div>
    );
  }
  return <img src={`/images/photos/${file}`} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
};

export default PhotoSlot;
