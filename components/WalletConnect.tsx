
import React, { useState, useEffect } from 'react';
import { getAptosWallet, formatAddress, type WalletAccount } from '../lib/aptos';
import { Loader2, Wallet, LogOut, Copy, Check, ExternalLink } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface WalletConnectProps {
  isMobile?: boolean;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ isMobile = false }) => {
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      const wallet = getAptosWallet();
      const isConnected = await wallet.isConnected();
      
      if (isConnected) {
        const acct = await wallet.account();
        setAccount(acct);
      }
    };
    
    checkConnection();
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const wallet = getAptosWallet();
      const acct = await wallet.connect();
      setAccount(acct);
      
      toast({
        title: "Wallet Connected",
        description: "Your Aptos wallet has been successfully connected",
      });
    } catch (error) {
      console.error('Failed to connect wallet', error);
      toast({
        title: "Connection Failed",
        description: "There was an error connecting your wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    setIsDisconnecting(true);
    try {
      const wallet = getAptosWallet();
      await wallet.disconnect();
      setAccount(null);
      setShowDropdown(false);
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected successfully",
      });
    } catch (error) {
      console.error('Failed to disconnect wallet', error);
      toast({
        title: "Disconnection Failed",
        description: "There was an error disconnecting your wallet",
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const copyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        description: "Address copied to clipboard",
      });
    }
  };

  if (!account) {
    return (
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className={`button-primary flex items-center justify-center ${isMobile ? 'w-full' : ''}`}
      >
        {isConnecting ? (
          <Loader2 size={16} className="mr-2 animate-spin" />
        ) : (
          <Wallet size={16} className="mr-2" />
        )}
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="button-secondary flex items-center justify-center"
      >
        <Wallet size={16} className="mr-2 text-aptos" />
        {formatAddress(account.address)}
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-scale-in">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm text-lightText">Connected Address</p>
            <div className="flex items-center justify-between mt-1">
              <p className="font-medium text-darkText truncate" title={account.address}>
                {formatAddress(account.address)}
              </p>
              <button
                onClick={copyAddress}
                className="ml-2 p-1 hover:bg-gray-100 rounded-md transition-colors"
                title="Copy address"
              >
                {copied ? (
                  <Check size={14} className="text-tokenGreen" />
                ) : (
                  <Copy size={14} className="text-lightText" />
                )}
              </button>
            </div>
          </div>
          
          <div className="px-4 py-2">
            <a
              href={`https://explorer.aptoslabs.com/account/${account.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-darkText hover:text-aptos transition-colors py-2"
            >
              <ExternalLink size={14} className="mr-2" />
              View on Explorer
            </a>
            
            <button
              onClick={disconnectWallet}
              disabled={isDisconnecting}
              className="flex items-center text-sm text-red-600 hover:text-red-700 transition-colors py-2 w-full text-left"
            >
              {isDisconnecting ? (
                <Loader2 size={14} className="mr-2 animate-spin" />
              ) : (
                <LogOut size={14} className="mr-2" />
              )}
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect Wallet'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
