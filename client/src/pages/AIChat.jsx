// AIChat.jsx - AI Chat Component
import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Chip,
  IconButton,
  Collapse,
  CircularProgress,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';


const AIChat = ({ onSendMessage, loading = false, title = "AI Assistant" }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;


    // Add user message to chat
    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, userMessage]);


    try {
      // Send to parent component
      const result = await onSendMessage(message);
     
      // Add AI response to chat
      if (result) {
        const aiMessage = {
          type: 'ai',
          content: result.assistantText || 'AI processing completed',
          keywords: result.keywords || [],
          audioFile: result.audioFile,
          timestamp: new Date(),
        };
        setChatHistory(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      const errorMessage = {
        type: 'ai',
        content: 'Sorry, AI is currently unavailable. Please try again later.',
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, errorMessage]);
    }


    setMessage('');
  };


  const playAudio = (audioFile) => {
    if (audioFile) {
      const audio = new Audio(audioFile);
      audio.play().catch(console.error);
    }
  };


  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: isExpanded ? 400 : 200,
        maxHeight: isExpanded ? 600 : 60,
        transition: 'all 0.3s ease',
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChatIcon />
          <Typography variant="subtitle1">{title}</Typography>
        </Box>
        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Box>


      <Collapse in={isExpanded}>
        <Box sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
          {/* Chat Messages */}
          <Box
            sx={{
              flex: 1,
              p: 1,
              overflowY: 'auto',
              maxHeight: 300,
            }}
          >
            {chatHistory.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                👋 Hi! I'm your AI assistant. I can help you with cart operations and RFQ creation. Try asking me something like:
                <br />• "Add urgent items to my RFQ"
                <br />• "Help me organize my cart"
                <br />• "Create an RFQ with priority items"
              </Typography>
            ) : (
              chatHistory.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 1,
                    display: 'flex',
                    flexDirection: msg.type === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <Paper
                    sx={{
                      p: 1,
                      maxWidth: '80%',
                      bgcolor: msg.type === 'user' ? 'primary.light' : 'grey.100',
                      color: msg.type === 'user' ? 'white' : 'text.primary',
                    }}
                  >
                    <Typography variant="body2">{msg.content}</Typography>
                   
                    {/* Keywords */}
                    {msg.keywords && msg.keywords.length > 0 && (
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {msg.keywords.slice(0, 3).map((keyword, i) => (
                          <Chip
                            key={i}
                            label={keyword}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        ))}
                      </Box>
                    )}
                   
                    {/* Audio Button */}
                    {msg.audioFile && (
                      <IconButton
                        size="small"
                        onClick={() => playAudio(msg.audioFile)}
                        sx={{ mt: 0.5, p: 0.5 }}
                      >
                        <VolumeUpIcon fontSize="small" />
                      </IconButton>
                    )}
                   
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
                      {msg.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </Box>
              ))
            )}
           
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  AI is thinking...
                </Typography>
              </Box>
            )}
          </Box>


          {/* Input */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              gap: 1,
            }}
          >
            <TextField
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask AI for help..."
              size="small"
              fullWidth
              disabled={loading}
              variant="outlined"
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !message.trim()}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};


export default AIChat;