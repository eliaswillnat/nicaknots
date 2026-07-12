import { useLayoutEffect, useRef, useState } from 'react';
import { InvoicePreview } from './InvoicePreview';
import type { InvoiceData, SellerDetails } from './invoice';

type InvoicePreviewFrameProps = {
  invoice: InvoiceData;
  seller: SellerDetails;
};

const A4_WIDTH_PX = 210 / 25.4 * 96;
const A4_HEIGHT_PX = 297 / 25.4 * 96;

export function InvoicePreviewFrame({ invoice, seller }: InvoicePreviewFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const updateScale = () => setScale(Math.min(1, frame.clientWidth / A4_WIDTH_PX));
    const observer = new ResizeObserver(updateScale);
    updateScale();
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="preview-scroll" ref={frameRef}>
      <div className="preview-canvas" style={{ height: A4_HEIGHT_PX * scale }}>
        <div className="preview-scale" style={{ transform: `scale(${scale})` }}>
          <InvoicePreview invoice={invoice} seller={seller} />
        </div>
      </div>
    </div>
  );
}

