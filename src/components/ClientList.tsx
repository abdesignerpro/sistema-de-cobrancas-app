import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Link,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Container,
  alpha,
  SelectChangeEvent,
  AlertColor
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SearchIcon from '@mui/icons-material/Search';
import CustomSnackbar from './CustomSnackbar';
import axios from 'axios';

interface Client {
  id: string;
  name: string;
  whatsapp: string;
  service: string;
  value: number;
  billingDay: number; // Dia do mês para cobrança (1-31)
  recurrence: string;
  lastBillingDate?: string;
}

interface Service {
  id: string;
  name: string;
}

const RECURRENCE_LABELS: { [key: string]: string } = {
  'monthly': 'Mensal',
  '3_months': 'Trimestral',
  '6_months': 'Semestral',
  '1_year': 'Anual'
};

const RECURRENCE_MONTHS: { [key: string]: number } = {
  'monthly': 1,
  '3_months': 3,
  '6_months': 6,
  '1_year': 12
};

const RECURRENCE_OPTIONS = [
  { value: 'monthly', label: 'Mensal' },
  { value: '3_months', label: 'Trimestral' },
  { value: '6_months', label: 'Semestral' },
  { value: '1_year', label: 'Anual' }
];

const crcTable = [
  0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7, 0x8108,
  0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef, 0x1231, 0x0210,
  0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6, 0x9339, 0x8318, 0xb37b,
  0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de, 0x2462, 0x3443, 0x0420, 0x1401,
  0x64e6, 0x74c7, 0x44a4, 0x5485, 0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee,
  0xf5cf, 0xc5ac, 0xd58d, 0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6,
  0x5695, 0x46b4, 0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d,
  0xc7bc, 0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
  0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b, 0x5af5,
  0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12, 0xdbfd, 0xcbdc,
  0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a, 0x6ca6, 0x7c87, 0x4ce4,
  0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41, 0xedae, 0xfd8f, 0xcdec, 0xddcd,
  0xad2a, 0xbd0b, 0x8d68, 0x9d49, 0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13,
  0x2e32, 0x1e51, 0x0e70, 0xff9f, 0xefbe, 0xdfdd, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8,
  0x8dc9, 0x7c26, 0x6c07, 0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1, 0xef1f,
  0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8, 0x6e17, 0x7e36, 0x4e55,
  0x5e74, 0x2e93, 0x3eb2, 0x0ed1, 0x1ef0,
];

const calculateCRC16 = (str: string) => {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    const t = ((crc >> 8) ^ c) & 0xFF;
    crc = ((crc << 8) ^ crcTable[t]) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
};

const shouldSendMessage = (client: Client, daysBeforeDue: number): boolean => {
  if (!client.billingDay) return false;

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Calcula o próximo dia de cobrança
  const billingDate = new Date(currentYear, currentMonth, client.billingDay);
  
  // Se o dia de cobrança já passou este mês, usa o próximo mês
  if (today.getDate() > client.billingDay) {
    billingDate.setMonth(billingDate.getMonth() + 1);
  }

  const diffTime = billingDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Se já foi enviada cobrança neste mês, não envia novamente
  if (client.lastBillingDate) {
    const lastBilling = new Date(client.lastBillingDate);
    if (lastBilling.getMonth() === today.getMonth() && 
        lastBilling.getFullYear() === today.getFullYear()) {
      return false;
    }
  }

  return diffDays === daysBeforeDue;
};

const getAdjustedBillingDate = (billingDay: number, targetDate: Date = new Date()): Date => {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  
  // Criar uma data com o dia escolhido
  const proposedDate = new Date(year, month, billingDay);
  
  // Se o mês da data proposta for diferente do mês alvo,
  // significa que houve overflow para o próximo mês
  // (ex: 31 de abril vira 1 de maio)
  if (proposedDate.getMonth() !== month) {
    // Neste caso, retornamos o último dia do mês alvo
    return new Date(year, month + 1, 0);
  }
  
  return proposedDate;
};

// Lista de serviços disponíveis
const DEFAULT_SERVICES = [
  'Manutenção de site',
  'Desenvolvimento de site',
  'Hospedagem',
  'Domínio',
  'Manutenção',
  'Consultoria',
  'Marketing Digital',
  'Design Gráfico',
  'Suporte Técnico'
];

const ClientList: React.FC = () => {
  const theme = useTheme();
  const [clients, setClients] = useState<Client[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [services, setServices] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as AlertColor
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Carrega os clientes do backend
    fetch('https://sistema-de-cobrancas-cobrancas-server.yzgqzv.easypanel.host/charges')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Garante que o valor é sempre um número
          const clients = data.map((client: Client) => ({
            ...client,
            value: parseFloat(client.value.toString())
          }));
          setClients(clients);
        }
      })
      .catch(error => console.error('Erro ao carregar clientes do backend:', error));
  }, []);

  const handleEdit = (client: Client) => {
    setClientToEdit(client);
    setEditMode(true);
  };

  const handleDelete = (client: Client) => {
    setClientToDelete(client);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (clientToDelete) {
      try {
        const response = await fetch(`https://sistema-de-cobrancas-cobrancas-server.yzgqzv.easypanel.host/charges/${clientToDelete.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Erro ao excluir cliente');
        }

        const updatedClients = clients.filter(client => client.id !== clientToDelete.id);
        setClients(updatedClients);
        setDeleteConfirmOpen(false);
        setClientToDelete(null);
        setSnackbar({
          open: true,
          message: 'Cliente excluído com sucesso!',
          severity: 'success'
        });
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao excluir cliente. Tente novamente.',
          severity: 'error'
        });
      }
    }
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    if (clientToEdit) {
      let value: string | number = e.target.value;
      
      // Converte o valor para número quando for o campo value
      if (e.target.name === 'value') {
        value = parseFloat(e.target.value) || 0;
      }

      setClientToEdit({
        ...clientToEdit,
        [e.target.name]: value,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (clientToEdit) {
      const updatedClient = {
        ...clientToEdit,
        value: parseFloat(clientToEdit.value.toString())
      };

      try {
        const response = await fetch('https://sistema-de-cobrancas-cobrancas-server.yzgqzv.easypanel.host/charges', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([updatedClient])
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar cliente');
        }

        const updatedClients = clients.map(client =>
          client.id === updatedClient.id ? updatedClient : client
        );

        setClients(updatedClients);
        setEditMode(false);
        setClientToEdit(null);
        setSnackbar({
          open: true,
          message: 'Cliente atualizado com sucesso!',
          severity: 'success'
        });
      } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao atualizar cliente. Tente novamente.',
          severity: 'error'
        });
      }
    }
  };

  const formatValue = (value: string | number): string => {
    try {
      // Remove caracteres não numéricos, exceto ponto e vírgula
      const cleanValue = String(value).replace(/[^\d.,]/g, '');
      
      // Substitui vírgula por ponto para garantir formato numérico
      const numericValue = cleanValue.replace(',', '.');
      
      // Converte para número e formata com 2 casas decimais
      const formattedValue = Number(numericValue).toFixed(2);
      
      // Retorna o valor formatado com R$
      return `R$ ${formattedValue}`;
    } catch (error) {
      console.error('Erro ao formatar valor:', error);
      return String(value); // Retorna o valor original em caso de erro
    }
  };

  const handleSendMessage = async (client: Client) => {
    const apiConfig = JSON.parse(localStorage.getItem('apiConfig') || '{}');

    if (!apiConfig.apiKey || !apiConfig.instanceName) {
      setSnackbar({
        open: true,
        message: 'Configure a API primeiro!',
        severity: 'error'
      });
      return;
    }

    try {
      // Garante que o valor é um número antes de usar toFixed
      const value = typeof client.value === 'string' ? parseFloat(client.value) : client.value;
      if (isNaN(value)) {
        throw new Error('Valor inválido');
      }

      // Primeiro envia a mensagem de texto
      const message = generateMessage(client, apiConfig);
      const phoneNumber = client.whatsapp.replace(/\D/g, '');
      
      const textPayload = {
        number: phoneNumber,
        text: message,
        options: {
          delay: 1000,
          presence: "composing"
        }
      };

      const textResponse = await fetch(`${apiConfig.apiUrl}/message/sendText/${apiConfig.instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiConfig.apiKey
        },
        body: JSON.stringify(textPayload)
      });

      const textResult = await textResponse.text();
      if (!textResponse.ok) {
        throw new Error(`Erro ao enviar mensagem de texto: ${textResult}`);
      }

      // Depois envia o QR Code como imagem
      const qrCodeUrl = `https://gerarqrcodepix.com.br/api/v1?nome=${apiConfig.pixName}&cidade=${apiConfig.pixCity}&valor=${value.toFixed(2)}&saida=qr&chave=${apiConfig.pixKey}&txid=${apiConfig.pixTxid}`;
      
      const mediaPayload = {
        number: phoneNumber,
        mediatype: "image",
        media: qrCodeUrl,
        fileName: "qrcode_pix.png",
        caption: "QR Code para pagamento via PIX\n\n*Código PIX abaixo para copiar e colar 👇🏼*",
        options: {
          delay: 1000,
          presence: "composing"
        }
      };

      const mediaResponse = await fetch(`${apiConfig.apiUrl}/message/sendMedia/${apiConfig.instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiConfig.apiKey
        },
        body: JSON.stringify(mediaPayload)
      });

      const mediaResult = await mediaResponse.text();
      if (!mediaResponse.ok) {
        throw new Error(`Erro ao enviar QR Code: ${mediaResult}`);
      }

      // Por fim, envia o código PIX como texto
      const brcode = `00020126330014br.gov.bcb.pix0111${apiConfig.pixKey}5204000053039865406${value.toFixed(2)}5802BR5915${apiConfig.pixName}6013${apiConfig.pixCity}62170513${apiConfig.pixTxid}6304`;
      const crc16 = calculateCRC16(brcode);
      const fullBRCode = brcode + crc16;

      const pixPayload = {
        number: phoneNumber,
        text: `${fullBRCode}`,
        options: {
          delay: 1000,
          presence: "composing"
        }
      };

      const pixTextResponse = await fetch(`${apiConfig.apiUrl}/message/sendText/${apiConfig.instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiConfig.apiKey
        },
        body: JSON.stringify(pixPayload)
      });

      const pixResult = await pixTextResponse.text();
      if (!pixTextResponse.ok) {
        throw new Error(`Erro ao enviar código PIX: ${pixResult}`);
      }

      // Atualiza a data do último envio
      const updatedClient = {
        ...client,
        lastBillingDate: new Date().toISOString().split('T')[0]
      };

      const updatedClients = clients.map(c => 
        c.id === client.id ? updatedClient : c
      );
      setClients(updatedClients);

      setSnackbar({
        open: true,
        message: 'Mensagem enviada com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao enviar mensagem: ' + error,
        severity: 'error'
      });
    }
  };

  const generateMessage = (client: Client, apiConfig: any) => {
    const config = localStorage.getItem('automaticSendingConfig');
    let messageTemplate = '';
    
    if (config) {
      const { messageTemplate: template } = JSON.parse(config);
      messageTemplate = template;
    }

    if (!messageTemplate) {
      const nextBillingDate = getAdjustedBillingDate(client.billingDay);
      const formattedDate = nextBillingDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      const formattedValue = formatValue(client.value);

      return `Olá ${client.name}! Este é um lembrete da sua mensalidade no valor de ${formattedValue} com vencimento em ${formattedDate}. Por favor, entre em contato para mais informações.`;
    }

    return messageTemplate
      .replace('{nome}', client.name)
      .replace('{servico}', client.service)
      .replace('{valor}', client.value.toFixed(2))
      .replace('{dias}', client.billingDay.toString())
      .replace('{empresa}', apiConfig.pixName || ''); // Nome da empresa das configurações do PIX
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.whatsapp.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg">
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 'medium' }}>
            Clientes Cadastrados
          </Typography>
          <TextField
            placeholder="Buscar cliente..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
        </Box>

        {filteredClients.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Nenhum cliente encontrado
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>WhatsApp</TableCell>
                  <TableCell>Serviço</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell>Dia de Cobrança</TableCell>
                  <TableCell>Recorrência</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow
                    key={client.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {client.name}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`https://wa.me/${client.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {client.whatsapp}
                      </Link>
                    </TableCell>
                    <TableCell>{client.service}</TableCell>
                    <TableCell align="right">
                      {formatValue(client.value)}
                    </TableCell>
                    <TableCell>{client.billingDay}</TableCell>
                    <TableCell>
                      {RECURRENCE_OPTIONS.find(
                        (option) => option.value === client.recurrence
                      )?.label}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleSendMessage(client)}
                          sx={{
                            color: '#25D366',
                            '&:hover': {
                              backgroundColor: alpha('#25D366', 0.1),
                            },
                          }}
                        >
                          <WhatsAppIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(client)}
                          sx={{
                            color: theme.palette.primary.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(client)}
                          sx={{
                            color: theme.palette.error.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={editMode}
        onClose={() => {
          setEditMode(false);
          setClientToEdit(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Cliente</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Nome"
                name="name"
                value={clientToEdit?.name || ''}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="WhatsApp"
                name="whatsapp"
                value={clientToEdit?.whatsapp || ''}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="service-label">Serviço</InputLabel>
                <Select
                  labelId="service-label"
                  value={clientToEdit?.service || ''}
                  name="service"
                  onChange={handleEditChange}
                  label="Serviço"
                >
                  {services.map((service) => (
                    <MenuItem key={service} value={service}>
                      {service}
                    </MenuItem>
                  ))}
                  <MenuItem value="">
                    <Box sx={{ color: 'text.secondary' }}>
                      Selecione um serviço
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Valor"
                name="value"
                value={clientToEdit?.value || ''}
                onChange={handleEditChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Dia de Cobrança"
                name="billingDay"
                value={clientToEdit?.billingDay || ''}
                onChange={handleEditChange}
                inputProps={{ min: 1, max: 31 }}
                helperText="Digite um dia entre 1 e 31"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Recorrência</InputLabel>
                <Select
                  value={clientToEdit?.recurrence || ''}
                  name="recurrence"
                  onChange={handleEditChange}
                  label="Recorrência"
                >
                  {RECURRENCE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditMode(false);
            setClientToEdit(null);
          }}>Cancelar</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setClientToDelete(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteConfirmOpen(false);
            setClientToDelete(null);
          }}>Cancelar</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Excluir
          </Button>
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

export default ClientList;
