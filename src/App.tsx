import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import { FileText, FileImage, FileSpreadsheet, Presentation, Scissors, Merge, Minimize2, Edit3, RotateCw, Unlock, Info, Check, Brain, Zap, Users, Cloud, Shield, Home as HomeIcon } from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AuthModal } from './components/AuthModal';
import { PdfToImage } from './components/tools/PdfToImage';
import { MergePdf } from './components/tools/MergePdf';
import { SplitPdf } from './components/tools/SplitPdf';
import { CompressPdf } from './components/tools/CompressPdf';
import { PdfToWord } from './components/tools/PdfToWord';
import { PdfToExcel } from './components/tools/PdfToExcel';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pdf-to-image" element={<PdfToImage />} />
          <Route path="/merge-pdf" element={<MergePdf />} />
          <Route path="/split-pdf" element={<SplitPdf />} />
          <Route path="/compress-pdf" element={<CompressPdf />} />
          <Route path="/pdf-to-word" element={<PdfToWord />} />
          <Route path="/pdf-to-excel" element={<PdfToExcel />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const openSignIn = () => {
    setIsSignUp(false);
    setAuthModalOpen(true);
  };

  const openSignUp = () => {
    setIsSignUp(true);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onSignInClick={openSignIn} onSignUpClick={openSignUp} />
      <Hero />
      <FreeTools />
      <PremiumFeatures />
      <Pricing />
      <Footer />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

function Header({ onSignInClick, onSignUpClick }: { onSignInClick: () => void; onSignUpClick: () => void }) {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition">
          <FileText className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">PDFTools</span>
        </Link>
        <nav className="hidden md:flex space-x-8">
          <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
          <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">Pricing</a>
          <a href="#about" className="text-gray-600 hover:text-gray-900 transition">About</a>
        </nav>
        <div className="flex space-x-4">
          {user ? (
            <>
              <span className="text-gray-600 font-medium">{user.email}</span>
              <button
                onClick={signOut}
                className="text-gray-600 hover:text-gray-900 transition font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onSignInClick}
                className="text-gray-600 hover:text-gray-900 transition font-medium"
              >
                Sign In
              </button>
              <button
                onClick={onSignUpClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          All Your PDF Tools<br />in One Place
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Convert, edit, merge, and compress PDFs effortlessly. Free tools for everyone, premium features for professionals.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/pdf-to-image" className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-block">
            Start Converting Free
          </Link>
          <a href="#features" className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition font-semibold text-lg border-2 border-blue-600 inline-block">
            View All Tools
          </a>
        </div>
        <p className="mt-6 text-gray-500">No sign-up required • 5 free conversions daily</p>
      </div>
    </section>
  );
}

function FreeTools() {
  const tools = [
    { icon: FileText, name: 'PDF to Word', path: '/pdf-to-word', desc: 'Convert PDFs to editable Word documents' },
    { icon: FileSpreadsheet, name: 'PDF to Excel', path: '/pdf-to-excel', desc: 'Extract tables and data to spreadsheets' },
    { icon: FileImage, name: 'PDF to Image', path: '/pdf-to-image', desc: 'Export PDF pages as JPG/PNG images' },
    { icon: Merge, name: 'Merge PDFs', path: '/merge-pdf', desc: 'Combine multiple PDFs into one file' },
    { icon: Scissors, name: 'Split PDF', path: '/split-pdf', desc: 'Extract specific pages or ranges' },
    { icon: Minimize2, name: 'Compress PDF', path: '/compress-pdf', desc: 'Reduce file size for easy sharing' },
    { icon: Presentation, name: 'PDF to PPT', path: '#', desc: 'Convert slides for presentation use' },
    { icon: Edit3, name: 'Edit PDF', path: '#', desc: 'Add text, images, and highlights' },
    { icon: RotateCw, name: 'Rotate PDF', path: '#', desc: 'Rotate and reorder pages easily' },
    { icon: Unlock, name: 'Unlock PDF', path: '#', desc: 'Remove password protection' },
    { icon: Info, name: 'PDF Metadata', path: '#', desc: 'Edit document properties' },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Free PDF Tools</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Essential tools to get your work done, completely free</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <Link
              key={index}
              to={tool.path}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition cursor-pointer group"
            >
              <tool.icon className="w-12 h-12 text-blue-600 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{tool.name}</h3>
              <p className="text-gray-600 leading-relaxed">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function PremiumFeatures() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Enhancements',
      items: ['Summarize PDF documents', 'Chat with your PDF', 'Smart redaction of sensitive data']
    },
    {
      icon: Zap,
      title: 'Conversion Intelligence',
      items: ['Advanced OCR for scanned PDFs', 'Batch conversion support', 'AI table reformatter']
    },
    {
      icon: Users,
      title: 'Productivity Suite',
      items: ['eSign & fill forms', 'Version history & collaboration', 'Watermark & branding tools']
    },
    {
      icon: Cloud,
      title: 'Cloud Storage',
      items: ['Secure file storage (7-30 days)', 'Access files anywhere', 'Share with team members']
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Premium Features</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Unlock powerful tools for professional workflows</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition">
              <feature.icon className="w-14 h-14 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <ul className="space-y-3">
                {feature.items.map((item, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['5 conversions/day', 'All basic tools', 'Standard quality', 'Community support'],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '$8.99',
      period: 'per month',
      features: ['Unlimited conversions', 'Advanced OCR', 'Batch processing', 'Priority support', 'No watermarks'],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Business',
      price: '$19.99',
      period: 'per month',
      features: ['Everything in Pro', 'Team access (up to 10)', 'Cloud storage (30 days)', 'Custom branding', 'API access'],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Choose the plan that fits your needs</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className={`rounded-2xl p-8 ${
              plan.popular
                ? 'bg-blue-600 text-white shadow-2xl scale-105 border-4 border-blue-700'
                : 'bg-white border-2 border-gray-200'
            }`}>
              {plan.popular && (
                <div className="bg-yellow-400 text-blue-900 text-sm font-bold px-4 py-1 rounded-full inline-block mb-4">
                  MOST POPULAR
                </div>
              )}
              <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
              <div className="mb-6">
                <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                <span className={`ml-2 ${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>/ {plan.period}</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-blue-200' : 'text-green-500'}`} />
                    <span className={plan.popular ? 'text-blue-50' : 'text-gray-700'}>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-lg font-semibold transition ${
                plan.popular
                  ? 'bg-white text-blue-600 hover:bg-gray-100'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-gray-600">All plans include secure file processing and automatic deletion after 24 hours</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="about" className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold">PDFTools</span>
            </div>
            <p className="text-gray-400 leading-relaxed">Your complete PDF solution for converting, editing, and managing documents online.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-lg">Tools</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/pdf-to-word" className="hover:text-white transition">PDF to Word</Link></li>
              <li><Link to="/pdf-to-excel" className="hover:text-white transition">PDF to Excel</Link></li>
              <li><Link to="/merge-pdf" className="hover:text-white transition">Merge PDF</Link></li>
              <li><Link to="/compress-pdf" className="hover:text-white transition">Compress PDF</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-lg">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
              <li><a href="#" className="hover:text-white transition">API Documentation</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-lg">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">&copy; 2025 PDFTools. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Shield className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 text-sm">Enterprise-grade security • Files auto-deleted after 24h</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default App;
