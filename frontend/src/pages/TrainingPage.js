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
  CircularProgress
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
  ResponsiveContainer 
} from 'recharts';

const TrainingPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [trainings, setTrainings] = useState([]);
  const [models, setModels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTrainingOpen, setNewTrainingOpen] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState({});
  const [trainingLogs, setTrainingLogs] = useState({});
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [viewLogsOpen, setViewLogsOpen] = useState(false);
  const [newTrainingData, setNewTrainingData] = useState({
    name: '',
    model_type: 'yolov5s',
    dataset_id: '',
    epochs: 100,
    batch_size: 16,
    learning_rate: 0.001,
    augmentation: true,
    early_stopping: true,
    patience: 10,
    validation_split: 0.2
  });

  // Mock training data for charts
  const trainingChartData = [
    { epoch: 1, loss: 1.8, val_loss: 1.9, mAP: 0.35 },
    { epoch: 2, loss: 1.4, val_loss: 1.5, mAP: 0.42 },
    { epoch: 3, loss: 1.1, val_loss: 1.2, mAP: 0.48 },
    { epoch: 4, loss: 0.9, val_loss: 1.0, mAP: 0.53 },
    { epoch: 5, loss: 0.7, val_loss: 0.85, mAP: 0.58 },
    { epoch: 6, loss: 0.6, val_loss: 0.75, mAP: 0.62 },
    { epoch: 7, loss: 0.5, val_loss: 0.65, mAP: 0.65 },
    { epoch: 8, loss: 0.45, val_loss: 0.6, mAP: 0.68 },
    { epoch: 9, loss: 0.4, val_loss: 0.55, mAP: 0.71 },
    { epoch: 10, loss: 0.35, val_loss: 0.5, mAP: 0.73 },
  ];

  // Fetch trainings, models, and datasets on component mount
  useEffect(() => {
    fetchTrainings();
    fetchModels();
    fetchDatasets();
    
    // Set up interval to update training progress
    const interval = setInterval(() => {
      updateTrainingProgress();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch trainings from API
  const fetchTrainings = async () => {
    setLoading(true);
    try {
      // Mock data for now
      const mockTrainings = [
        { id: 1, name: 'Traffic Model v1', model_type: 'yolov5s', dataset: 'Traffic Scenes', status: 'completed', progress: 100, created_at: '2023-01-15', epochs: 100, current_epoch: 100, mAP: 0.73, best_epoch: 87 },
        { id: 2, name: 'Pedestrian Detector', model_type: 'yolov5m', dataset: 'Pedestrians', status: 'completed', progress: 100, created_at: '2023-01-20', epochs: 150, current_epoch: 150, mAP: 0.82, best_epoch: 132 },
        { id: 3, name: 'Night Vision Model', model_type: 'yolov8n', dataset: 'Night Scenes', status: 'running', progress: 45, created_at: '2023-01-25', epochs: 200, current_epoch: 90, mAP: 0.68, best_epoch: 78 },
        { id: 4, name: 'Cyclist Detector', model_type: 'yolov5l', dataset: 'Cyclists', status: 'failed', progress: 23, created_at: '2023-01-30', epochs: 100, current_epoch: 23, mAP: 0.41, best_epoch: 20 },
      ];
      
      setTrainings(mockTrainings);
      
      // Initialize progress and logs
      const progress = {};
      const logs = {};
      mockTrainings.forEach(training => {
        progress[training.id] = training.progress;
        logs[training.id] = generateMockLogs(training);
      });
      setTrainingProgress(progress);
      setTrainingLogs(logs);
    } catch (error) {
      console.error('Error fetching trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch models from API
  const fetchModels = async () => {
    try {
      // Mock data for now
      const mockModels = [
        { id: 1, name: 'YOLOv5s', type: 'yolov5s', size: 'small', parameters: '7.2M', speed: 'fast' },
        { id: 2, name: 'YOLOv5m', type: 'yolov5m', size: 'medium', parameters: '21.2M', speed: 'medium' },
        { id: 3, name: 'YOLOv5l', type: 'yolov5l', size: 'large', parameters: '46.5M', speed: 'slow' },
        { id: 4, name: 'YOLOv8n', type: 'yolov8n', size: 'nano', parameters: '3.2M', speed: 'very fast' },
        { id: 5, name: 'YOLOv8s', type: 'yolov8s', size: 'small', parameters: '11.2M', speed: 'fast' },
      ];
      
      setModels(mockModels);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  // Fetch datasets from API
  const fetchDatasets = async () => {
    try {
      // Mock data for now
      const mockDatasets = [
        { id: 1, name: 'Traffic Scenes', image_count: 1200, class_count: 6 },
        { id: 2, name: 'Pedestrians', image_count: 800, class_count: 2 },
        { id: 3, name: 'Cyclists', image_count: 500, class_count: 3 },
        { id: 4, name: 'Night Scenes', image_count: 600, class_count: 5 },
      ];
      
      setDatasets(mockDatasets);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    }
  };

  // Update training progress
  const updateTrainingProgress = () => {
    // In a real app, this would fetch the latest progress from the API
    // For now, we'll just simulate progress updates for running trainings
    const updatedProgress = { ...trainingProgress };
    const updatedLogs = { ...trainingLogs };
    
    trainings.forEach(training => {
      if (training.status === 'running') {
        // Increment progress by a random amount (1-3%)
        const increment = Math.floor(Math.random() * 3) + 1;
        const newProgress = Math.min(updatedProgress[training.id] + increment, 100);
        updatedProgress[training.id] = newProgress;
        
        // Add a new log entry
        if (updatedLogs[training.id]) {
          const currentEpoch = Math.floor((newProgress / 100) * training.epochs);
          const newLog = `[${new Date().toISOString()}] Epoch ${currentEpoch}/${training.epochs}: loss=0.${Math.floor(Math.random() * 9) + 1}, mAP=0.${Math.floor(Math.random() * 9) + 1}`;
          updatedLogs[training.id] = updatedLogs[training.id] + '\n' + newLog;
        }
        
        // If progress reaches 100%, update status to completed
        if (newProgress === 100) {
          const updatedTrainings = trainings.map(t => {
            if (t.id === training.id) {
              return { ...t, status: 'completed', progress: 100, current_epoch: t.epochs };
            }
            return t;
          });
          setTrainings(updatedTrainings);
        }
      }
    });
    
    setTrainingProgress(updatedProgress);
    setTrainingLogs(updatedLogs);
  };

  // Generate mock logs for a training
  const generateMockLogs = (training) => {
    let logs = `[${training.created_at}T00:00:00.000Z] Starting training job for ${training.name}\n`;
    logs += `[${training.created_at}T00:00:01.000Z] Model: ${training.model_type}, Dataset: ${training.dataset}\n`;
    logs += `[${training.created_at}T00:00:02.000Z] Epochs: ${training.epochs}, Batch size: 16\n`;
    logs += `[${training.created_at}T00:00:03.000Z] Loading dataset...\n`;
    logs += `[${training.created_at}T00:00:10.000Z] Dataset loaded. Training samples: 1200, Validation samples: 300\n`;
    logs += `[${training.created_at}T00:00:15.000Z] Starting training...\n`;
    
    // Add epoch logs based on current progress
    const completedEpochs = Math.floor((training.progress / 100) * training.epochs);
    for (let i = 1; i <= completedEpochs; i++) {
      const loss = 1.8 - (i / training.epochs) * 1.5;
      const mAP = 0.3 + (i / training.epochs) * 0.5;
      logs += `[${training.created_at}T${String(i).padStart(2, '0')}:00:00.000Z] Epoch ${i}/${training.epochs}: loss=${loss.toFixed(2)}, mAP=${mAP.toFixed(2)}\n`;
    }
    
    // Add completion or failure message
    if (training.status === 'completed') {
      logs += `[${training.created_at}T${String(completedEpochs + 1).padStart(2, '0')}:00:00.000Z] Training completed. Best mAP: ${training.mAP} at epoch ${training.best_epoch}\n`;
      logs += `[${training.created_at}T${String(completedEpochs + 1).padStart(2, '0')}:05:00.000Z] Model saved to storage.\n`;
    } else if (training.status === 'failed') {
      logs += `[${training.created_at}T${String(completedEpochs + 1).padStart(2, '0')}:00:00.000Z] ERROR: Training failed. Out of memory.\n`;
    }
    
    return logs;
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle new training dialog open
  const handleNewTrainingOpen = () => {
    setNewTrainingOpen(true);
  };

  // Handle new training dialog close
  const handleNewTrainingClose = () => {
    setNewTrainingOpen(false);
  };

  // Handle new training input change
  const handleNewTrainingChange = (field, value) => {
    setNewTrainingData({
      ...newTrainingData,
      [field]: value
    });
  };

  // Handle create new training
  const handleCreateTraining = async () => {
    setLoading(true);
    try {
      // In a real app, this would send a request to the API
      console.log('Creating new training:', newTrainingData);
      
      // Mock creating a new training
      const dataset = datasets.find(d => d.id.toString() === newTrainingData.dataset_id.toString());
      const newTraining = {
        id: trainings.length + 1,
        name: newTrainingData.name,
        model_type: newTrainingData.model_type,
        dataset: dataset ? dataset.name : 'Unknown',
        status: 'running',
        progress: 0,
        created_at: new Date().toISOString().split('T')[0],
        epochs: newTrainingData.epochs,
        current_epoch: 0,
        mAP: 0,
        best_epoch: 0
      };
      
      setTrainings([newTraining, ...trainings]);
      
      // Initialize progress and logs
      setTrainingProgress({
        ...trainingProgress,
        [newTraining.id]: 0
      });
      setTrainingLogs({
        ...trainingLogs,
        [newTraining.id]: generateMockLogs(newTraining)
      });
      
      setNewTrainingOpen(false);
      setNewTrainingData({
        name: '',
        model_type: 'yolov5s',
        dataset_id: '',
        epochs: 100,
        batch_size: 16,
        learning_rate: 0.001,
        augmentation: true,
        early_stopping: true,
        patience: 10,
        validation_split: 0.2
      });
    } catch (error) {
      console.error('Error creating training:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle view logs
  const handleViewLogs = (training) => {
    setSelectedTraining(training);
    setViewLogsOpen(true);
  };

  // Handle stop training
  const handleStopTraining = async (trainingId) => {
    try {
      // In a real app, this would send a request to the API
      console.log('Stopping training:', trainingId);
      
      // Update training status
      const updatedTrainings = trainings.map(training => {
        if (training.id === trainingId) {
          return { ...training, status: 'stopped' };
        }
        return training;
      });
      
      setTrainings(updatedTrainings);
    } catch (error) {
      console.error('Error stopping training:', error);
    }
  };

  // Handle delete training
  const handleDeleteTraining = async (trainingId) => {
    try {
      // In a real app, this would send a request to the API
      console.log('Deleting training:', trainingId);
      
      // Remove training from list
      const updatedTrainings = trainings.filter(training => training.id !== trainingId);
      setTrainings(updatedTrainings);
      
      // Remove from progress and logs
      const updatedProgress = { ...trainingProgress };
      const updatedLogs = { ...trainingLogs };
      delete updatedProgress[trainingId];
      delete updatedLogs[trainingId];
      setTrainingProgress(updatedProgress);
      setTrainingLogs(updatedLogs);
    } catch (error) {
      console.error('Error deleting training:', error);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return '#2196f3'; // Blue
      case 'completed':
        return '#4caf50'; // Green
      case 'failed':
        return '#f44336'; // Red
      case 'stopped':
        return '#ff9800'; // Orange
      default:
        return '#9e9e9e'; // Grey
    }
  };

  // Get model display name
  const getModelDisplayName = (modelType) => {
    const model = models.find(m => m.type === modelType);
    return model ? model.name : modelType;
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Model Training
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="training tabs">
            <Tab label="Training Jobs" />
            <Tab label="Models" />
            <Tab label="Settings" />
          </Tabs>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewTrainingOpen}
          >
            New Training
          </Button>
        </Box>
        
        {activeTab === 0 && (
          <>
            {loading && trainings.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Model</TableCell>
                      <TableCell>Dataset</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>mAP</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trainings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography variant="body1" sx={{ py: 2 }}>
                            No training jobs found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      trainings.map((training) => (
                        <TableRow key={training.id}>
                          <TableCell>{training.name}</TableCell>
                          <TableCell>{getModelDisplayName(training.model_type)}</TableCell>
                          <TableCell>{training.dataset}</TableCell>
                          <TableCell>
                            <Chip 
                              label={training.status} 
                              sx={{ 
                                backgroundColor: getStatusColor(training.status),
                                color: 'white'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={trainingProgress[training.id] || 0} 
                                  sx={{ height: 10, borderRadius: 5 }}
                                />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {`${Math.round(trainingProgress[training.id] || 0)}%`}
                                </Typography>
                              </Box>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {`Epoch ${training.current_epoch}/${training.epochs}`}
                            </Typography>
                          </TableCell>
                          <TableCell>{training.created_at}</TableCell>
                          <TableCell>{training.mAP}</TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewLogs(training)}
                              title="View Logs"
                            >
                              <Edit />
                            </IconButton>
                            {training.status === 'running' && (
                              <IconButton 
                                size="small" 
                                onClick={() => handleStopTraining(training.id)}
                                title="Stop Training"
                                color="warning"
                              >
                                <Stop />
                              </IconButton>
                            )}
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteTraining(training.id)}
                              title="Delete Training"
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
        
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Available Models
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Size</TableCell>
                          <TableCell>Parameters</TableCell>
                          <TableCell>Speed</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {models.map((model) => (
                          <TableRow key={model.id}>
                            <TableCell>{model.name}</TableCell>
                            <TableCell>{model.size}</TableCell>
                            <TableCell>{model.parameters}</TableCell>
                            <TableCell>{model.speed}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Model Comparison
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: 'YOLOv5n', mAP: 0.45, speed: 140 },
                        { name: 'YOLOv5s', mAP: 0.56, speed: 100 },
                        { name: 'YOLOv5m', mAP: 0.64, speed: 75 },
                        { name: 'YOLOv5l', mAP: 0.70, speed: 45 },
                        { name: 'YOLOv5x', mAP: 0.75, speed: 30 },
                        { name: 'YOLOv8n', mAP: 0.52, speed: 160 },
                        { name: 'YOLOv8s', mAP: 0.62, speed: 110 },
                        { name: 'YOLOv8m', mAP: 0.69, speed: 80 },
                        { name: 'YOLOv8l', mAP: 0.75, speed: 50 },
                        { name: 'YOLOv8x', mAP: 0.80, speed: 35 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="mAP" fill="#8884d8" name="mAP (higher is better)" />
                      <Bar yAxisId="right" dataKey="speed" fill="#82ca9d" name="Speed (FPS)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Custom Models
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<CloudUpload />}
                      sx={{ mr: 2 }}
                    >
                      Upload Custom Model
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Settings />}
                    >
                      Configure Model Registry
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Training Settings
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>Default Epochs</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              defaultValue={100}
                              variant="outlined"
                              size="small"
                              InputProps={{ inputProps: { min: 1, max: 1000 } }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Default Batch Size</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              defaultValue={16}
                              variant="outlined"
                              size="small"
                              InputProps={{ inputProps: { min: 1, max: 128 } }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Default Learning Rate</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              defaultValue={0.001}
                              variant="outlined"
                              size="small"
                              InputProps={{ inputProps: { min: 0.0001, max: 0.1, step: 0.0001 } }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Enable Data Augmentation</TableCell>
                          <TableCell>
                            <FormControlLabel
                              control={<Switch defaultChecked />}
                              label=""
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Enable Early Stopping</TableCell>
                          <TableCell>
                            <FormControlLabel
                              control={<Switch defaultChecked />}
                              label=""
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Early Stopping Patience</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              defaultValue={10}
                              variant="outlined"
                              size="small"
                              InputProps={{ inputProps: { min: 1, max: 50 } }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Validation Split</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              defaultValue={0.2}
                              variant="outlined"
                              size="small"
                              InputProps={{ inputProps: { min: 0.1, max: 0.5, step: 0.05 } }}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                    >
                      Save Settings
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Hardware Settings
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>Use GPU for Training</TableCell>
                          <TableCell>
                            <FormControlLabel
                              control={<Switch defaultChecked />}
                              label=""
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>GPU Memory Limit (GB)</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              defaultValue={8}
                              variant="outlined"
                              size="small"
                              InputProps={{ inputProps: { min: 1, max: 32 } }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Number of Workers</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              defaultValue={4}
                              variant="outlined"
                              size="small"
                              InputProps={{ inputProps: { min: 1, max: 16 } }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Mixed Precision Training</TableCell>
                          <TableCell>
                            <FormControlLabel
                              control={<Switch defaultChecked />}
                              label=""
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Cache Images in RAM</TableCell>
                          <TableCell>
                            <FormControlLabel
                              control={<Switch defaultChecked />}
                              label=""
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Maximum Concurrent Trainings</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              defaultValue={2}
                              variant="outlined"
                              size="small"
                              InputProps={{ inputProps: { min: 1, max: 4 } }}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                    >
                      Save Settings
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
      
      {/* New Training Dialog */}
      <Dialog open={newTrainingOpen} onClose={handleNewTrainingClose} maxWidth="md" fullWidth>
        <DialogTitle>New Training Job</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Training Name"
                value={newTrainingData.name}
                onChange={(e) => handleNewTrainingChange('name', e.target.value)}
                variant="outlined"
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Model</InputLabel>
                <Select
                  value={newTrainingData.model_type}
                  onChange={(e) => handleNewTrainingChange('model_type', e.target.value)}
                  label="Model"
                >
                  {models.map((model) => (
                    <MenuItem key={model.id} value={model.type}>
                      {model.name} ({model.size})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Dataset</InputLabel>
                <Select
                  value={newTrainingData.dataset_id}
                  onChange={(e) => handleNewTrainingChange('dataset_id', e.target.value)}
                  label="Dataset"
                  required
                >
                  {datasets.map((dataset) => (
                    <MenuItem key={dataset.id} value={dataset.id.toString()}>
                      {dataset.name} ({dataset.image_count} images, {dataset.class_count} classes)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Epochs"
                type="number"
                value={newTrainingData.epochs}
                onChange={(e) => handleNewTrainingChange('epochs', parseInt(e.target.value))}
                variant="outlined"
                fullWidth
                InputProps={{ inputProps: { min: 1, max: 1000 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Batch Size"
                type="number"
                value={newTrainingData.batch_size}
                onChange={(e) => handleNewTrainingChange('batch_size', parseInt(e.target.value))}
                variant="outlined"
                fullWidth
                InputProps={{ inputProps: { min: 1, max: 128 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Learning Rate"
                type="number"
                value={newTrainingData.learning_rate}
                onChange={(e) => handleNewTrainingChange('learning_rate', parseFloat(e.target.value))}
                variant="outlined"
                fullWidth
                InputProps={{ inputProps: { min: 0.0001, max: 0.1, step: 0.0001 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newTrainingData.augmentation}
                    onChange={(e) => handleNewTrainingChange('augmentation', e.target.checked)}
                  />
                }
                label="Enable Data Augmentation"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newTrainingData.early_stopping}
                    onChange={(e) => handleNewTrainingChange('early_stopping', e.target.checked)}
                  />
                }
                label="Enable Early Stopping"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Early Stopping Patience"
                type="number"
                value={newTrainingData.patience}
                onChange={(e) => handleNewTrainingChange('patience', parseInt(e.target.value))}
                variant="outlined"
                fullWidth
                disabled={!newTrainingData.early_stopping}
                InputProps={{ inputProps: { min: 1, max: 50 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Validation Split"
                type="number"
                value={newTrainingData.validation_split}
                onChange={(e) => handleNewTrainingChange('validation_split', parseFloat(e.target.value))}
                variant="outlined"
                fullWidth
                InputProps={{ inputProps: { min: 0.1, max: 0.5, step: 0.05 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNewTrainingClose}>Cancel</Button>
          <Button 
            onClick={handleCreateTraining} 
            variant="contained" 
            disabled={!newTrainingData.name || !newTrainingData.dataset_id}
          >
            Start Training
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* View Logs Dialog */}
      <Dialog open={viewLogsOpen} onClose={() => setViewLogsOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedTraining ? `Training Logs: ${selectedTraining.name}` : 'Training Logs'}
        </DialogTitle>
        <DialogContent>
          {selectedTraining && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Training Progress
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={trainingChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="epoch" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="loss" stroke="#8884d8" name="Training Loss" />
                    <Line yAxisId="left" type="monotone" dataKey="val_loss" stroke="#ff7300" name="Validation Loss" />
                    <Line yAxisId="right" type="monotone" dataKey="mAP" stroke="#82ca9d" name="mAP" />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Training Details
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Model</strong></TableCell>
                        <TableCell>{getModelDisplayName(selectedTraining.model_type)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Dataset</strong></TableCell>
                        <TableCell>{selectedTraining.dataset}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell>
                          <Chip 
                            label={selectedTraining.status} 
                            sx={{ 
                              backgroundColor: getStatusColor(selectedTraining.status),
                              color: 'white'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Progress</strong></TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={trainingProgress[selectedTraining.id] || 0} 
                                sx={{ height: 10, borderRadius: 5 }}
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="text.secondary">
                                {`${Math.round(trainingProgress[selectedTraining.id] || 0)}%`}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Epochs</strong></TableCell>
                        <TableCell>{`${selectedTraining.current_epoch}/${selectedTraining.epochs}`}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Best mAP</strong></TableCell>
                        <TableCell>{selectedTraining.mAP}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Best Epoch</strong></TableCell>
                        <TableCell>{selectedTraining.best_epoch}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Created</strong></TableCell>
                        <TableCell>{selectedTraining.created_at}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Logs
                </Typography>
                <TextField
                  multiline
                  fullWidth
                  variant="outlined"
                  value={trainingLogs[selectedTraining.id] || ''}
                  InputProps={{
                    readOnly: true,
                    style: { fontFamily: 'monospace', fontSize: '0.875rem' }
                  }}
                  minRows={10}
                  maxRows={20}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewLogsOpen(false)}>Close</Button>
          {selectedTraining && selectedTraining.status === 'running' && (
            <Button 
              onClick={() => {
                handleStopTraining(selectedTraining.id);
                setViewLogsOpen(false);
              }} 
              color="warning"
              variant="contained"
            >
              Stop Training
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TrainingPage;
