"use client";

import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfViewerProps {
  pdfUrl: string;
  pageNumber: number;
  scale: number;
  onLoadSuccess: (numPages: number) => void;
  onLoadError: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, pageNumber, scale, onLoadSuccess, onLoadError }) => {
  return (
    <Document
      file={pdfUrl}
      onLoadSuccess={({ numPages }) => onLoadSuccess(numPages)}
      onLoadError={onLoadError}
      loading={null}
    >
      <div className="flex flex-col items-center">
        <Page
          pageNumber={pageNumber}
          scale={scale}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="shadow-2xl rounded-sm overflow-hidden"
          loading={
            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-emerald-400 animate-spin" />
                <p className="text-xs text-white/40">Loading page...</p>
              </div>
            </div>
          }
        />
      </div>
    </Document>
  );
};

export default PdfViewer;
