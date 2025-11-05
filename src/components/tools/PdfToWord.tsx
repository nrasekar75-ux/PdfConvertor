import { useState } from 'react';
import { Upload, Download, Loader } from 'lucide-react';
import { pdfToWord, downloadBlob } from '../../services/pdfService';
import { ToolLayout } from '../ToolLayout';

export function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      setError('');
      setFile(selectedFile);
    } catch (err) {
      setError('Failed to read PDF file');
      setFile(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const blob = await pdfToWord(file);
      const filename = `${file.name.replace('.pdf', '')}.docx`;
      downloadBlob(blob, filename);
      setFile(null);
    } catch (err) {
      setError('Conversion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      toolName="PDF to Word"
      toolDescription="Convert PDF documents to editable Word (.docx) format"
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
                <span>Convert to Word</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About this tool</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Convert PDF to editable DOCX</span>
            </li>
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Edit and format in Microsoft Word</span>
            </li>
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Preserve text formatting</span>
            </li>
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Works with all PDF types</span>
            </li>
            <li className="flex space-x-3">
              <span className="text-blue-600">✓</span>
              <span>Instant conversion</span>
            </li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
