
import React, { useState, useRef, useEffect } from 'react';
import { analyzeDesignDNA } from './services/geminiService';
import { AppStatus, SavedPrompt, User, AppSettings } from './types';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { 
  Layout, 
  Upload, 
  RefreshCcw, 
  Copy, 
  Check, 
  AlertCircle, 
  Cpu, 
  Eye, 
  FileText, 
  Sparkles, 
  Save, 
  Trash2, 
  History,
  ChevronRight,
  Edit2,
  Lock,
  User as UserIcon,
  Settings,
  LogOut,
  ShieldCheck,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const ADMIN_EMAIL = 'padangpadang36@gmail.com';

const App: React.FC = () => {
  // Auth & Settings State
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings>({ isGuestLoginEnabled: false });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // App State
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    // Load prompts
    const storedPrompts = localStorage.getItem('design_dna_library');
    if (storedPrompts) {
      try { setSavedPrompts(JSON.parse(storedPrompts)); } catch (e) { console.error(e); }
    }

    // Load settings
    const storedSettings = localStorage.getItem('design_dna_settings');
    if (storedSettings) {
      try { setSettings(JSON.parse(storedSettings)); } catch (e) { console.error(e); }
    }

    // Check existing session
    const storedUser = localStorage.getItem('design_dna_user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('design_dna_library', JSON.stringify(savedPrompts));
  }, [savedPrompts]);

  useEffect(() => {
    localStorage.setItem('design_dna_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('design_dna_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('design_dna_user');
    }
  }, [user]);

  // Auth Actions
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;

    const isAdmin = loginEmail === ADMIN_EMAIL;
    const newUser: User = { email: loginEmail, isAdmin };
    setUser(newUser);
  };

  const handleGuestLogin = () => {
    if (!settings.isGuestLoginEnabled) return;
    setUser({ email: 'Guest', isAdmin: false, isGuest: true });
  };

  const handleLogout = () => {
    setUser(null);
    setShowAdminPanel(false);
    reset();
  };

  const toggleGuestLogin = () => {
    setSettings(prev => ({ ...prev, isGuestLoginEnabled: !prev.isGuestLoginEnabled }));
  };

  // App Actions
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください。');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async () => {
    if (!imagePreview) return;
    setStatus(AppStatus.LOADING);
    setError(null);
    try {
      const mimeType = imagePreview.split(';')[0].split(':')[1];
      const base64Data = imagePreview.split(',')[1];
      const result = await analyzeDesignDNA(base64Data, mimeType);
      setAnalysis(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || '解読中にエラーが発生しました。');
      setStatus(AppStatus.ERROR);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveCurrentPrompt = () => {
    if (!analysis) return;
    const newPrompt: SavedPrompt = {
      id: crypto.randomUUID(),
      name: `デザインDNA - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      content: analysis,
      timestamp: Date.now()
    };
    setSavedPrompts([newPrompt, ...savedPrompts]);
    setShowLibrary(true);
  };

  const deletePrompt = (id: string) => {
    setSavedPrompts(savedPrompts.filter(p => p.id !== id));
  };

  const updatePromptName = (id: string, newName: string) => {
    setSavedPrompts(savedPrompts.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const reset = () => {
    setImagePreview(null);
    setAnalysis('');
    setStatus(AppStatus.IDLE);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Login View
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-white p-6">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center space-y-4">
            <div className="inline-block bg-indigo-600 p-4 rounded-2xl shadow-2xl mb-2">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Authentication</h1>
            <p className="text-sm text-gray-500">ログインしてDNAデコーダーを開始してください</p>
          </div>

          <form onSubmit={handleLogin} className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-indigo-500 transition-all outline-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95"
            >
              ログイン
            </button>

            {settings.isGuestLoginEnabled && (
              <div className="relative pt-4 text-center">
                <div className="absolute inset-0 flex items-center px-8"><div className="w-full border-t border-white/5"></div></div>
                <span className="relative bg-[#16161c] px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Or</span>
                <button 
                  type="button"
                  onClick={handleGuestLogin}
                  className="mt-6 w-full py-3 border border-white/10 hover:bg-white/5 text-gray-300 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                >
                  ゲストとして利用
                </button>
              </div>
            )}
          </form>
          
          <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest">
            Admin: {ADMIN_EMAIL}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 font-sans tracking-tight bg-[#0a0a0c] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg">
            <Sparkles className="text-white w-4 h-4" />
          </div>
          <h1 className="text-sm font-bold tracking-tight uppercase">Infographic Prompt Generator</h1>
          {user.isAdmin && (
            <span className="bg-indigo-500/20 text-indigo-400 text-[8px] font-black px-1.5 py-0.5 rounded border border-indigo-500/30 uppercase tracking-tighter">Admin</span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {user.isAdmin && (
            <button 
              onClick={() => {
                setShowAdminPanel(!showAdminPanel);
                setShowLibrary(false);
              }}
              className={`p-2 rounded-lg transition-all border ${showAdminPanel ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              title="Admin Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          <button 
            onClick={() => {
              setShowLibrary(!showLibrary);
              setShowAdminPanel(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-[10px] font-bold tracking-widest border border-white/10 uppercase ${showLibrary ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 hover:bg-white/10'}`}
          >
            <History className="w-3 h-3" />
            Library ({savedPrompts.length})
          </button>
          
          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg bg-red-600/10 border border-red-500/20 text-red-500 hover:bg-red-600/20 transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-12">
        {/* Admin Dashboard */}
        {showAdminPanel && user.isAdmin && (
          <div className="mb-12 space-y-6 animate-in slide-in-from-top-4 duration-500">
            <div className="glass p-8 rounded-[2.5rem] border border-indigo-500/20 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldCheck className="w-32 h-32" />
              </div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-600 rounded-xl">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Admin Dashboard</h2>
                  <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Global App Configuration</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">ゲストログインの許可</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">ログイン画面にゲストボタンを表示</p>
                    </div>
                    <button onClick={toggleGuestLogin} className="transition-all">
                      {settings.isGuestLoginEnabled ? (
                        <ToggleRight className="w-10 h-10 text-indigo-500" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Admin Status</h4>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Active Session</p>
                  </div>
                  <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 font-black text-[10px] uppercase">
                    Verified
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === AppStatus.IDLE && !showAdminPanel && !showLibrary && (
          <div className="flex flex-col items-center text-center space-y-12 animate-in fade-in duration-700">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black leading-none tracking-tighter">
                お手本のDNAを、<br/><span className="text-indigo-500">最強の指示書</span>へ。
              </h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                画像のトーンや質感を解読し、プロンプトを自動生成。<br/>
                コピーして貼り付けるだけで、同じテイストの図解を作成できます。
              </p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group relative w-full h-64 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300 overflow-hidden"
            >
              <Upload className="w-8 h-8 text-gray-600 group-hover:text-indigo-500 transition-colors" />
              <div className="text-center">
                <p className="text-sm font-bold text-gray-400">参考にする画像を選択</p>
                <p className="text-[10px] text-gray-600 uppercase mt-1">PNG / JPG / WEBP</p>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>

            {imagePreview && (
              <div className="w-full animate-in zoom-in-95 duration-300">
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                  <img src={imagePreview} alt="Preview" className="w-full h-auto object-cover max-h-[400px]" />
                </div>
                <button 
                  onClick={startAnalysis}
                  className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  <Cpu className="w-4 h-4" />
                  プロンプトを生成する
                </button>
              </div>
            )}
          </div>
        )}

        {status === AppStatus.LOADING && (
          <div className="flex flex-col items-center justify-center py-32 space-y-8">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500/10 border-t-indigo-500 animate-spin" />
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-[0.3em] animate-pulse">Generating Designer Prompt...</p>
          </div>
        )}

        {status === AppStatus.SUCCESS && !showLibrary && !showAdminPanel && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl overflow-hidden border border-white/5 bg-white/5 p-2">
                <img src={imagePreview!} alt="Source" className="w-full h-auto rounded-lg grayscale-[0.2]" />
              </div>
              
              <div className="glass p-6 rounded-xl border border-white/5 flex flex-col justify-center space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 mb-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Director's Insight</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed italic">
                    「このプロンプトには、画像のトーン、配色、タイポグラフィ、そして重要な制約が含まれています。AIへの指示の末尾にこれを追加してください。」
                  </p>
                </div>
                <button 
                  onClick={saveCurrentPrompt}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  Save to Library
                </button>
              </div>
            </div>

            <div className="glass p-8 rounded-2xl border border-white/10 relative shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <h2 className="text-xs font-black uppercase tracking-widest">Master Prompt</h2>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => copyToClipboard(analysis)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all text-[10px] uppercase tracking-widest ${
                      copied ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy Full Prompt'}
                  </button>
                </div>
              </div>

              <div className="bg-black/40 p-6 rounded-xl border border-white/5 shadow-inner overflow-auto max-h-[60vh]">
                <MarkdownRenderer content={analysis} />
              </div>
            </div>
          </div>
        )}

        {status === AppStatus.ERROR && (
          <div className="max-w-sm mx-auto py-20 text-center space-y-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <p className="text-sm text-red-400 font-medium">{error}</p>
            <button onClick={reset} className="text-xs font-bold text-white border-b border-white/20 pb-1">もう一度試す</button>
          </div>
        )}

        {/* Library Section */}
        {showLibrary && !showAdminPanel && (
          <div className="mt-4 space-y-6 animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" />
                Saved Prompts Library
              </h3>
              <button onClick={() => setShowLibrary(false)} className="text-xs text-gray-500 hover:text-white">Close</button>
            </div>
            
            {savedPrompts.length === 0 ? (
              <div className="text-center py-12 glass rounded-2xl border-dashed border-white/5">
                <p className="text-gray-500 text-sm italic">保存されたプロンプトはありません。</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {savedPrompts.map((prompt) => (
                  <div key={prompt.id} className="glass p-5 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Edit2 className="w-3 h-3 text-gray-600" />
                          <input 
                            type="text" 
                            value={prompt.name}
                            onChange={(e) => updatePromptName(prompt.id, e.target.value)}
                            className="bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-white w-full outline-none"
                          />
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                          {new Date(prompt.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => copyToClipboard(prompt.content)}
                          className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all shadow-lg"
                          title="Copy content"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setAnalysis(prompt.content);
                            setStatus(AppStatus.SUCCESS);
                            setShowLibrary(false);
                            setImagePreview(null);
                          }}
                          className="p-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 transition-all shadow-lg"
                          title="View analysis"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deletePrompt(prompt.id)}
                          className="p-2.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-500 transition-all shadow-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
