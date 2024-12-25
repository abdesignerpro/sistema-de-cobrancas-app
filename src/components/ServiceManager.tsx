import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Grid,
  Box,
  InputAdornment,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export interface Service {
  id: string;
  name: string;
}

interface ServiceManagerProps {
  open: boolean;
  onClose: () => void;
  onServiceAdded: () => void;
}

const ServiceManager: React.FC<ServiceManagerProps> = ({ open, onClose, onServiceAdded }) => {
  const theme = useTheme();
  const [services, setServices] = useState<Service[]>([]);
  const [newServiceName, setNewServiceName] = useState('');

  useEffect(() => {
    const savedServices = localStorage.getItem('services');
    if (savedServices) {
      setServices(JSON.parse(savedServices));
    }
  }, []);

  const handleAddService = () => {
    if (newServiceName.trim()) {
      const newService: Service = {
        id: Date.now().toString(),
        name: newServiceName.trim()
      };
      const updatedServices = [...services, newService];
      setServices(updatedServices);
      localStorage.setItem('services', JSON.stringify(updatedServices));
      setNewServiceName('');
      onServiceAdded();
    }
  };

  const handleDeleteService = (serviceId: string) => {
    const updatedServices = services.filter(service => service.id !== serviceId);
    setServices(updatedServices);
    localStorage.setItem('services', JSON.stringify(updatedServices));
    onServiceAdded();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleAddService();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" color="primary" sx={{ fontWeight: 'medium' }}>
          Gerenciar Serviços
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome do Serviço"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Digite o nome do serviço"
                  variant="outlined"
                  size="small"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="submit"
                          edge="end"
                          disabled={!newServiceName.trim()}
                          sx={{
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'primary.dark',
                            },
                            '&.Mui-disabled': {
                              backgroundColor: 'action.disabledBackground',
                              color: 'action.disabled',
                            },
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </Box>

        {services.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Nenhum serviço cadastrado
            </Typography>
          </Box>
        ) : (
          <List>
            {services.map((service) => (
              <ListItem
                key={service.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteService(service.id)}
                    sx={{
                      color: theme.palette.error.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {service.name}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          fullWidth
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceManager;
