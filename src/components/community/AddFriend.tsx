import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, QrCode, Check, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMyFriendCode } from '@/hooks/useMyFriendCode';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import QRScannerDialog from './QRScannerDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AddFriend() {
  const { t } = useLanguage();
  const { username, friendCode } = useMyFriendCode();
  const { sendRequest } = useFriendRequests();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [searching, setSearching] = useState(false);

  const qrValue = friendCode ? `${window.location.origin}/community?add=${friendCode}` : '';

  const handleCopy = () => {
    if (!username) return;
    navigator.clipboard.writeText(username);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleScan = async (code: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('friend_code', code)
      .maybeSingle();
    if (!data) {
      toast.error(t('cmUserNotFound'));
      return;
    }
    await sendRequest(data.user_id);
  };

  const handleSearch = async () => {
    const q = usernameInput.trim().toLowerCase().replace(/^@/, '');
    if (!q) return;
    setSearching(true);
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('user_id, username')
        .ilike('username', q)
        .maybeSingle();
      if (!data) {
        toast.error(t('cmUserNotFound'));
        return;
      }
      const ok = await sendRequest(data.user_id);
      if (ok) setUsernameInput('');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 flex flex-col items-center gap-4">
        <h3 className="font-semibold flex items-center gap-2"><QrCode className="h-5 w-5" />{t('cmYourQrCode')}</h3>
        <p className="text-sm text-muted-foreground text-center">{t('cmShareQrDesc')}</p>
        <div className="bg-white p-4 rounded-xl">
          {qrValue ? (
            <QRCodeSVG value={qrValue} size={200} level="M" />
          ) : (
            <div className="w-[200px] h-[200px] bg-muted animate-pulse rounded" />
          )}
        </div>
        <div className="w-full space-y-2">
          <p className="text-xs text-muted-foreground">{t('cmYourUsername')}</p>
          <div className="flex gap-2">
            <Input value={username ? `@${username}` : ''} readOnly className="font-mono" />
            <Button size="icon" variant="outline" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <Button onClick={() => setScannerOpen(true)} className="w-full" variant="outline">
          <QrCode className="mr-2 h-4 w-4" /> {t('cmScanQr')}
        </Button>
        <div className="flex gap-2">
          <Input
            placeholder={t('cmEnterUsername')}
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={searching}>
            <Search className="mr-2 h-4 w-4" />{t('cmSendRequest')}
          </Button>
        </div>
      </Card>

      <QRScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} onScan={handleScan} />
    </div>
  );
}
