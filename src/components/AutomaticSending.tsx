import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  Container,
  Paper,
  AlertColor
} from '@mui/material';
import CustomSnackbar from './CustomSnackbar';

interface SendingConfig {
  enabled: boolean;
  daysBeforeDue: string;
  sendTime: string;
  messageTemplate: string;
}

const daysOptions = [
  "1", "2", "3", "4", "5", "6", "7", "10", "15", "30"
];

const AutomaticSending: React.FC = () => {
  const [config, setConfig] = useState<SendingConfig>({
    enabled: false,
    daysBeforeDue: "7",
    sendTime: "09:00",
    messageTemplate: `Olá {nome}! 👋

Esperamos que esteja bem! 

📋 *Detalhes do Serviço*
▫️ Serviço: {servico}
▫️ Valor: R$ {valor}
▫️ Vencimento: {dias}

💳 *Opções de Pagamento*
Para sua comodidade, disponibilizamos o pagamento via PIX:

📱 *Pague com QR Code:*
{qrcode}

📝 *Ou copie o código PIX abaixo:*
{pix}

⚠️ *Importante:*
• O pagamento será confirmado automaticamente
• Em caso de dúvidas, estamos à disposição

Agradecemos a preferência e confiança em nossos serviços! 🙏

Atenciosamente,
{empresa}`
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as any
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem('automaticSendingConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }

    const interval = setInterval(() => {
      if (config.enabled) {
        handleSave(); // Chama a função de salvar que envia as notificações
      }
    }, 3600000); // 1 hora em milissegundos

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, [config.enabled]);

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig(prev => ({
      ...prev,
      enabled: e.target.checked
    }));
  };

  const handleSave = async () => {
    try {
      // Salva localmente
      localStorage.setItem('automaticSendingConfig', JSON.stringify(config));
      
      // Envia para o backend
      const response = await fetch('https://sistema-de-cobrancas-cobrancas-server.yzgqzv.easypanel.host/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar configuração no servidor');
      }

      setSnackbar({
        open: true,
        message: 'Configurações salvas com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar configurações no servidor',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" color="primary" sx={{ mb: 3, fontWeight: 'medium' }}>
          Envio Automático
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.enabled}
                  onChange={handleSwitchChange}
                  color="primary"
                />
              }
              label="Ativar envio automático"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Dias antes do vencimento</InputLabel>
              <Select
                value={config.daysBeforeDue}
                name="daysBeforeDue"
                onChange={handleSelectChange}
                label="Dias antes do vencimento"
              >
                {daysOptions.map(day => (
                  <MenuItem key={day} value={day}>
                    {day} {parseInt(day) === 1 ? 'dia' : 'dias'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="time"
              label="Horário de envio"
              name="sendTime"
              value={config.sendTime}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={15}
              label="Modelo da mensagem"
              name="messageTemplate"
              value={config.messageTemplate}
              onChange={handleInputChange}
              helperText="Use as variáveis entre chaves: {nome}, {servico}, {valor}, {dias}, {empresa}"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              fullWidth
              size="large"
            >
              Salvar Configurações
            </Button>
          </Grid>
        </Grid>
      </Paper>
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </Container>
  );
};

export default AutomaticSending;
