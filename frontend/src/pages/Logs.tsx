import { useState, useEffect } from 'react';
import { Terminal, Lock, RefreshCw, AlertTriangle } from 'lucide-react';
import api from '../services/api';

interface LogEntry {
  message: string;
  level?: string;
  timestamp?: string;
  [key: string]: any;
}

export const Logs = () => {
  const [key, setKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    if (!isAuthenticated && !key) return; // Don't fetch if not ready
    
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/logs?key=${key}&lines=100`);
      setLogs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch logs');
      if (err.response?.status === 401) {
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      setIsAuthenticated(true);
      // Immediately fetch logs after login
      setTimeout(fetchLogs, 100); 
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAuthenticated && autoRefresh) {
      // Fetch immediately on mount or refresh enable
      fetchLogs();
      interval = setInterval(fetchLogs, 5000);
    }
    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-gray/20 flex items-center justify-center p-4 font-mono">
        <div className="w-full max-w-md bg-white border-4 border-black p-8 shadow-neu relative">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-brand-orange border-4 border-black px-4 py-2 rotate-1 shadow-neu-sm">
            <h1 className="text-2xl font-black text-black uppercase">Admin Access</h1>
          </div>
          
          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-black uppercase mb-2">Secret Key</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3" size={20} />
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full bg-white border-2 border-black p-3 pl-10 font-bold focus:outline-none focus:bg-brand-gray/20 transition-all shadow-neu-sm"
                  placeholder="ENTER KEY"
                  autoFocus
                />
              </div>
            </div>
            
            <button 
              type="submit"
              className="w-full bg-black text-white font-black uppercase py-4 border-2 border-black hover:bg-brand-orange hover:text-black transition-all shadow-neu active:translate-y-1 active:shadow-none"
            >
              Access Terminal
            </button>
            
            {error && (
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm bg-red-100 p-2 border-2 border-red-600">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-green-400 font-mono p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b-2 border-green-800 pb-6">
          <div className="flex items-center gap-3">
            <Terminal size={32} className="text-brand-orange" />
            <div>
              <h1 className="text-3xl font-black uppercase text-white tracking-widest">System Logs</h1>
              <p className="text-xs text-green-600 uppercase">TecPrime Server Monitor v1.0</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 border-2 border-current font-bold uppercase transition-all ${
                autoRefresh 
                  ? 'bg-green-900/30 text-green-400 shadow-[2px_2px_0px_0px_rgba(74,222,128,0.5)]' 
                  : 'text-gray-500 border-gray-600 hover:text-gray-300'
              }`}
            >
              <RefreshCw size={16} className={autoRefresh ? "animate-spin" : ""} />
              {autoRefresh ? 'Live' : 'Paused'}
            </button>
            
            <button
              onClick={fetchLogs}
              className="px-6 py-2 bg-brand-orange text-black font-black uppercase border-2 border-brand-orange hover:bg-transparent hover:text-brand-orange transition-all shadow-[4px_4px_0px_0px_#fff] active:translate-y-[2px] active:shadow-none"
            >
              Refresh
            </button>

            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 border-2 border-red-500 text-red-500 font-bold uppercase hover:bg-red-500/10 transition-all"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Terminal Window */}
        <div className="bg-black border-4 border-gray-800 rounded-lg shadow-2xl overflow-hidden relative min-h-[600px]">
          {/* Terminal Header */}
          <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-xs text-gray-400 font-mono">root@tecprime-server:~/logs</span>
          </div>

          {/* Logs Content */}
          <div className="p-6 h-[600px] overflow-y-auto custom-scrollbar">
            {loading && logs.length === 0 ? (
              <div className="text-center py-20 animate-pulse">
                <p className="text-xl">INITIALIZING CONNECTION...</p>
                <p className="text-sm text-gray-500 mt-2">Decryption keys exchanging...</p>
              </div>
            ) : (
              <div className="space-y-1 font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className="flex gap-4 hover:bg-white/5 p-1 rounded transition-colors group">
                    <span className="text-gray-500 shrink-0 select-none w-8 text-right">{logs.length - index}</span>
                    <span className="text-blue-400 shrink-0 w-36">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Unknown'}
                    </span>
                    <span className={`shrink-0 w-16 font-bold ${
                      log.level === 'error' ? 'text-red-500' : 
                      log.level === 'warn' ? 'text-yellow-500' : 
                      'text-green-500'
                    }`}>
                      [{log.level?.toUpperCase() || 'INFO'}]
                    </span>
                    <span className="text-gray-300 break-all group-hover:text-white transition-colors">
                      {typeof log.message === 'object' ? JSON.stringify(log.message) : log.message}
                      {log.context && <span className="text-gray-500 ml-2">({log.context})</span>}
                    </span>
                  </div>
                ))}
                {logs.length === 0 && !loading && (
                    <div className="text-gray-500 italic">No logs found. System is silent.</div>
                )}
              </div>
            )}
          </div>
          
          {/* Status Bar */}
          <div className="absolute bottom-0 w-full bg-gray-900 border-t border-gray-800 px-4 py-1 text-xs text-gray-500 flex justify-between">
            <span>STATUS: {error ? 'DISCONNECTED' : 'ONLINE'}</span>
            <span>MEM: 512MB / CPU: 12%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
