import React, { useEffect, useState } from 'react';
import { History, Download, RotateCcw, FileJson, FileSpreadsheet, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { fetchAuditLogs, undoAuditAction } from '../services/api';
import { AuditLog } from '../types';

export const BackupHistoryView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [undoingId, setUndoingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async (logId: string) => {
    setUndoingId(logId);
    setMessage(null);
    try {
      const res = await undoAuditAction(logId);
      setMessage(res.message);
      loadLogs();
    } catch (e: any) {
      console.error(e);
      setMessage(e.message || 'Erro ao desfazer ação');
    } finally {
      setUndoingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" /> Backup Completo e Histórico de Alterações
          </h2>
          <p className="text-xs text-slate-400">
            Exportação de dados e sistema de auditoria com opção de desfazer qualquer mudança em 1 clique.
          </p>
        </div>
      </div>

      {message && (
        <div className="glass-panel rounded-2xl p-4 border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Export Options Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Backup Completo JSON</h4>
              <p className="text-xs text-slate-400">Estrutura total de playlists, faixas e configurações.</p>
            </div>
          </div>
          <a
            href="http://localhost:8000/backup/export/json"
            download
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-glow-emerald transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar JSON</span>
          </a>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Exportar Tabela CSV</h4>
              <p className="text-xs text-slate-400">Metadados detalhados de todas as músicas em planilha.</p>
            </div>
          </div>
          <a
            href="http://localhost:8000/backup/export/csv"
            download
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-glow-emerald transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar CSV</span>
          </a>
        </div>
      </div>

      {/* Audit Logs Timeline */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Registro de Auditoria & Histórico de Mudanças
        </h3>

        {loading ? (
          <div className="text-center py-6 text-slate-500 text-xs flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Carregando logs...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-obsidian-800 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 text-[10px]">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </span>
                    <span className={`text-[10px] px-2 py-0.2 rounded font-semibold ${
                      log.action_type === 'REORGANIZATION' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      log.action_type === 'RENAME_PLAYLIST' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                      'bg-violet-500/10 text-violet-400 border border-violet-500/30'
                    }`}>
                      {log.action_type}
                    </span>
                  </div>
                  <div className="text-slate-200 font-medium">{log.description}</div>
                </div>

                <div>
                  {log.is_reverted ? (
                    <span className="text-slate-500 text-[11px] font-semibold italic">Desfeito</span>
                  ) : (
                    <button
                      onClick={() => handleUndo(log.id)}
                      disabled={undoingId === log.id}
                      className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-emerald-500 hover:text-black text-slate-200 text-[11px] font-semibold transition-all flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{undoingId === log.id ? 'Revertendo...' : 'Desfazer'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
