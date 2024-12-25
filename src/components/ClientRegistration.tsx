import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  IconButton,
  CssBaseline,
  AlertColor
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CustomSnackbar from './CustomSnackbar';

interface Client {
  id: string;
  name: string;
  whatsapp: string;
  service: string;
  value: number;
  billingDay: number;
  recurrence: string;
}

const RECURRENCE_OPTIONS = [
  { value: 'monthly', label: 'Mensal' },
  { value: '3_months', label: 'Trimestral' },
  { value: '6_months', label: 'Semestral' },
  { value: '1_year', label: 'Anual' },
];

const commonFieldStyle = {
  backgroundColor: 'background.paper',
  WebkitTapHighlightColor: 'transparent',
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.23)',
      borderWidth: '1px'
    },
    '&:hover fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.23)',
      borderWidth: '1px'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2 !important',
      borderWidth: '2px !important'
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(0, 0, 0, 0.6)',
    '&.Mui-focused': {
      color: '#1976d2'
    }
  },
  '& .MuiOutlinedInput-input': {
    WebkitAppearance: 'none',
    '&:focus': {
      WebkitAppearance: 'none',
      boxShadow: 'none'
    }
  }
};

const ClientRegistration: React.FC = () => {
  const [client, setClient] = useState<Client>({
    id: '',
    name: '',
    whatsapp: '',
    service: '',
    value: 0,
    billingDay: 1,
    recurrence: '',
  });

  const [services, setServices] = useState<string[]>([]);
  const [openServiceDialog, setOpenServiceDialog] = useState(false);
  const [newService, setNewService] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as any
  });

  // Carregar serviços do localStorage
  useEffect(() => {
    const savedServices = localStorage.getItem('services');
    if (savedServices) {
      setServices(JSON.parse(savedServices));
    } else {
      const defaultServices = ['Manutenção', 'Manutenção de site'];
      localStorage.setItem('services', JSON.stringify(defaultServices));
      setServices(defaultServices);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setClient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formato do WhatsApp
    const whatsappRegex = /^55\d{10,11}$/;
    if (!whatsappRegex.test(client.whatsapp)) {
      setSnackbar({
        open: true,
        message: 'O número do WhatsApp deve começar com 55 e ter o formato correto. Ex: 5511999999999',
        severity: 'error'
      });
      return;
    }

    // Validar dia de cobrança
    const billingDay = parseInt(client.billingDay.toString());
    if (billingDay < 1 || billingDay > 31) {
      setSnackbar({
        open: true,
        message: 'O dia de cobrança deve estar entre 1 e 31',
        severity: 'error'
      });
      return;
    }

    const newClient = {
      ...client,
      id: Date.now().toString(),
      value: parseFloat(client.value.toString()),
      billingDay: billingDay
    };

    const savedClients = localStorage.getItem('clients');
    const clients = savedClients ? JSON.parse(savedClients) : [];
    clients.push(newClient);
    localStorage.setItem('clients', JSON.stringify(clients));

    setClient({
      id: '',
      name: '',
      whatsapp: '',
      service: '',
      value: 0,
      billingDay: 1,
      recurrence: '',
    });

    setSnackbar({
      open: true,
      message: 'Cliente cadastrado com sucesso!',
      severity: 'success'
    });
  };

  const handleAddService = () => {
    if (newService.trim()) {
      const updatedServices = [...services, newService.trim()];
      setServices(updatedServices);
      localStorage.setItem('services', JSON.stringify(updatedServices));
      setNewService('');
      setOpenServiceDialog(false);
    }
  };

  const handleDeleteService = (serviceToDelete: string) => {
    const updatedServices = services.filter(service => service !== serviceToDelete);
    setServices(updatedServices);
    localStorage.setItem('services', JSON.stringify(updatedServices));
  };

  return (
    <Container maxWidth="md">
      <CssBaseline />
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          '& *:focus': {
            outline: 'none !important'
          }
        }}
      >
        <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3, fontWeight: 'medium' }}>
          Cadastro de Cliente
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nome"
                name="name"
                value={client.name}
                onChange={handleInputChange}
                variant="outlined"
                sx={commonFieldStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="WhatsApp"
                name="whatsapp"
                value={client.whatsapp}
                onChange={handleInputChange}
                placeholder="5511999999999"
                variant="outlined"
                sx={commonFieldStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel 
                  id="service-label"
                  sx={{
                    '&.Mui-focused': {
                      color: '#1976d2'
                    }
                  }}
                >
                  Serviço
                </InputLabel>
                <Select
                  labelId="service-label"
                  name="service"
                  value={client.service}
                  onChange={handleSelectChange}
                  label="Serviço"
                  sx={commonFieldStyle}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setOpenServiceDialog(true)}
                        edge="end"
                        sx={{ 
                          mr: 1,
                          color: 'primary.main'
                        }}
                      >
                        <AddCircleIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                >
                  {services.map((service) => (
                    <MenuItem key={service} value={service}>
                      {service}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Valor"
                name="value"
                type="number"
                value={client.value}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                variant="outlined"
                sx={commonFieldStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Dia de Cobrança"
                name="billingDay"
                type="number"
                value={client.billingDay}
                onChange={handleInputChange}
                helperText="Digite um dia entre 1 e 31"
                variant="outlined"
                sx={commonFieldStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel 
                  id="recurrence-label"
                  sx={{
                    '&.Mui-focused': {
                      color: '#1976d2'
                    }
                  }}
                >
                  Recorrência
                </InputLabel>
                <Select
                  labelId="recurrence-label"
                  name="recurrence"
                  value={client.recurrence}
                  onChange={handleSelectChange}
                  label="Recorrência"
                  sx={commonFieldStyle}
                >
                  {RECURRENCE_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 500
                }}
              >
                Cadastrar Cliente
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Dialog 
        open={openServiceDialog} 
        onClose={() => setOpenServiceDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            borderRadius: 2,
            minWidth: 300
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
          Gerenciar Serviços
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              label="Nome do Serviço"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              variant="outlined"
              sx={{
                ...commonFieldStyle,
                mb: 2
              }}
            />
            <List>
              {services.map((service) => (
                <ListItem
                  key={service}
                  disablePadding
                  sx={{ 
                    py: 1,
                    px: 2,
                    mb: 1,
                    backgroundColor: '#fff',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  <Typography
                    sx={{
                      flex: 1,
                      color: '#000'
                    }}
                  >
                    {service}
                  </Typography>
                  <IconButton 
                    edge="end" 
                    onClick={() => handleDeleteService(service)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenServiceDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddService} variant="contained">Adicionar</Button>
        </DialogActions>
      </Dialog>
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </Container>
  );
};

export default ClientRegistration;
