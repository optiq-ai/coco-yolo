import React from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent, CardMedia, Button } from '@mui/material';
import { BarChart, TrendingUp, Storage, Image, Settings, Speed } from '@mui/icons-material';

const DashboardPage = () => {
  // Przykładowe dane statystyczne
  const stats = [
    { id: 1, title: 'Obrazy', value: '1,254', icon: <Image color="primary" /> },
    { id: 2, title: 'Modele', value: '8', icon: <Storage color="primary" /> },
    { id: 3, title: 'Treningi', value: '12', icon: <TrendingUp color="primary" /> },
    { id: 4, title: 'Detekcje', value: '3,487', icon: <BarChart color="primary" /> },
  ];

  // Przykładowe ostatnie aktywności
  const recentActivities = [
    { id: 1, type: 'training', title: 'Trening YOLOv8n', description: 'Zakończony, mAP: 0.78', time: '2 godziny temu' },
    { id: 2, type: 'detection', title: 'Detekcja obiektów', description: '45 obrazów, 128 obiektów', time: '5 godzin temu' },
    { id: 3, type: 'upload', title: 'Przesłano obrazy', description: '32 nowe obrazy', time: '1 dzień temu' },
    { id: 4, type: 'model', title: 'Nowy model', description: 'YOLOv8m został dodany', time: '2 dni temu' },
  ];

  // Przykładowe modele
  const models = [
    { id: 1, name: 'YOLOv8n', description: 'Szybki, lekki model', mAP: 0.72, fps: 120 },
    { id: 2, name: 'YOLOv8s', description: 'Zbalansowany model', mAP: 0.78, fps: 85 },
    { id: 3, name: 'YOLOv8m', description: 'Dokładniejszy model', mAP: 0.83, fps: 45 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Karty statystyk */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.id}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 2,
              }}
            >
              <Box sx={{ mb: 1 }}>{stat.icon}</Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stat.value}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {stat.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Ostatnie aktywności */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Ostatnie aktywności
            </Typography>
            <Box>
              {recentActivities.map((activity) => (
                <Box 
                  key={activity.id} 
                  sx={{ 
                    borderBottom: '1px solid #eee', 
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'flex-start'
                  }}
                >
                  <Box sx={{ mr: 2, mt: 0.5 }}>
                    {activity.type === 'training' && <TrendingUp color="primary" />}
                    {activity.type === 'detection' && <BarChart color="primary" />}
                    {activity.type === 'upload' && <Image color="primary" />}
                    {activity.type === 'model' && <Storage color="primary" />}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2">
                      {activity.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.description}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button variant="text" color="primary">
                Zobacz wszystkie aktywności
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Modele */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Najlepsze modele
            </Typography>
            <Grid container spacing={2}>
              {models.map((model) => (
                <Grid item xs={12} key={model.id}>
                  <Card variant="outlined" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CardMedia
                      sx={{
                        width: 80,
                        height: 80,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#f5f5f5',
                      }}
                    >
                      <Storage fontSize="large" color="primary" />
                    </CardMedia>
                    <CardContent sx={{ flex: '1 0 auto' }}>
                      <Typography component="div" variant="h6">
                        {model.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" component="div">
                        {model.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          <BarChart fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            mAP: {model.mAP}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Speed fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {model.fps} FPS
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button variant="text" color="primary">
                Zobacz wszystkie modele
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Szybkie akcje */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Szybkie akcje
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<Image />}
                  sx={{ py: 1.5 }}
                >
                  Prześlij obrazy
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<BarChart />}
                  sx={{ py: 1.5 }}
                >
                  Detekcja obiektów
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<TrendingUp />}
                  sx={{ py: 1.5 }}
                >
                  Trenuj model
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<Settings />}
                  sx={{ py: 1.5 }}
                >
                  Ustawienia
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
