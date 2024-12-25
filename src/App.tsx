import React from 'react';
import { BrowserRouter as Router, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { Box, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, ThemeProvider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ClientRegistration from './components/ClientRegistration';
import ApiConfiguration from './components/ApiConfiguration';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import AutomaticSending from './components/AutomaticSending';
import theme from './theme';
import { styled } from '@mui/material/styles';

const drawerWidth = 125;

const AppContainer = styled('div')({
  display: 'flex',
  minHeight: '100vh',
});

const MainContent = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginLeft: drawerWidth,
  overflow: 'auto',
}));

const StyledDrawer = styled(Drawer)({
  width: drawerWidth,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
    overflowX: 'hidden',
    '& .MuiList-root': {
      overflowY: 'auto',
      '&::-webkit-scrollbar': {
        display: 'none'
      },
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }
  },
});

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Cadastrar Cliente', icon: <PersonAddIcon />, path: '/cadastrar' },
  { text: 'Clientes', icon: <PeopleIcon />, path: '/clientes' },
  { text: 'Envio Automático', icon: <SendIcon />, path: '/envio' },
  { text: 'Configurações', icon: <SettingsIcon />, path: '/configuracoes' },
];

const AppContent = () => {
  const history = useHistory();
  const location = useLocation();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContainer>
        <StyledDrawer variant="permanent">
          <Box sx={{ 
            p: 2.5, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            mb: 2
          }}>
            <WhatsAppIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              CobrançasPRO
            </Typography>
          </Box>
          <List>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || 
                             (item.path === '/' && location.pathname === '');
              return (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => history.push(item.path)}
                  sx={{
                    mx: 1,
                    mb: 0.5,
                    borderRadius: 1,
                    backgroundColor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActive ? 'white' : 'primary.main',
                    minWidth: 40
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isActive ? 500 : 400
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </StyledDrawer>
        <MainContent>
          <Switch>
            <Route exact path="/" component={Dashboard} />
            <Route path="/cadastrar" component={ClientRegistration} />
            <Route path="/clientes" component={ClientList} />
            <Route path="/envio" component={AutomaticSending} />
            <Route path="/configuracoes" component={ApiConfiguration} />
          </Switch>
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
