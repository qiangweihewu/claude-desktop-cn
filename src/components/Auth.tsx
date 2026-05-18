import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, KeyRound, ServerCog } from 'lucide-react';
import { DEFAULT_CUSTOM_BASE_URL } from '../constants';

type ApiMode = 'official' | 'selfhosted';

const OFFICIAL_BASE_URL = 'https://api.anthropic.com';

const cardClass =
  'rounded-2xl border px-4 py-4 text-left transition-all hover:bg-black/[0.03] dark:hover:bg-white/[0.03]';

const inputClass =
  'w-full rounded-xl border border-claude-border bg-claude-bg px-4 py-3 text-[14px] text-claude-text outline-none focus:border-[#2E7CF6]/50';

const Auth = () => {
  const navigate = useNavigate();
  const initialMode = (localStorage.getItem('user_mode') === 'selfhosted' ? 'selfhosted' : 'official') as ApiMode;
  const [mode, setMode] = useState<ApiMode>(initialMode);
  const [officialKey, setOfficialKey] = useState(localStorage.getItem('ANTHROPIC_API_KEY') || '');
  const [customBaseUrl, setCustomBaseUrl] = useState(localStorage.getItem('CUSTOM_BASE_URL') || DEFAULT_CUSTOM_BASE_URL);
  const [customKey, setCustomKey] = useState(localStorage.getItem('CUSTOM_API_KEY') || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const modeTitle = useMemo(
    () => (mode === 'official' ? '官方 Anthropic API' : '自定义兼容 API'),
    [mode],
  );

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const saveOfficial = () => {
    if (!officialKey.trim()) {
      setError('请先填写官方 Anthropic API Key。');
      setMessage('');
      return;
    }
    localStorage.setItem('user_mode', 'clawparrot');
    localStorage.setItem('ANTHROPIC_API_KEY', officialKey.trim());
    localStorage.setItem('ANTHROPIC_BASE_URL', OFFICIAL_BASE_URL);
    localStorage.removeItem('CUSTOM_API_KEY');
    localStorage.removeItem('CUSTOM_BASE_URL');
    localStorage.removeItem('gateway_user');
    localStorage.removeItem('gateway_quota');
    localStorage.removeItem('cross_mode_overrides');
    setError('');
    setMessage('已切换到官方 Anthropic API。');
    setTimeout(() => {
      window.location.hash = '#/';
      window.location.reload();
    }, 250);
  };

  const saveCustom = () => {
    if (!customBaseUrl.trim() || !customKey.trim()) {
      setError('请填写兼容接口的 Base URL 和 API Key。');
      setMessage('');
      return;
    }
    localStorage.setItem('user_mode', 'selfhosted');
    localStorage.setItem('CUSTOM_BASE_URL', customBaseUrl.trim());
    localStorage.setItem('CUSTOM_API_KEY', customKey.trim());
    localStorage.removeItem('gateway_user');
    localStorage.removeItem('gateway_quota');
    localStorage.removeItem('cross_mode_overrides');
    setError('');
    setMessage('已切换到自定义兼容 API。');
    setTimeout(() => {
      window.location.hash = '#/';
      window.location.reload();
    }, 250);
  };

  const openAnthropicConsole = () => {
    try {
      (window as any).electronAPI?.openExternal?.('https://console.anthropic.com/settings/keys');
    } catch {
      window.open('https://console.anthropic.com/settings/keys', '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] dark:bg-[#141413] text-claude-text flex items-center justify-center px-6 py-10">
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] text-claude-textSecondary hover:bg-black/5 dark:hover:bg-white/5"
      >
        <ArrowLeft size={16} />
        返回
      </button>

      <div className="w-full max-w-[860px] rounded-[28px] border border-claude-border bg-white/90 dark:bg-[#1B1B1A] shadow-[0_24px_80px_rgba(0,0,0,0.12)] overflow-hidden">
        <div className="border-b border-claude-border px-8 py-7">
          <div className="text-[32px] font-serif-claude text-[#222] dark:text-white">Claude</div>
          <div className="mt-2 text-[14px] leading-6 text-claude-textSecondary">
            这里不再使用第三方账号登录。你可以直接接入官方 Anthropic API，或者填写其他兼容接口。
          </div>
        </div>

        <div className="grid grid-cols-[280px_1fr] gap-0">
          <div className="border-r border-claude-border bg-black/[0.02] dark:bg-white/[0.02] px-6 py-6">
            <div className="text-[13px] font-medium text-claude-textSecondary mb-3">接入方式</div>
            <div className="space-y-3">
              <button
                onClick={() => setMode('official')}
                className={`${cardClass} ${mode === 'official' ? 'border-[#2E7CF6]/45 bg-[#2E7CF6]/10' : 'border-claude-border bg-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D97757]/10 text-[#D97757]">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold text-claude-text">官方 Anthropic API</div>
                    <div className="mt-1 text-[12px] leading-5 text-claude-textSecondary">
                      使用 Anthropic Console 生成的 API Key，默认连接官方地址。
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode('selfhosted')}
                className={`${cardClass} ${mode === 'selfhosted' ? 'border-[#2E7CF6]/45 bg-[#2E7CF6]/10' : 'border-claude-border bg-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-claude-hover text-claude-textSecondary">
                    <ServerCog size={18} />
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold text-claude-text">自定义兼容 API</div>
                    <div className="mt-1 text-[12px] leading-5 text-claude-textSecondary">
                      适合中转站接口，包括 Claude 和 OpenAI 兼容接口。
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="px-8 py-7">
            <div className="mb-6">
              <div className="text-[20px] font-semibold text-claude-text">{modeTitle}</div>
              <div className="mt-2 text-[13px] leading-6 text-claude-textSecondary">
                {mode === 'official'
                  ? '推荐优先使用官方 Anthropic API。你只需要在官方 Console 里创建 API Key，再填回这里。'
                  : '如果你使用自己的兼容接口，就在这里填写 Base URL 和 API Key。'}
              </div>
            </div>

            {error && <div className="mb-4 rounded-xl bg-[#C6613F]/10 px-4 py-3 text-[13px] text-[#C6613F]">{error}</div>}
            {message && <div className="mb-4 rounded-xl bg-[#2E7CF6]/10 px-4 py-3 text-[13px] text-[#2E7CF6]">{message}</div>}

            {mode === 'official' ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-claude-border bg-claude-bg px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[14px] font-medium text-claude-text">Anthropic Console</div>
                      <div className="mt-1 text-[12px] leading-5 text-claude-textSecondary">
                        官方密钥管理页：`console.anthropic.com/settings/keys`
                      </div>
                    </div>
                    <button
                      onClick={openAnthropicConsole}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-claude-border px-3 py-2 text-[12px] text-claude-text hover:bg-claude-hover"
                    >
                      打开官网
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 text-[13px] text-claude-textSecondary">官方 API Key</div>
                  <input
                    value={officialKey}
                    onChange={(e) => setOfficialKey(e.target.value)}
                    className={inputClass}
                    placeholder="sk-ant-..."
                    spellCheck={false}
                  />
                </div>
                <div>
                  <div className="mb-1.5 text-[13px] text-claude-textSecondary">官方 Base URL</div>
                  <input value={OFFICIAL_BASE_URL} readOnly className={`${inputClass} opacity-80`} />
                </div>
                <div className="rounded-xl border border-claude-border bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3 text-[12px] leading-6 text-claude-textSecondary">
                  客户端会直接使用官方 Anthropic API，不再跳转第三方站点，也不会要求单独注册第三方账号。
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={saveOfficial}
                    className="rounded-xl bg-[#D97757] px-5 py-2.5 text-[14px] font-medium text-white hover:opacity-90"
                  >
                    保存并进入应用
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="mb-1.5 text-[13px] text-claude-textSecondary">Base URL</div>
                  <input
                    value={customBaseUrl}
                    onChange={(e) => setCustomBaseUrl(e.target.value)}
                    className={inputClass}
                    placeholder={DEFAULT_CUSTOM_BASE_URL}
                    spellCheck={false}
                  />
                </div>
                <div>
                  <div className="mb-1.5 text-[13px] text-claude-textSecondary">API Key</div>
                  <input
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    className={inputClass}
                    placeholder="输入你的兼容接口 API Key"
                    spellCheck={false}
                  />
                </div>
                <div className="rounded-xl border border-claude-border bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3 text-[12px] leading-6 text-claude-textSecondary">
                  这里适合中转站接口，包括 Claude / Anthropic 和 OpenAI 兼容接口。保存后，模型与请求将走你填写的兼容地址。
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={saveCustom}
                    className="rounded-xl bg-claude-text px-5 py-2.5 text-[14px] font-medium text-claude-bg hover:opacity-90"
                  >
                    保存并进入应用
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
