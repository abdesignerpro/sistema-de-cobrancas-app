import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PaymentsIcon from '@mui/icons-material/Payments';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

interface Client {
  id: string;
  name: string;
  whatsapp: string;
  service: string;
  value: number;
  billingDay: number;
  lastBillingDate?: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    activeClients: 0,
    monthlyRevenue: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    const calculateStats = () => {
      const clientsData = localStorage.getItem('clients');
      const clients: Client[] = clientsData ? JSON.parse(clientsData) : [];
      
      // Total de clientes ativos
      const activeClients = clients.length;

      // Faturamento mensal (soma dos valores de todos os clientes)
      const monthlyRevenue = clients.reduce((total, client) => total + client.value, 0);

      // Cobranças pendentes (clientes que não receberam cobrança este mês)
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      const pendingPayments = clients.filter(client => {
        if (!client.lastBillingDate) return true;
        
        const lastBilling = new Date(client.lastBillingDate);
        return lastBilling.getMonth() !== currentMonth || 
               lastBilling.getFullYear() !== currentYear;
      }).length;

      setStats({
        activeClients,
        monthlyRevenue,
        pendingPayments
      });
    };

    calculateStats();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Dashboard</Typography>
      
      <Grid container spacing={3}>
        {/* Clientes Ativos */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              borderTop: '4px solid #1976d2'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  backgroundColor: '#e3f2fd',
                  borderRadius: 2,
                  p: 1,
                  mr: 2
                }}
              >
                <PersonIcon sx={{ color: '#1976d2' }} />
              </Box>
              <Typography color="textSecondary">Clientes Ativos</Typography>
            </Box>
            <Typography variant="h4">{stats.activeClients}</Typography>
          </Paper>
        </Grid>

        {/* Faturamento Mensal */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              borderTop: '4px solid #2e7d32'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  backgroundColor: '#e8f5e9',
                  borderRadius: 2,
                  p: 1,
                  mr: 2
                }}
              >
                <PaymentsIcon sx={{ color: '#2e7d32' }} />
              </Box>
              <Typography color="textSecondary">Faturamento Mensal</Typography>
            </Box>
            <Typography variant="h4">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(stats.monthlyRevenue)}
            </Typography>
          </Paper>
        </Grid>

        {/* Cobranças Pendentes */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              borderTop: '4px solid #ed6c02'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  backgroundColor: '#fff3e0',
                  borderRadius: 2,
                  p: 1,
                  mr: 2
                }}
              >
                <NotificationsActiveIcon sx={{ color: '#ed6c02' }} />
              </Box>
              <Typography color="textSecondary">Cobranças Pendentes</Typography>
            </Box>
            <Typography variant="h4">{stats.pendingPayments}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
