import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Container,
  Paper,
  AlertColor,
} from '@mui/material';
import CustomSnackbar from './CustomSnackbar';

interface ApiConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
  pixName: string;
  pixCity: string;
  pixKey: string;
  pixKeyType: string;
  pixTxid: string;
}

const PIX_KEY_TYPES = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'E-mail' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'aleatoria', label: 'Chave Aleatória' },
];

const ApiConfiguration: React.FC = () => {
  const [config, setConfig] = useState<ApiConfig>({
    apiUrl: 'https://evolution.abdesignerpro.com.br',
    apiKey: '',
    instanceName: 'anderson',
    pixName: '',
    pixCity: '',
    pixKey: '',
    pixKeyType: '',
    pixTxid: '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as AlertColor
  });

  useEffect(() => {
    // Carrega a configuração do localStorage
    const storedConfig = localStorage.getItem('apiConfig');
    if (storedConfig) {
      const config = JSON.parse(storedConfig);
      setConfig(config);
      
      // Envia a configuração para o backend
      fetch(`${config.apiUrl}/api/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })
      .then(response => response.json())
      .then(data => console.log('Configuração enviada com sucesso:', data))
      .catch(error => console.error('Erro ao enviar configuração:', error));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const cleanValue = value.replace(/\s+/g, '');
    setConfig(prev => ({
      ...prev,
      [name]: cleanValue
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { target: { name, value } } = e;
    setConfig(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Salva localmente
      localStorage.setItem('apiConfig', JSON.stringify(config));

      // Envia para o backend
      const response = await fetch(`${config.apiUrl}/api/config`, {
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
        message: 'Erro ao salvar configurações',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" color="primary" sx={{ mb: 3, fontWeight: 'medium' }}>
          Configurações
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
              Evolution API
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="URL da API"
              name="apiUrl"
              value={config.apiUrl}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="API Key"
              name="apiKey"
              value={config.apiKey}
              onChange={handleChange}
              required
              type="password"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome da Instância"
              name="instanceName"
              value={config.instanceName}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" sx={{ my: 2, color: 'text.secondary' }}>
              Configurações do PIX
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome do Beneficiário"
              name="pixName"
              value={config.pixName}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Cidade do Beneficiário"
              name="pixCity"
              value={config.pixCity}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Tipo de Chave PIX</InputLabel>
              <Select
                value={config.pixKeyType}
                name="pixKeyType"
                onChange={handleSelectChange}
                label="Tipo de Chave PIX"
              >
                {PIX_KEY_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Chave PIX"
              name="pixKey"
              value={config.pixKey}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="TXID"
              name="pixTxid"
              value={config.pixTxid}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              fullWidth
              size="large"
              sx={{ mt: 2 }}
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

export default ApiConfiguration;
