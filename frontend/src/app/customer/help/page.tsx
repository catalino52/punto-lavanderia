'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Grid,
  Divider,
  Card,
  CardContent,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  LocalLaundryService as LaundryIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  ContactSupport as SupportIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  LiveHelp as LiveHelpIcon
} from '@mui/icons-material';

// FAQ data
const faqCategories = [
  {
    id: 'general',
    name: 'General',
    icon: <InfoIcon color="primary" />,
    faqs: [
      {
        question: '¿Qué es PUNTO LAVANDERÍA?',
        answer: 'PUNTO LAVANDERÍA te permite solicitar servicios de lavandería en línea. Ofrecemos lavado regular, lavado en seco y planchado, con recogida y entrega.'
      },
      {
        question: '¿Cómo creo una cuenta?',
        answer: 'Para crear una cuenta, selecciona «Registrarme» en la página de inicio de sesión. Completa tu nombre, correo electrónico, número de teléfono y contraseña. Verifica tu cuenta para comenzar a usar nuestros servicios.'
      },
      {
        question: '¿Puedo solicitar servicios en cualquier momento?',
        answer: 'Sí, puedes solicitar servicios desde la aplicación las 24 horas del día. Nuestro horario de atención es de 8:00 a. m. a 9:00 p. m.'
      }
    ]
  },
  {
    id: 'orders',
    name: 'Órdenes',
    icon: <LaundryIcon color="primary" />,
    faqs: [
      {
        question: '¿Cómo solicito un servicio de lavandería?',
        answer: 'Inicia sesión y selecciona «Nueva orden» en el panel. Elige el servicio y la cantidad, selecciona la hora de recogida, ingresa tu dirección y método de pago, y confirma la orden.'
      },
      {
        question: '¿Puedo cambiar o cancelar una orden?',
        answer: 'Puedes cambiar o cancelar una orden mientras esté pendiente de confirmación. Si ya fue confirmada o está en proceso, comunícate con nuestro servicio al cliente.'
      },
      {
        question: '¿Cuánto tarda el servicio?',
        answer: 'El tiempo depende del servicio. El lavado regular suele tardar de 2 a 3 días laborables y el exprés puede estar listo en 24 horas. Puedes consultar el estado de tu orden en la aplicación.'
      }
    ]
  },
  {
    id: 'delivery',
    name: 'Entrega',
    icon: <ShippingIcon color="primary" />,
    faqs: [
      {
        question: '¿Ofrecen recogida y entrega?',
        answer: 'Sí, ofrecemos recogida y entrega. El costo depende de tu ubicación y se mostrará al finalizar la solicitud.'
      },
      {
        question: '¿Cuándo puedo programar la recogida o entrega?',
        answer: 'Puedes elegir uno de los horarios disponibles en la aplicación, entre las 8:00 a. m. y las 9:00 p. m.'
      },
      {
        question: '¿Qué pasa si no estoy en casa al momento de la entrega?',
        answer: 'Comunícate con nosotros para reprogramar la entrega sin costo adicional. También puedes dejar instrucciones para que entreguemos la ropa a un vecino o al personal de seguridad.'
      }
    ]
  },
  {
    id: 'payment',
    name: 'Pagos',
    icon: <PaymentIcon color="primary" />,
    faqs: [
      {
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Aceptamos tarjetas de crédito y débito, transferencias bancarias, billeteras digitales y efectivo al momento de la entrega.'
      },
      {
        question: '¿Hay cargos adicionales por algunos servicios?',
        answer: 'Algunos servicios especiales, como quitar manchas difíciles, lavar en seco o tratar prendas delicadas, pueden tener un costo adicional. El monto se mostrará al solicitar el servicio.'
      },
      {
        question: '¿Cómo obtengo una factura o un comprobante de pago?',
        answer: 'Cuando se complete la orden, enviaremos la factura o el comprobante a tu correo electrónico. También puedes consultarlo y descargarlo desde los detalles de la orden en la aplicación.'
      }
    ]
  },
  {
    id: 'schedule',
    name: 'Horarios',
    icon: <ScheduleIcon color="primary" />,
    faqs: [
      {
        question: '¿Cómo programo la recogida de mi ropa?',
        answer: 'Abre «Horarios» en el menú, elige una fecha y hora disponible, ingresa tu dirección y confirma. Recibirás una notificación cuando el mensajero esté en camino.'
      },
      {
        question: '¿Puedo cambiar la hora de recogida?',
        answer: 'Sí, puedes cambiarla hasta 2 horas antes de la hora programada. Abre los detalles del horario y selecciona «Cambiar horario».'
      },
      {
        question: '¿El servicio de recogida y entrega está disponible en todas las zonas?',
        answer: 'El servicio está disponible en la mayoría de las zonas de Santo Domingo y sus alrededores. Ingresa tu dirección en la aplicación para confirmar la cobertura.'
      }
    ]
  }
];

// Contact methods
const contactMethods = [
  {
    icon: <PhoneIcon fontSize="large" />,
    title: 'Teléfono',
    description: 'Llámanos al:',
    contact: '021-123-4567',
    available: 'Lunes a sábado, 8:00 a. m. a 8:00 p. m.'
  },
  {
    icon: <WhatsAppIcon fontSize="large" />,
    title: 'WhatsApp',
    description: 'Escríbenos por WhatsApp al:',
    contact: '0812-3456-7890',
    available: 'Las 24 horas, los 7 días de la semana'
  },
  {
    icon: <EmailIcon fontSize="large" />,
    title: 'Email',
    description: 'Envíanos un correo a:',
    contact: 'help@laundryapp.com',
    available: 'Respondemos en 24 horas'
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFaqs, setFilteredFaqs] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setHasSearched(true);
    
    // Simulate search delay
    setTimeout(() => {
      const results: any[] = [];
      
      faqCategories.forEach(category => {
        const matchingFaqs = category.faqs.filter(faq => 
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        if (matchingFaqs.length > 0) {
          results.push({
            category: category.name,
            icon: category.icon,
            faqs: matchingFaqs
          });
        }
      });
      
      setFilteredFaqs(results);
      setSearching(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setHasSearched(false);
    setSearchQuery('');
    setFilteredFaqs([]);
  };
  
  const renderFaqs = () => {
    if (hasSearched) {
      if (searching) {
        return (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress size={40} />
          </Box>
        );
      }
      
      if (filteredFaqs.length === 0) {
        return (
          <Alert 
            severity="info" 
            sx={{ mt: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => setHasSearched(false)}>
                Ver todas las preguntas frecuentes
              </Button>
            }
          >
            No encontramos preguntas frecuentes para «{searchQuery}». Prueba otra palabra o explora las categorías.
          </Alert>
        );
      }
      
      return filteredFaqs.map((result, index) => (
        <Box key={index} mb={4}>
          <Box display="flex" alignItems="center" mb={2}>
            {result.icon}
            <Typography variant="h6" ml={1}>
              {result.category}
            </Typography>
          </Box>
          
          {result.faqs.map((faq: any, faqIndex: number) => (
            <Accordion key={faqIndex} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={500}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ));
    }
    
    // Show faqs by category
    if (activeCategory === 'all') {
      return faqCategories.map((category, index) => (
        <Box key={category.id} mb={4}>
          <Box display="flex" alignItems="center" mb={2}>
            {category.icon}
            <Typography variant="h6" ml={1}>
              {category.name}
            </Typography>
          </Box>
          
          {category.faqs.map((faq, faqIndex) => (
            <Accordion key={faqIndex} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={500}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ));
    } else {
      const selectedCategory = faqCategories.find(cat => cat.id === activeCategory);
      if (!selectedCategory) return null;
      
      return (
        <Box mb={4}>
          <Box display="flex" alignItems="center" mb={2}>
            {selectedCategory.icon}
            <Typography variant="h6" ml={1}>
              {selectedCategory.name}
            </Typography>
          </Box>
          
          {selectedCategory.faqs.map((faq, faqIndex) => (
            <Accordion key={faqIndex} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={500}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      );
    }
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Centro de ayuda
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Encuentra respuestas a preguntas frecuentes o contáctanos si necesitas ayuda.
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            fullWidth
            placeholder="Busca una pregunta o tema de ayuda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={!searchQuery.trim() || searching}
            sx={{ minWidth: '120px', height: '56px' }}
          >
            {searching ? <CircularProgress size={24} /> : 'Buscar'}
          </Button>
        </Box>
      </Paper>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Kategori
            </Typography>
            
            <List component="nav" disablePadding>
              <Box 
                onClick={() => handleCategoryChange('all')}
                sx={{ 
                  borderRadius: 1, 
                  mb: 1, 
                  cursor: 'pointer',
                  bgcolor: activeCategory === 'all' ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LiveHelpIcon color={activeCategory === 'all' ? 'primary' : 'action'} />
                  </ListItemIcon>
                  <ListItemText primary="Todas las preguntas frecuentes" />
                </ListItem>
              </Box>
              
              {faqCategories.map((category) => (
                <Box 
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  sx={{ 
                    borderRadius: 1, 
                    mb: 1, 
                    cursor: 'pointer',
                    bgcolor: activeCategory === category.id ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {React.cloneElement(category.icon, { 
                        color: activeCategory === category.id ? 'primary' : 'action'
                      })}
                    </ListItemIcon>
                    <ListItemText primary={category.name} />
                    <Chip 
                      label={category.faqs.length} 
                      size="small" 
                      variant={activeCategory === category.id ? "filled" : "outlined"}
                      color={activeCategory === category.id ? "primary" : "default"}
                      sx={{ ml: 1 }}
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Masih Butuh Bantuan?
            </Typography>
            
            <Button
              variant="outlined"
              fullWidth
              startIcon={<SupportIcon />}
              href="#contact-section"
              sx={{ mt: 1 }}
            >
              Contáctanos
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={9}>
          {/* FAQ content */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Preguntas frecuentes
            </Typography>
            
            <Box mt={3}>
              {renderFaqs()}
            </Box>
          </Paper>
          
          {/* Contact section */}
          <Box id="contact-section">
            <Typography variant="h5" gutterBottom>
              Contáctanos
            </Typography>
            
            <Typography variant="body1" color="textSecondary" paragraph>
              Si no encuentras la respuesta que buscas, nuestro equipo de atención al cliente está para ayudarte.
            </Typography>
            
            <Grid container spacing={3} mt={1}>
              {contactMethods.map((method, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ height: '100%', borderRadius: 2 }}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Box color="primary.main" mb={2}>
                        {method.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {method.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {method.description}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {method.contact}
                      </Typography>
                      <Chip 
                        label={method.available} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
} 