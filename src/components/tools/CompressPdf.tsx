import { useState } from 'react';
import { Upload, Download, Loader } from 'lucide-react';
import { compressPdf, downloadBlob } from '../../services/pdfService';
import { ToolLayout } from '../ToolLayout';

export function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [originalSize, setOriginalSize] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      setError('');
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
    } catch (err) {
      setError('Failed to read PDF file');
      setFile(null);
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const blob = await compressPdf(file);
      const reduction = ((1 - blob.size / originalSize) * 100).toFixed(1);
      const filename = `${file.name.replace('.pdf', '')}-compressed.pdf`;
      downloadBlob(blob, filename);
      setError(`Successfully compressed! Size reduced by ${reduction}%`);
      setFile(null);
    } catch (err) {
      setError('Compression failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      toolName="Compress PDF"
      toolDescription="Reduce PDF file size while maintaining quality"
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
              <p className="text-sm text-gray-600">Original size: {(originalSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}

          {error && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              error.includes('Successfully')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {error}
            </div>
          )}

          <button
            onClick={handleCompress}
            disabled={!file || loading}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Compressing...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Compress PDF</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About this tool</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Reduce PDF file size by up to 90%</span>
            </li>
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Maintains acceptable quality</span>
            </li>
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Works with large files</span>
            </li>
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Perfect for email sharing</span>
            </li>
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Instant compression</span>
            </li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
