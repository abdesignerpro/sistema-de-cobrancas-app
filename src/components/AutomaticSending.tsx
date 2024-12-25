import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Paper,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';

interface AutomaticSendingProps {
  onConfigChange?: () => void;
}

const AutomaticSending: React.FC<AutomaticSendingProps> = ({ onConfigChange }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [daysBeforeDue, setDaysBeforeDue] = useState('1');
  const [sendTime, setSendTime] = useState<dayjs.Dayjs | null>(dayjs().hour(9).minute(0));
  const [messageTemplate, setMessageTemplate] = useState(
    'Olá {nome}! 👋\n\nEsperamos que esteja bem!\n\n📋 *Detalhes do Serviço*\n☑️ Serviço: {servico}\n💰 Valor: R$ {valor}\n📅 Vencimento: {dias}\n\n💳 *Opções de Pagamento*\nPara sua comodidade, disponibilizamos o pagamento via PIX:\n\n📱 *Pague com QR Code:*\n{qrcode}'
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await axios.get('http://localhost:3000/config');
      const config = response.data;

      setIsEnabled(config.automaticSendingEnabled === 'true');
      setDaysBeforeDue(config.daysBeforeDue || '1');
      setSendTime(config.sendTime ? dayjs(config.sendTime, 'HH:mm') : dayjs().hour(9).minute(0));
      setMessageTemplate(config.messageTemplate || messageTemplate);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleSave = async () => {
    try {
      const config = {
        automaticSendingEnabled: isEnabled.toString(),
        daysBeforeDue,
        sendTime: sendTime?.format('HH:mm'),
        messageTemplate,
      };

      await axios.post('http://localhost:3000/config', config);
      
      setSnackbar({
        open: true,
        message: 'Configuração salva com sucesso',
        severity: 'success',
      });

      if (onConfigChange) {
        onConfigChange();
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar configuração',
        severity: 'error',
      });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" component="h2" color="primary" gutterBottom>
        Envio Automático
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Switch
          checked={isEnabled}
          onChange={(e) => setIsEnabled(e.target.checked)}
          color="primary"
        />
        <Typography>Ativar envio automático</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <Typography variant="subtitle2" gutterBottom>
            Dias antes do vencimento
          </Typography>
          <Select
            value={daysBeforeDue}
            onChange={(e) => setDaysBeforeDue(e.target.value)}
            size="small"
          >
            <MenuItem value="1">1 dia</MenuItem>
            <MenuItem value="2">2 dias</MenuItem>
            <MenuItem value="3">3 dias</MenuItem>
            <MenuItem value="5">5 dias</MenuItem>
            <MenuItem value="7">7 dias</MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <Typography variant="subtitle2" gutterBottom>
            Horário de envio
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              value={sendTime}
              onChange={(newValue) => setSendTime(newValue)}
              format="HH:mm"
              ampm={false}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>
        </FormControl>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Modelo da mensagem
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={15}
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          size="small"
        />
      </Box>

      <Button variant="contained" color="primary" onClick={handleSave}>
        Salvar Configurações
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AutomaticSending;
