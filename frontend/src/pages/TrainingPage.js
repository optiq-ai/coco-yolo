import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  TextField, 
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  CircularProgress,
  FormControlLabel,
  Switch
} from '@mui/material';
import { 
  PlayArrow, 
  Stop, 
  Delete, 
  Edit, 
  Add, 
  Refresh, 
  Save,
  CloudUpload,
  Settings
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const TrainingPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [trainings, setTrainings] = useState([]);
  const [models, setModels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTraining, setCurrentTraining] = useState(null);
  const [trainingForm, setTrainingForm] = useState({
    name: '',
    description: '',
    modelId: '',
    datasetId: '',
    epochs: 10,
    batchSize: 16,
    learningRate: 0.001,
    augmentation: false
  });

  // Przykładowe dane dla wykresu
  const sampleMetrics = [
    { epoch: 1, loss: 0.8, accuracy: 0.6, val_loss: 0.9, val_accuracy: 0.55 },
    { epoch: 2, loss: 0.7, accuracy: 0.65, val_loss: 0.85, val_accuracy: 0.6 },
    { epoch: 3, loss: 0.6, accuracy: 0.7, val_loss: 0.8, val_accuracy: 0.65 },
    { epoch: 4, loss: 0.55, accuracy: 0.75, val_loss: 0.75, val_accuracy: 0.7 },
    { epoch: 5, loss: 0.5, accuracy: 0.8, val_loss: 0.7, val_accuracy: 0.75 },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (training = null) => {
    if (training) {
      setCurrentTraining(training);
      setTrainingForm({
        name: training.name,
        description: training.description || '',
        modelId: training.modelId,
        datasetId: training.datasetId,
        epochs: training.epochs,
        batchSize: training.batchSize,
        learningRate: training.learningRate,
        augmentation: training.augmentation
      });
    } else {
      setCurrentTraining(null);
      setTrainingForm({
        name: '',
        description: '',
        modelId: '',
        datasetId: '',
        epochs: 10,
        batchSize: 16,
        learningRate: 0.001,
        augmentation: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTrainingForm({
      ...trainingForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmitForm = () => {
    // Tutaj logika zapisywania/aktualizacji treningu
    console.log('Zapisywanie treningu:', trainingForm);
    handleCloseDialog();
  };

  const handleStartTraining = (trainingId) => {
    console.log('Rozpoczynanie treningu:', trainingId);
    // Tutaj logika rozpoczynania treningu
  };

  const handleStopTraining = (trainingId) => {
    console.log('Zatrzymywanie treningu:', trainingId);
    // Tutaj logika zatrzymywania treningu
  };

  const handleDeleteTraining = (trainingId) => {
    console.log('Usuwanie treningu:', trainingId);
    // Tutaj logika usuwania treningu
  };

  // Symulacja pobierania danych
  useEffect(() => {
    // Tutaj pobieranie danych z API
    setTrainings([
      { 
        id: 1, 
        name: 'Training 1', 
        description: 'First training session',
        modelId: 1,
        datasetId: 1,
        epochs: 10,
        batchSize: 16,
        learningRate: 0.001,
        augmentation: true,
        status: 'completed',
        progress: 100,
        createdAt: '2025-04-10T12:00:00Z',
        metrics: sampleMetrics
      },
      { 
        id: 2, 
        name: 'Training 2', 
        description: 'Second training session',
        modelId: 2,
        datasetId: 2,
        epochs: 20,
        batchSize: 32,
        learningRate: 0.0005,
        augmentation: false,
        status: 'in_progress',
        progress: 45,
        createdAt: '2025-04-12T10:30:00Z',
        metrics: sampleMetrics.slice(0, 3)
      },
      { 
        id: 3, 
        name: 'Training 3', 
        description: 'Third training session',
        modelId: 1,
        datasetId: 3,
        epochs: 15,
        batchSize: 24,
        learningRate: 0.0008,
        augmentation: true,
        status: 'pending',
        progress: 0,
        createdAt: '2025-04-15T09:15:00Z',
        metrics: []
      }
    ]);

    setModels([
      { id: 1, name: 'YOLOv8n' },
      { id: 2, name: 'YOLOv8s' },
      { id: 3, name: 'YOLOv8m' }
    ]);

    setDatasets([
      { id: 1, name: 'COCO Dataset' },
      { id: 2, name: 'Custom Dataset 1' },
      { id: 3, name: 'Custom Dataset 2' }
    ]);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Trenowanie modeli
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => handleOpenDialog()}
        >
          Nowe trenowanie
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Wszystkie treningi" />
          <Tab label="W trakcie" />
          <Tab label="Zakończone" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nazwa</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Dataset</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Postęp</TableCell>
                <TableCell>Data utworzenia</TableCell>
                <TableCell>Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trainings.map((training) => (
                <TableRow key={training.id}>
                  <TableCell>{training.name}</TableCell>
                  <TableCell>
                    {models.find(m => m.id === training.modelId)?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {datasets.find(d => d.id === training.datasetId)?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={
                        training.status === 'completed' ? 'Zakończony' : 
                        training.status === 'in_progress' ? 'W trakcie' : 
                        'Oczekujący'
                      }
                      color={
                        training.status === 'completed' ? 'success' : 
                        training.status === 'in_progress' ? 'primary' : 
                        'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress variant="determinate" value={training.progress} />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {`${Math.round(training.progress)}%`}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(training.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Box>
                      {training.status === 'pending' && (
                        <IconButton 
                          color="primary" 
                          onClick={() => handleStartTraining(training.id)}
                          title="Rozpocznij trenowanie"
                        >
                          <PlayArrow />
                        </IconButton>
                      )}
                      {training.status === 'in_progress' && (
                        <IconButton 
                          color="warning" 
                          onClick={() => handleStopTraining(training.id)}
                          title="Zatrzymaj trenowanie"
                        >
                          <Stop />
                        </IconButton>
                      )}
                      <IconButton 
                        color="info" 
                        onClick={() => handleOpenDialog(training)}
                        title="Edytuj"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteTraining(training.id)}
                        title="Usuń"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {trainings.length > 0 && activeTab === 0 && (
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Szczegóły ostatniego treningu
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {trainings[0].name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {trainings[0].description}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Metryki treningu
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={trainings[0].metrics}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="epoch" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="loss" stroke="#8884d8" name="Loss" />
                        <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" name="Accuracy" />
                        <Line type="monotone" dataKey="val_loss" stroke="#ff8884" name="Validation Loss" />
                        <Line type="monotone" dataKey="val_accuracy" stroke="#4caf50" name="Validation Accuracy" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Parametry treningu
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell><strong>Model</strong></TableCell>
                            <TableCell>{models.find(m => m.id === trainings[0].modelId)?.name || 'Unknown'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>Dataset</strong></TableCell>
                            <TableCell>{datasets.find(d => d.id === trainings[0].datasetId)?.name || 'Unknown'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>Epoki</strong></TableCell>
                            <TableCell>{trainings[0].epochs}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>Batch Size</strong></TableCell>
                            <TableCell>{trainings[0].batchSize}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>Learning Rate</strong></TableCell>
                            <TableCell>{trainings[0].learningRate}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>Augmentacja</strong></TableCell>
                            <TableCell>{trainings[0].augmentation ? 'Tak' : 'Nie'}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Dialog do tworzenia/edycji treningu */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentTraining ? 'Edytuj trenowanie' : 'Nowe trenowanie'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Nazwa treningu"
                fullWidth
                value={trainingForm.name}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Model</InputLabel>
                <Select
                  name="modelId"
                  value={trainingForm.modelId}
                  label="Model"
                  onChange={handleFormChange}
                >
                  {models.map(model => (
                    <MenuItem key={model.id} value={model.id}>{model.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Opis"
                fullWidth
                multiline
                rows={2}
                value={trainingForm.description}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Dataset</InputLabel>
                <Select
                  name="datasetId"
                  value={trainingForm.datasetId}
                  label="Dataset"
                  onChange={handleFormChange}
                >
                  {datasets.map(dataset => (
                    <MenuItem key={dataset.id} value={dataset.id}>{dataset.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="epochs"
                label="Liczba epok"
                type="number"
                fullWidth
                value={trainingForm.epochs}
                onChange={handleFormChange}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="batchSize"
                label="Batch Size"
                type="number"
                fullWidth
                value={trainingForm.batchSize}
                onChange={handleFormChange}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="learningRate"
                label="Learning Rate"
                type="number"
                fullWidth
                value={trainingForm.learningRate}
                onChange={handleFormChange}
                InputProps={{ inputProps: { min: 0.0001, step: 0.0001 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="augmentation"
                    checked={trainingForm.augmentation}
                    onChange={handleFormChange}
                  />
                }
                label="Augmentacja danych"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={handleSubmitForm} variant="contained">
            {currentTraining ? 'Aktualizuj' : 'Utwórz'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TrainingPage;
