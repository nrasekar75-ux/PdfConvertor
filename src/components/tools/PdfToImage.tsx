import { useState } from 'react';
import { Upload, Download, Loader } from 'lucide-react';
import { pdfToImage, downloadBlob, getPdfInfo } from '../../services/pdfService';
import { ToolLayout } from '../ToolLayout';

export function PdfToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      setError('');
      setFile(selectedFile);
      const info = await getPdfInfo(selectedFile);
      setTotalPages(info.pages);
      setPageNumber(1);
    } catch (err) {
      setError('Failed to read PDF file');
      setFile(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const blob = await pdfToImage(file, pageNumber);
      const filename = `${file.name.replace('.pdf', '')}-page-${pageNumber}.png`;
      downloadBlob(blob, filename);
    } catch (err) {
      setError('Conversion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      toolName="PDF to Image"
      toolDescription="Convert PDF pages to high-quality PNG or JPG images"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg p-8 shadow-md">
          <label className="block">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Click to upload PDF or drag and drop</p>
              <p className="text-gray-400 text-sm">PDF files up to 50MB</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </label>

          {file && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <p className="text-sm text-gray-600">Total pages: {totalPages}</p>
            </div>
          )}

          {file && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Select Page
              </label>
              <input
                type="range"
                min="1"
                max={totalPages}
                value={pageNumber}
                onChange={(e) => setPageNumber(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-600 mt-2">Page {pageNumber} of {totalPages}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={!file || loading}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Convert to Image</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About this tool</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Convert any PDF page to PNG or JPG</span>
            </li>
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Select individual pages</span>
            </li>
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>High-quality output (2x zoom)</span>
            </li>
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>No file size limits</span>
            </li>
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Instant processing</span>
            </li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
