import { FileText, Home } from 'lucide-react';

interface ToolLayoutProps {
  children: React.ReactNode;
  toolName: string;
  toolDescription: string;
}

export function ToolLayout({ children, toolName, toolDescription }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-4">
          <a href="/" className="text-gray-600 hover:text-gray-900 transition">
            <Home className="w-6 h-6" />
          </a>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{toolName}</h1>
            <p className="text-gray-600 text-sm">{toolDescription}</p>
          </div>
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>
    </div>
  );
}
