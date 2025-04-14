import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Card, CardContent, Divider, List, ListItem, ListItemText } from '@mui/material';
import { 
  PlayArrow, 
  Stop, 
  Refresh, 
  Save,
  CloudUpload,
  Settings,
  BarChart,
  CheckCircle,
  Error
} from '@mui/icons-material';

const TrainingPage = () => {
  const [models, setModels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTrainings, setActiveTrainings] = useState([]);
  const [completedTrainings, setCompletedTrainings] = useState([]);
  const [trainingParams, setTrainingParams] = useState({
    epochs: 100,
    batchSize: 16,
    learningRate: 0.001,
    imageSize: 640,
    augmentation: true,
    validationSplit: 0.2,
    earlyStop: true,
    patience: 10,
    optimizer: 'adam',
    weightDecay: 0.0005,
    momentum: 0.937,
    classWeights: false
  });
  
  // Przykładowe dane
  useEffect(() => {
    // Symulacja ładowania danych
    setIsLoading(true);
    
    setTimeout(() => {
      const mockDatasets = [
        { id: 'dataset1', name: 'Zbiór testowy', count: 120, classes: 5 },
        { id: 'dataset2', name: 'Zbiór treningowy', count: 500, classes: 8 },
        { id: 'dataset3', name: 'Zbiór walidacyjny', count: 100, classes: 5 },
        { id: 'dataset4', name: 'Zdjęcia z kamery', count: 45, classes: 3 },
      ];
      
      const mockModels = [
        { id: 'yolov8n', name: 'YOLOv8 Nano', type: 'YOLO', size: 'Mały', params: '3.2M' },
        { id: 'yolov8s', name: 'YOLOv8 Small', type: 'YOLO', size: 'Średni', params: '11.2M' },
        { id: 'yolov8m', name: 'YOLOv8 Medium', type: 'YOLO', size: 'Duży', params: '25.9M' },
        { id: 'yolov8l', name: 'YOLOv8 Large', type: 'YOLO', size: 'Bardzo duży', params: '43.7M' },
        { id: 'fasterrcnn', name: 'Faster R-CNN', type: 'R-CNN', size: 'Duży', params: '41.8M' },
        { id: 'ssd', name: 'SSD MobileNet', type: 'SSD', size: 'Mały', params: '4.3M' },
      ];
      
      const mockActiveTrainings = [
        {
          id: 'train1',
          modelId: 'yolov8s',
          modelName: 'YOLOv8 Small',
          datasetId: 'dataset2',
          datasetName: 'Zbiór treningowy',
          startTime: new Date(2025, 3, 14, 18, 30).toISOString(),
          progress: 45,
          eta: '1h 23m',
          epochs: 100,
          currentEpoch: 45,
          metrics: {
            loss: 0.235,
            mAP50: 0.78,
            mAP50_95: 0.56,
            precision: 0.82,
            recall: 0.75
          },
          status: 'running'
        }
      ];
      
      const mockCompletedTrainings = [
        {
          id: 'train2',
          modelId: 'yolov8n',
          modelName: 'YOLOv8 Nano',
          datasetId: 'dataset1',
          datasetName: 'Zbiór testowy',
          startTime: new Date(2025, 3, 13, 10, 15).toISOString(),
          endTime: new Date(2025, 3, 13, 12, 45).toISOString(),
          epochs: 100,
          metrics: {
            loss: 0.187,
            mAP50: 0.83,
            mAP50_95: 0.62,
            precision: 0.85,
            recall: 0.79
          },
          status: 'completed'
        },
        {
          id: 'train3',
          modelId: 'ssd',
          modelName: 'SSD MobileNet',
          datasetId: 'dataset3',
          datasetName: 'Zbiór walidacyjny',
          startTime: new Date(2025, 3, 12, 14, 20).toISOString(),
          endTime: new Date(2025, 3, 12, 15, 30).toISOString(),
          epochs: 50,
          metrics: {
            loss: 0.245,
            mAP50: 0.76,
            mAP50_95: 0.51,
            precision: 0.79,
            recall: 0.72
          },
          status: 'completed'
        },
        {
          id: 'train4',
          modelId: 'fasterrcnn',
          modelName: 'Faster R-CNN',
          datasetId: 'dataset2',
          datasetName: 'Zbiór treningowy',
          startTime: new Date(2025, 3, 10, 9, 0).toISOString(),
          endTime: new Date(2025, 3, 10, 16, 30).toISOString(),
          epochs: 80,
          metrics: {
            loss: 0.156,
            mAP50: 0.89,
            mAP50_95: 0.71,
            precision: 0.91,
            recall: 0.85
          },
          status: 'completed'
        }
      ];
      
      setDatasets(mockDatasets);
      setModels(mockModels);
      setActiveTrainings(mockActiveTrainings);
      setCompletedTrainings(mockCompletedTrainings);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Obsługa wyboru modelu
  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };
  
  // Obsługa wyboru zbioru danych
  const handleDatasetChange = (event) => {
    setSelectedDataset(event.target.value);
  };
  
  // Obsługa zmiany parametrów treningu
  const handleParamChange = (param, value) => {
    setTrainingParams({
      ...trainingParams,
      [param]: value
    });
  };
  
  // Obsługa rozpoczęcia treningu
  const handleStartTraining = () => {
    if (!selectedModel || !selectedDataset) {
      alert('Wybierz model i zbiór danych przed rozpoczęciem treningu.');
      return;
    }
    
    const model = models.find(m => m.id === selectedModel);
    const dataset = datasets.find(d => d.id === selectedDataset);
    
    if (!model || !dataset) {
      alert('Nieprawidłowy model lub zbiór danych.');
      return;
    }
    
    const newTraining = {
      id: `train${activeTrainings.length + completedTrainings.length + 1}`,
      modelId: model.id,
      modelName: model.name,
      datasetId: dataset.id,
      datasetName: dataset.name,
      startTime: new Date().toISOString(),
      progress: 0,
      eta: `${Math.floor(trainingParams.epochs / 10)}h ${Math.floor(Math.random() * 60)}m`,
      epochs: trainingParams.epochs,
      currentEpoch: 0,
      metrics: {
        loss: 0,
        mAP50: 0,
        mAP50_95: 0,
        precision: 0,
        recall: 0
      },
      status: 'initializing'
    };
    
    setActiveTrainings([...activeTrainings, newTraining]);
    
    // Symulacja postępu treningu
    setTimeout(() => {
      setActiveTrainings(prev => prev.map(t => {
        if (t.id === newTraining.id) {
          return {
            ...t,
            status: 'running'
          };
        }
        return t;
      }));
      
      const interval = setInterval(() => {
        setActiveTrainings(prev => {
          const updatedTrainings = prev.map(t => {
            if (t.id === newTraining.id) {
              const newProgress = t.progress + 1;
              const newEpoch = Math.floor((newProgress / 100) * t.epochs);
              
              if (newProgress >= 100) {
                clearInterval(interval);
                
                const completedTraining = {
                  ...t,
                  progress: 100,
                  currentEpoch: t.epochs,
                  endTime: new Date().toISOString(),
                  status: 'completed',
                  metrics: {
                    loss: 0.2 - (Math.random() * 0.1),
                    mAP50: 0.7 + (Math.random() * 0.2),
                    mAP50_95: 0.5 + (Math.random() * 0.2),
                    precision: 0.75 + (Math.random() * 0.15),
                    recall: 0.7 + (Math.random() * 0.15)
                  }
                };
                
                setCompletedTrainings(prev => [completedTraining, ...prev]);
                return prev.filter(training => training.id !== t.id);
              }
              
              return {
                ...t,
                progress: newProgress,
                currentEpoch: newEpoch,
                eta: `${Math.floor((100 - newProgress) / 10)}h ${Math.floor(Math.random() * 60)}m`,
                metrics: {
                  loss: 0.5 - (newProgress / 200),
                  mAP50: 0.4 + (newProgress / 200),
                  mAP50_95: 0.2 + (newProgress / 250),
                  precision: 0.5 + (newProgress / 250),
                  recall: 0.4 + (newProgress / 200)
                }
              };
            }
            return t;
          });
          
          return updatedTrainings;
        });
      }, 3000);
    }, 2000);
  };
  
  // Obsługa zatrzymania treningu
  const handleStopTraining = (trainingId) => {
    if (window.confirm('Czy na pewno chcesz zatrzymać ten trening? Postęp zostanie utracony.')) {
      setActiveTrainings(activeTrainings.filter(t => t.id !== trainingId));
    }
  };
  
  // Obsługa eksportu modelu
  const handleExportModel = (trainingId) => {
    const training = completedTrainings.find(t => t.id === trainingId);
    
    if (training) {
      alert(`Model ${training.modelName} został wyeksportowany.`);
    }
  };
  
  // Formatowanie daty
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Obliczanie czasu trwania
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const durationMs = end - start;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Trenowanie modeli
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Konfiguracja treningu
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Model</InputLabel>
              <Select
                value={selectedModel}
                onChange={handleModelChange}
                label="Model"
              >
                <MenuItem value="">
                  <em>Wybierz model</em>
                </MenuItem>
                {models.map(model => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name} ({model.type}) - {model.size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Zbiór danych</InputLabel>
              <Select
                value={selectedDataset}
                onChange={handleDatasetChange}
                label="Zbiór danych"
              >
                <MenuItem value="">
                  <em>Wybierz zbiór danych</em>
                </MenuItem>
                {datasets.map(dataset => (
                  <MenuItem key={dataset.id} value={dataset.id}>
                    {dataset.name} ({dataset.count} obrazów, {dataset.classes} klas)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Parametry treningu
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Liczba epok"
                  type="number"
                  value={trainingParams.epochs}
                  onChange={(e) => handleParamChange('epochs', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 1000 }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Rozmiar batcha"
                  type="number"
                  value={trainingParams.batchSize}
                  onChange={(e) => handleParamChange('batchSize', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 128 }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Współczynnik uczenia"
                  type="number"
                  value={trainingParams.learningRate}
                  onChange={(e) => handleParamChange('learningRate', parseFloat(e.target.value))}
                  inputProps={{ step: 0.0001, min: 0.0001, max: 0.1 }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Rozmiar obrazu"
                  type="number"
                  value={trainingParams.imageSize}
                  onChange={(e) => handleParamChange('imageSize', parseInt(e.target.value))}
                  inputProps={{ step: 32, min: 32, max: 1280 }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Optymalizator</InputLabel>
                  <Select
                    value={trainingParams.optimizer}
                    onChange={(e) => handleParamChange('optimizer', e.target.value)}
                    label="Optymalizator"
                  >
                    <MenuItem value="adam">Adam</MenuItem>
                    <MenuItem value="sgd">SGD</MenuItem>
                    <MenuItem value="adamw">AdamW</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Podział walidacyjny"
                  type="number"
                  value={trainingParams.validationSplit}
                  onChange={(e) => handleParamChange('validationSplit', parseFloat(e.target.value))}
                  inputProps={{ step: 0.05, min: 0.1, max: 0.5 }}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
            
            <FormControlLabel
              control={
                <Switch
                  checked={trainingParams.augmentation}
                  onChange={(e) => handleParamChange('augmentation', e.target.checked)}
                />
              }
              label="Augmentacja danych"
              sx={{ mb: 1, display: 'block' }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={trainingParams.earlyStop}
                  onChange={(e) => handleParamChange('earlyStop', e.target.checked)}
                />
              }
              label="Wczesne zatrzymanie"
              sx={{ mb: 1, display: 'block' }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={trainingParams.classWeights}
                  onChange={(e) => handleParamChange('classWeights', e.target.checked)}
                />
              }
              label="Wagi klas"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <Button
              variant="contained"
              fullWidth
              startIcon={<PlayArrow />}
              onClick={handleStartTraining}
              disabled={!selectedModel || !selectedDataset}
            >
              Rozpocznij trening
            </Button>
          </Paper>
          
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Zasoby systemowe
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              Użycie GPU
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Użycie:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {activeTrainings.length > 0 ? '85%' : '0%'}
                </Typography>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={activeTrainings.length > 0 ? 85 : 0} 
                sx={{ mb: 1 }} 
              />
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>
              Użycie pamięci
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Użycie:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {activeTrainings.length > 0 ? '6.2 GB / 8 GB' : '0.8 GB / 8 GB'}
                </Typography>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={activeTrainings.length > 0 ? 77.5 : 10} 
                sx={{ mb: 1 }} 
              />
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>
              Temperatura GPU
            </Typography>
            
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Temperatura:
                </Typography>
                <Typography variant="body2" fontWeight="bold" color={activeTrainings.length > 0 ? 'warning.main' : 'text.primary'}>
                  {activeTrainings.length > 0 ? '78°C' : '42°C'}
                </Typography>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={activeTrainings.length > 0 ? 78 : 42} 
                sx={{ 
                  mb: 1,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: activeTrainings.length > 0 ? '#ff9800' : '#4caf50'
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Aktywne treningi
            </Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : activeTrainings.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Brak aktywnych treningów. Skonfiguruj i rozpocznij nowy trening.
              </Alert>
            ) : (
              <Box>
                {activeTrainings.map(training => (
                  <Card key={training.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          {training.modelName}
                        </Typography>
                        
                        <Box>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<Stop />}
                            onClick={() => handleStopTraining(training.id)}
                            sx={{ mr: 1 }}
                          >
                            Zatrzymaj
                          </Button>
                          
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<BarChart />}
                          >
                            Metryki
                          </Button>
                        </Box>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Zbiór danych: {training.datasetName}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            Rozpoczęto: {formatDate(training.startTime)}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            Czas trwania: {calculateDuration(training.startTime)}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            Epoka: {training.currentEpoch} / {training.epochs}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            Pozostały czas: {training.eta}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Metryki:
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <MetricChip label="Loss" value={training.metrics.loss.toFixed(3)} />
                            <MetricChip label="mAP@50" value={training.metrics.mAP50.toFixed(3)} />
                            <MetricChip label="mAP@50-95" value={training.metrics.mAP50_95.toFixed(3)} />
                            <MetricChip label="Precision" value={training.metrics.precision.toFixed(3)} />
                            <MetricChip label="Recall" value={training.metrics.recall.toFixed(3)} />
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Postęp: {training.progress}%
                        </Typography>
                        <LinearProgress variant="determinate" value={training.progress} />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
          
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ukończone treningi
            </Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : completedTrainings.length === 0 ? (
              <Alert severity="info">
                Brak ukończonych treningów.
              </Alert>
            ) : (
              <Box>
                {completedTrainings.map(training => (
                  <Card key={training.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          {training.modelName}
                        </Typography>
                        
                        <Box>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Save />}
                            onClick={() => handleExportModel(training.id)}
                            sx={{ mr: 1 }}
                          >
                            Eksportuj
                          </Button>
                          
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<BarChart />}
                          >
                            Metryki
                          </Button>
                        </Box>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Zbiór danych: {training.datasetName}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            Rozpoczęto: {formatDate(training.startTime)}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            Zakończono: {formatDate(training.endTime)}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            Czas trwania: {calculateDuration(training.startTime, training.endTime)}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            Epoki: {training.epochs}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Metryki końcowe:
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <MetricChip label="Loss" value={training.metrics.loss.toFixed(3)} />
                            <MetricChip label="mAP@50" value={training.metrics.mAP50.toFixed(3)} />
                            <MetricChip label="mAP@50-95" value={training.metrics.mAP50_95.toFixed(3)} />
                            <MetricChip label="Precision" value={training.metrics.precision.toFixed(3)} />
                            <MetricChip label="Recall" value={training.metrics.recall.toFixed(3)} />
                          </Box>
                          
                          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                            <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                            <Typography variant="body2" color="success.main">
                              Trening zakończony pomyślnie
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Komponent MetricChip
const MetricChip = ({ label, value }) => {
  return (
    <Box sx={{ 
      display: 'inline-flex',
      alignItems: 'center',
      backgroundColor: '#e3f2fd',
      borderRadius: 1,
      px: 1,
      py: 0.5,
      mr: 1,
      mb: 1
    }}>
      <Typography variant="caption" sx={{ mr: 0.5, fontWeight: 'bold' }}>
        {label}:
      </Typography>
      <Typography variant="caption">
        {value}
      </Typography>
    </Box>
  );
};

// Komponent Switch
function Switch({ checked, onChange }) {
  return (
    <div style={{ 
      display: 'inline-block',
      width: 40,
      height: 20,
      borderRadius: 10,
      backgroundColor: checked ? '#3f51b5' : '#e0e0e0',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    }} onClick={onChange ? () => onChange({ target: { checked: !checked } }) : undefined}>
      <div style={{
        position: 'absolute',
        top: 2,
        left: checked ? 22 : 2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'white',
        transition: 'left 0.3s',
      }} />
    </div>
  );
}

// Komponent FormControlLabel
function FormControlLabel({ control, label, sx }) {
  return (
    <div style={{ 
      display: 'flex',
      alignItems: 'center',
      marginBottom: sx?.mb === 1 ? '8px' : 0,
      display: sx?.display === 'block' ? 'block' : 'flex',
    }}>
      {control}
      <span style={{ marginLeft: 8 }}>{label}</span>
    </div>
  );
}

// Komponent LinearProgress
function LinearProgress({ variant, value, sx }) {
  const getColor = (value) => {
    if (value > 80) return '#f44336';
    if (value > 60) return '#ff9800';
    if (value > 30) return '#4caf50';
    return '#2196f3';
  };
  
  const backgroundColor = sx?.['& .MuiLinearProgress-bar']?.backgroundColor || getColor(value);
  
  return (
    <div style={{ 
      width: '100%',
      height: 8,
      backgroundColor: '#e0e0e0',
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: sx?.mb === 1 ? '8px' : 0,
    }}>
      <div style={{
        width: `${value}%`,
        height: '100%',
        backgroundColor: backgroundColor,
        transition: 'width 0.3s ease',
      }} />
    </div>
  );
}

// Komponent CircularProgress
function CircularProgress() {
  return (
    <div style={{ 
      display: 'inline-block',
      width: 40,
      height: 40,
      border: '4px solid rgba(63, 81, 181, 0.1)',
      borderRadius: '50%',
      borderTopColor: '#3f51b5',
      animation: 'spin 1s linear infinite',
    }} />
  );
}

export default TrainingPage;
