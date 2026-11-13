'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  Inventory as InventoryIcon,
  Work as EmployeeIcon,
  BarChart as ReportsIcon,
  Settings as SettingsIcon,
  Payments as PaymentsIcon,
  LocalLaundryService as LaundryIcon,
  Notifications as NotificationsIcon,
  ManageAccounts as UserManagementIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const menuItems = [
  { text: 'Panel de control', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Pedidos', icon: <OrdersIcon />, path: '/orders' },
  { text: 'Clientes', icon: <PeopleIcon />, path: '/customers' },
  { text: 'Pagos', icon: <PaymentsIcon />, path: '/payments' },
  { text: 'Servicios', icon: <LaundryIcon />, path: '/services' },
  { text: 'Usuarios', icon: <UserManagementIcon />, path: '/users' },
  { text: 'Inventario', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'Empleados', icon: <EmployeeIcon />, path: '/employees' },
  { text: 'Informes', icon: <ReportsIcon />, path: '/reports' },
  { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
];

interface AdminDrawerProps {
  drawerWidth: number;
}

export default function AdminDrawer({ drawerWidth }: AdminDrawerProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const theme = useTheme();

  useEffect(() => {
    const handleToggleDrawer = () => {
      setMobileOpen(!mobileOpen);
    };

    window.addEventListener('toggle-drawer', handleToggleDrawer);
    return () => {
      window.removeEventListener('toggle-drawer', handleToggleDrawer);
    };
  }, [mobileOpen]);

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    // Handle other paths, accounting for sub-paths
    if (path !== '/dashboard' && pathname?.startsWith(path)) {
      return true;
    }
    return false;
  };

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ position: 'relative', width: 40, height: 40 }}>
            <Image 
              src="/logo.png" 
              alt="Logo" 
              fill 
              style={{ objectFit: 'contain' }} 
            />
          </Box>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            PUNTO LAVANDERIA
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <Link href={item.path} key={item.text} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                selected={isActive(item.path)}
                sx={{
                  borderRadius: '8px',
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main + '20',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main + '30',
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                    '& .MuiListItemText-primary': {
                      color: theme.palette.primary.main,
                      fontWeight: 'bold',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
} 