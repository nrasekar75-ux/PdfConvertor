import { useState } from 'react';
import { Upload, Download, Loader, Trash2 } from 'lucide-react';
import { mergePdfs, downloadBlob } from '../../services/pdfService';
import { ToolLayout } from '../ToolLayout';

export function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles([...files, ...selectedFiles]);
    setError('');
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files');
      return;
    }

    setLoading(true);
    try {
      const blob = await mergePdfs(files);
      downloadBlob(blob, 'merged.pdf');
    } catch (err) {
      setError('Merge failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      toolName="Merge PDFs"
      toolDescription="Combine multiple PDF files into one document"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg p-8 shadow-md">
          <label className="block">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Click to upload PDFs or drag and drop</p>
              <p className="text-gray-400 text-sm">Select multiple PDF files</p>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </label>

          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Files to merge ({files.length})</h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-red-50 text-red-600 rounded transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleMerge}
            disabled={files.length < 2 || loading}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Merging...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Merge PDFs</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About this tool</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Combine unlimited PDF files</span>
            </li>
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Maintain order with drag & drop</span>
            </li>
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Merge all file sizes</span>
            </li>
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Fast processing</span>
            </li>
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Download merged file instantly</span>
            </li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
