'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Terminal, 
  Play, 
  Square, 
  Trash2, 
  Download, 
  Upload,
  Settings,
  Filter,
  Search,
  Copy,
  CheckCircle2,
  AlertCircle,
  Info,
  Zap
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface SerialMessage {
  id: string;
  timestamp: Date;
  type: 'tx' | 'rx' | 'system' | 'error';
  data: string;
  level?: 'info' | 'warning' | 'error';
}

interface SerialMonitorProps {
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onSend?: (data: string) => void;
  className?: string;
}

// Baud rate options
const BAUD_RATES = [
  300, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 
  38400, 57600, 115200, 230400, 460800, 921600
];

// Line ending options
const LINE_ENDINGS = [
  { value: 'none', label: 'No line ending' },
  { value: 'nl', label: 'Newline (\\n)' },
  { value: 'cr', label: 'Carriage return (\\r)' },
  { value: 'crlf', label: 'Both NL & CR (\\r\\n)' },
];

export function SerialMonitor({ 
  isConnected = false,
  onConnect,
  onDisconnect,
  onSend,
  className 
}: SerialMonitorProps) {
  const [messages, setMessages] = useState<SerialMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [baudRate, setBaudRate] = useState(9600);
  const [lineEnding, setLineEnding] = useState('nl');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'tx' | 'rx' | 'system'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [connected, setConnected] = useState(isConnected);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Simulate incoming serial data (for demo purposes)
  useEffect(() => {
    if (connected) {
      const interval = setInterval(() => {
        // Simulate random sensor data
        const randomData = [
          `Temperature: ${(20 + Math.random() * 10).toFixed(1)}°C`,
          `Humidity: ${(40 + Math.random() * 30).toFixed(1)}%`,
          `Light Level: ${Math.floor(Math.random() * 1024)}`,
          `Motion detected`,
          `System OK`,
          `Voltage: ${(3.3 + Math.random() * 1.7).toFixed(2)}V`,
        ];
        
        if (Math.random() > 0.7) { // 30% chance
          addMessage(
            randomData[Math.floor(Math.random() * randomData.length)],
            'rx'
          );
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [connected]);

  // Add message to log
  const addMessage = useCallback((data: string, type: SerialMessage['type'], level?: SerialMessage['level']) => {
    const newMessage: SerialMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type,
      data,
      level,
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // Handle connect/disconnect
  const handleToggleConnection = () => {
    if (connected) {
      setConnected(false);
      onDisconnect?.();
      addMessage(`Disconnected from serial port (${baudRate} baud)`, 'system', 'info');
      toast.info('Serial port disconnected');
    } else {
      setConnected(true);
      onConnect?.();
      addMessage(`Connected to serial port at ${baudRate} baud`, 'system', 'info');
      toast.success('Serial port connected', {
        description: `Baud rate: ${baudRate}`,
      });
    }
  };

  // Send data
  const handleSend = () => {
    if (!inputValue.trim()) {
      toast.error('Enter data to send');
      return;
    }

    if (!connected) {
      toast.error('Connect to serial port first');
      return;
    }

    let dataToSend = inputValue;
    
    // Apply line ending
    switch (lineEnding) {
      case 'nl':
        dataToSend += '\n';
        break;
      case 'cr':
        dataToSend += '\r';
        break;
      case 'crlf':
        dataToSend += '\r\n';
        break;
    }

    addMessage(dataToSend, 'tx');
    onSend?.(dataToSend);
    setInputValue('');
    toast.success('Data sent');
  };

  // Clear all messages
  const handleClear = () => {
    setMessages([]);
    toast.info('Serial monitor cleared');
  };

  // Export log
  const handleExport = () => {
    const logContent = messages
      .map(msg => {
        const timestamp = showTimestamp ? `[${msg.timestamp.toLocaleTimeString()}] ` : '';
        const prefix = msg.type === 'tx' ? '>> ' : msg.type === 'rx' ? '<< ' : '## ';
        return `${timestamp}${prefix}${msg.data}`;
      })
      .join('\n');

    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serial-log-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Log exported');
  };

  // Copy all messages
  const handleCopyAll = () => {
    const logContent = messages
      .map(msg => {
        const timestamp = showTimestamp ? `[${msg.timestamp.toLocaleTimeString()}] ` : '';
        return `${timestamp}${msg.data}`;
      })
      .join('\n');

    navigator.clipboard.writeText(logContent);
    toast.success('Log copied to clipboard');
  };

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    if (filterType !== 'all' && msg.type !== filterType) {
      return false;
    }
    
    if (searchQuery && !msg.data.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Get message color
  const getMessageColor = (msg: SerialMessage) => {
    if (msg.type === 'tx') return 'text-[#00E5FF]';
    if (msg.type === 'rx') return 'text-[#00FF88]';
    if (msg.type === 'error') return 'text-red-400';
    return 'text-gray-400';
  };

  // Get message icon
  const getMessageIcon = (msg: SerialMessage) => {
    if (msg.type === 'tx') return '▲';
    if (msg.type === 'rx') return '▼';
    if (msg.level === 'error') return '✖';
    if (msg.level === 'warning') return '⚠';
    return '●';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <Card className="glass-surface border-white/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Terminal className="h-5 w-5 text-[#00E5FF]" />
              Serial Monitor
              {connected && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Zap className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </Badge>
              {filteredMessages.length !== messages.length && (
                <Badge variant="outline" className="text-xs text-[#00E5FF]">
                  {filteredMessages.length} filtered
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Connection Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <Select value={baudRate.toString()} onValueChange={(v) => setBaudRate(parseInt(v))}>
                <SelectTrigger className="w-[140px] glass-surface border-white/20 text-white">
                  <SelectValue placeholder="Baud rate" />
                </SelectTrigger>
                <SelectContent className="glass-surface border-white/20">
                  {BAUD_RATES.map((rate) => (
                    <SelectItem key={rate} value={rate.toString()} className="text-white">
                      {rate} baud
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleToggleConnection}
                className={connected ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {connected ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Disconnect
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>

              <div className="h-6 w-px bg-white/20" />

              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={messages.length === 0}
                className="bg-white/10 border-white/20 text-white"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={messages.length === 0}
                className="bg-white/10 border-white/20 text-white"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
                disabled={messages.length === 0}
                className="bg-white/10 border-white/20 text-white"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                  <SelectTrigger className="w-[120px] glass-surface border-white/20 text-white h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-surface border-white/20">
                    <SelectItem value="all" className="text-white">All</SelectItem>
                    <SelectItem value="tx" className="text-white">Sent</SelectItem>
                    <SelectItem value="rx" className="text-white">Received</SelectItem>
                    <SelectItem value="system" className="text-white">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="pl-10 h-8 glass-surface border-white/20 text-white"
                />
              </div>

              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={autoScroll}
                    onCheckedChange={(checked) => setAutoScroll(checked as boolean)}
                  />
                  <span className="text-gray-300">Auto-scroll</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={showTimestamp}
                    onCheckedChange={(checked) => setShowTimestamp(checked as boolean)}
                  />
                  <span className="text-gray-300">Timestamps</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Display */}
      <Card className="glass-surface border-white/10">
        <CardContent className="p-0">
          <div
            ref={messagesContainerRef}
            className="h-[400px] overflow-y-auto bg-[#0A0014] p-4 font-mono text-sm"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 20px)',
            }}
          >
            <AnimatePresence initial={false}>
              {filteredMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Terminal className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      {connected 
                        ? 'Waiting for serial data...' 
                        : 'Connect to serial port to start monitoring'
                      }
                    </p>
                  </div>
                </div>
              ) : (
                filteredMessages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`py-1 ${getMessageColor(msg)} hover:bg-white/5 px-2 rounded transition-colors`}
                  >
                    <div className="flex items-start gap-2">
                      {showTimestamp && (
                        <span className="text-gray-500 text-xs whitespace-nowrap">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      )}
                      <span className="text-xs">{getMessageIcon(msg)}</span>
                      <span className="flex-1 break-all">{msg.data}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Send Data */}
      <Card className="glass-surface border-white/10">
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-white text-sm">Line ending:</Label>
              <Select value={lineEnding} onValueChange={setLineEnding}>
                <SelectTrigger className="w-[200px] glass-surface border-white/20 text-white h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-surface border-white/20">
                  {LINE_ENDINGS.map((ending) => (
                    <SelectItem key={ending.value} value={ending.value} className="text-white">
                      {ending.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type data to send (press Enter to send)"
                className="glass-surface border-white/20 text-white flex-1"
                disabled={!connected}
              />
              <Button
                onClick={handleSend}
                disabled={!connected || !inputValue.trim()}
                className="bg-[#00E5FF] text-[#071428] hover:bg-[#00E5FF]/90"
              >
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Panel */}
      <Card className="bg-[#00E5FF]/10 border-[#00E5FF]/30">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-[#00E5FF] mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="text-white font-semibold">Serial Monitor Guide:</p>
              <ul className="text-[#B8A7E0] space-y-1 text-xs">
                <li>• <strong className="text-white">Connect</strong> to start receiving data from Arduino/ESP32/other MCUs</li>
                <li>• <strong className="text-white">Baud rate</strong> must match your MCU's Serial.begin() setting (default: 9600)</li>
                <li>• <strong className="text-white">Line endings</strong> are automatically added to sent messages</li>
                <li>• <strong className="text-white">▲ (blue)</strong> = data sent to MCU, <strong className="text-white">▼ (green)</strong> = data received</li>
                <li>• Use <strong className="text-white">Search</strong> and <strong className="text-white">Filter</strong> to find specific messages</li>
                <li>• <strong className="text-white">Export</strong> saves the complete log to a text file</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
