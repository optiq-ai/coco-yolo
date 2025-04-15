import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
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
  TextField,
  MenuItem,
  CircularProgress
} from '@mui/material';
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
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download, Refresh, Compare } from '@mui/icons-material';

const MetricsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [modelToCompare, setModelToCompare] = useState('');
  const [timeRange, setTimeRange] = useState('all');

  // Mock data for charts
  const accuracyData = [
    { epoch: 1, accuracy: 0.45, val_accuracy: 0.42 },
    { epoch: 2, accuracy: 0.58, val_accuracy: 0.53 },
    { epoch: 3, accuracy: 0.67, val_accuracy: 0.61 },
    { epoch: 4, accuracy: 0.72, val_accuracy: 0.65 },
    { epoch: 5, accuracy: 0.76, val_accuracy: 0.68 },
    { epoch: 6, accuracy: 0.79, val_accuracy: 0.70 },
    { epoch: 7, accuracy: 0.82, val_accuracy: 0.72 },
    { epoch: 8, accuracy: 0.84, val_accuracy: 0.73 },
    { epoch: 9, accuracy: 0.86, val_accuracy: 0.74 },
    { epoch: 10, accuracy: 0.87, val_accuracy: 0.75 },
  ];

  const lossData = [
    { epoch: 1, loss: 1.8, val_loss: 1.9 },
    { epoch: 2, loss: 1.4, val_loss: 1.5 },
    { epoch: 3, loss: 1.1, val_loss: 1.2 },
    { epoch: 4, loss: 0.9, val_loss: 1.0 },
    { epoch: 5, loss: 0.7, val_loss: 0.85 },
    { epoch: 6, loss: 0.6, val_loss: 0.75 },
    { epoch: 7, loss: 0.5, val_loss: 0.65 },
    { epoch: 8, loss: 0.45, val_loss: 0.6 },
    { epoch: 9, loss: 0.4, val_loss: 0.55 },
    { epoch: 10, loss: 0.35, val_loss: 0.5 },
  ];

  const classDistributionData = [
    { name: 'Person', value: 1245 },
    { name: 'Car', value: 2134 },
    { name: 'Bicycle', value: 456 },
    { name: 'Motorcycle', value: 378 },
    { name: 'Bus', value: 289 },
    { name: 'Truck', value: 412 },
  ];

  const confusionMatrixData = [
    { name: 'Person', correct: 1150, incorrect: 95 },
    { name: 'Car', correct: 2050, incorrect: 84 },
    { name: 'Bicycle', correct: 420, incorrect: 36 },
    { name: 'Motorcycle', correct: 350, incorrect: 28 },
    { name: 'Bus', correct: 270, incorrect: 19 },
    { name: 'Truck', correct: 390, incorrect: 22 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Fetch models on component mount
  useEffect(() => {
    fetchModels();
  }, []);

  // Fetch models from API
  const fetchModels = async () => {
    setLoading(true);
    try {
      // Mock data for now
      const mockModels = [
        { id: 1, name: 'YOLOv5s Traffic Model', version: '1.0', created_at: '2023-01-15', mAP: 0.75, inference_time: '15ms' },
        { id: 2, name: 'YOLOv5m Pedestrian Model', version: '1.2', created_at: '2023-01-20', mAP: 0.82, inference_time: '25ms' },
        { id: 3, name: 'YOLOv8n General Model', version: '1.0', created_at: '2023-01-25', mAP: 0.79, inference_time: '12ms' },
        { id: 4, name: 'YOLOv8s Night Vision Model', version: '1.1', created_at: '2023-01-30', mAP: 0.71, inference_time: '18ms' },
      ];
      
      setModels(mockModels);
      if (mockModels.length > 0) {
        setSelectedModel(mockModels[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle model selection change
  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  // Handle compare dialog open
  const handleCompareDialogOpen = () => {
    setCompareDialogOpen(true);
  };

  // Handle compare dialog close
  const handleCompareDialogClose = () => {
    setCompareDialogOpen(false);
  };

  // Handle model comparison
  const handleCompareModels = () => {
    console.log(`Comparing models ${selectedModel} and ${modelToCompare}`);
    setCompareDialogOpen(false);
    // In a real app, this would fetch comparison data and update the charts
  };

  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  // Handle refresh metrics
  const handleRefreshMetrics = () => {
    fetchModels();
  };

  // Handle export metrics
  const handleExportMetrics = () => {
    console.log('Exporting metrics');
    // In a real app, this would generate and download a report
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Model Metrics
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              select
              label="Model"
              value={selectedModel}
              onChange={handleModelChange}
              variant="outlined"
              size="small"
              sx={{ minWidth: 250 }}
            >
              {models.map((model) => (
                <MenuItem key={model.id} value={model.id.toString()}>
                  {model.name} (v{model.version})
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              label="Time Range"
              value={timeRange}
              onChange={handleTimeRangeChange}
              variant="outlined"
              size="small"
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
            </TextField>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Compare />}
              onClick={handleCompareDialogOpen}
            >
              Compare Models
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportMetrics}
            >
              Export
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefreshMetrics}
            >
              Refresh
            </Button>
          </Box>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      mAP (Mean Average Precision)
                    </Typography>
                    <Typography variant="h3">
                      {models.find(m => m.id.toString() === selectedModel)?.mAP || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Inference Time
                    </Typography>
                    <Typography variant="h3">
                      {models.find(m => m.id.toString() === selectedModel)?.inference_time || '0ms'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Model Size
                    </Typography>
                    <Typography variant="h3">
                      14.2 MB
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Training Time
                    </Typography>
                    <Typography variant="h3">
                      2.5 hrs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="metrics tabs">
                <Tab label="Training Metrics" />
                <Tab label="Evaluation Metrics" />
                <Tab label="Class Distribution" />
                <Tab label="Confusion Matrix" />
              </Tabs>
            </Box>
            
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Accuracy
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={accuracyData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="epoch" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="accuracy" stroke="#8884d8" name="Training Accuracy" />
                          <Line type="monotone" dataKey="val_accuracy" stroke="#82ca9d" name="Validation Accuracy" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Loss
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={lossData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="epoch" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="loss" stroke="#ff7300" name="Training Loss" />
                          <Line type="monotone" dataKey="val_loss" stroke="#ff0000" name="Validation Loss" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Training Parameters
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Parameter</TableCell>
                              <TableCell>Value</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>Batch Size</TableCell>
                              <TableCell>16</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Learning Rate</TableCell>
                              <TableCell>0.001</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Optimizer</TableCell>
                              <TableCell>Adam</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Epochs</TableCell>
                              <TableCell>100</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Early Stopping</TableCell>
                              <TableCell>Yes (patience: 10)</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Data Augmentation</TableCell>
                              <TableCell>Yes (flip, rotate, scale)</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Precision-Recall Curve
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={[
                            { recall: 0.1, precision: 0.95 },
                            { recall: 0.2, precision: 0.94 },
                            { recall: 0.3, precision: 0.92 },
                            { recall: 0.4, precision: 0.89 },
                            { recall: 0.5, precision: 0.85 },
                            { recall: 0.6, precision: 0.80 },
                            { recall: 0.7, precision: 0.75 },
                            { recall: 0.8, precision: 0.65 },
                            { recall: 0.9, precision: 0.55 },
                            { recall: 1.0, precision: 0.40 },
                          ]}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="recall" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="precision" stroke="#8884d8" name="Precision" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        F1 Score by Class
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={[
                            { class: 'Person', f1: 0.82 },
                            { class: 'Car', f1: 0.91 },
                            { class: 'Bicycle', f1: 0.78 },
                            { class: 'Motorcycle', f1: 0.80 },
                            { class: 'Bus', f1: 0.85 },
                            { class: 'Truck', f1: 0.83 },
                          ]}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="class" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="f1" fill="#8884d8" name="F1 Score" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Evaluation Metrics by Class
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Class</TableCell>
                              <TableCell>Precision</TableCell>
                              <TableCell>Recall</TableCell>
                              <TableCell>F1 Score</TableCell>
                              <TableCell>AP (Average Precision)</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>Person</TableCell>
                              <TableCell>0.85</TableCell>
                              <TableCell>0.79</TableCell>
                              <TableCell>0.82</TableCell>
                              <TableCell>0.80</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Car</TableCell>
                              <TableCell>0.92</TableCell>
                              <TableCell>0.90</TableCell>
                              <TableCell>0.91</TableCell>
                              <TableCell>0.89</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Bicycle</TableCell>
                              <TableCell>0.80</TableCell>
                              <TableCell>0.76</TableCell>
                              <TableCell>0.78</TableCell>
                              <TableCell>0.75</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Motorcycle</TableCell>
                              <TableCell>0.82</TableCell>
                              <TableCell>0.78</TableCell>
                              <TableCell>0.80</TableCell>
                              <TableCell>0.77</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Bus</TableCell>
                              <TableCell>0.88</TableCell>
                              <TableCell>0.83</TableCell>
                              <TableCell>0.85</TableCell>
                              <TableCell>0.82</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Truck</TableCell>
                              <TableCell>0.85</TableCell>
                              <TableCell>0.81</TableCell>
                              <TableCell>0.83</TableCell>
                              <TableCell>0.80</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
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
                        Class Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={classDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {classDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} instances`, 'Count']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Class Distribution (Bar Chart)
                      </Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                          data={classDistributionData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Count">
                            {classDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Class Distribution Details
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Class</TableCell>
                              <TableCell>Count</TableCell>
                              <TableCell>Percentage</TableCell>
                              <TableCell>Average Size (pixels)</TableCell>
                              <TableCell>Min Size</TableCell>
                              <TableCell>Max Size</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {classDistributionData.map((row) => (
                              <TableRow key={row.name}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.value}</TableCell>
                                <TableCell>
                                  {(row.value / classDistributionData.reduce((sum, item) => sum + item.value, 0) * 100).toFixed(1)}%
                                </TableCell>
                                <TableCell>{Math.floor(Math.random() * 10000) + 5000}</TableCell>
                                <TableCell>{Math.floor(Math.random() * 1000) + 500}</TableCell>
                                <TableCell>{Math.floor(Math.random() * 50000) + 10000}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            {activeTab === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Confusion Matrix
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell></TableCell>
                              {classDistributionData.map((cls) => (
                                <TableCell key={cls.name}>{cls.name}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {classDistributionData.map((row, rowIndex) => (
                              <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                  {row.name}
                                </TableCell>
                                {classDistributionData.map((col, colIndex) => (
                                  <TableCell key={col.name} 
                                    sx={{ 
                                      backgroundColor: rowIndex === colIndex ? 
                                        `rgba(0, 255, 0, ${confusionMatrixData[rowIndex].correct / (confusionMatrixData[rowIndex].correct + confusionMatrixData[rowIndex].incorrect)})` : 
                                        `rgba(255, 0, 0, ${0.1 + Math.random() * 0.1})` 
                                    }}
                                  >
                                    {rowIndex === colIndex ? 
                                      confusionMatrixData[rowIndex].correct : 
                                      Math.floor(confusionMatrixData[rowIndex].incorrect / (classDistributionData.length - 1))}
                                  </TableCell>
                                ))}
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
                        Correct vs Incorrect Predictions
                      </Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                          data={confusionMatrixData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="correct" name="Correct" stackId="a" fill="#82ca9d" />
                          <Bar dataKey="incorrect" name="Incorrect" stackId="a" fill="#ff8042" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Error Analysis
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Class</TableCell>
                              <TableCell>Precision</TableCell>
                              <TableCell>Recall</TableCell>
                              <TableCell>False Positives</TableCell>
                              <TableCell>False Negatives</TableCell>
                              <TableCell>Most Confused With</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>Person</TableCell>
                              <TableCell>0.85</TableCell>
                              <TableCell>0.79</TableCell>
                              <TableCell>203</TableCell>
                              <TableCell>95</TableCell>
                              <TableCell>Bicycle</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Car</TableCell>
                              <TableCell>0.92</TableCell>
                              <TableCell>0.90</TableCell>
                              <TableCell>178</TableCell>
                              <TableCell>84</TableCell>
                              <TableCell>Truck</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Bicycle</TableCell>
                              <TableCell>0.80</TableCell>
                              <TableCell>0.76</TableCell>
                              <TableCell>105</TableCell>
                              <TableCell>36</TableCell>
                              <TableCell>Motorcycle</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Motorcycle</TableCell>
                              <TableCell>0.82</TableCell>
                              <TableCell>0.78</TableCell>
                              <TableCell>82</TableCell>
                              <TableCell>28</TableCell>
                              <TableCell>Bicycle</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Bus</TableCell>
                              <TableCell>0.88</TableCell>
                              <TableCell>0.83</TableCell>
                              <TableCell>37</TableCell>
                              <TableCell>19</TableCell>
                              <TableCell>Truck</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Truck</TableCell>
                              <TableCell>0.85</TableCell>
                              <TableCell>0.81</TableCell>
                              <TableCell>69</TableCell>
                              <TableCell>22</TableCell>
                              <TableCell>Bus</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </Box>
      
      {/* Compare Models Dialog */}
      <Dialog open={compareDialogOpen} onClose={handleCompareDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Compare Models</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography variant="body1" gutterBottom>
              Current Model: {models.find(m => m.id.toString() === selectedModel)?.name || ''}
            </Typography>
            
            <TextField
              select
              label="Compare with"
              value={modelToCompare}
              onChange={(e) => setModelToCompare(e.target.value)}
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
            >
              {models.filter(m => m.id.toString() !== selectedModel).map((model) => (
                <MenuItem key={model.id} value={model.id.toString()}>
                  {model.name} (v{model.version})
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCompareDialogClose}>Cancel</Button>
          <Button 
            onClick={handleCompareModels} 
            variant="contained" 
            disabled={!modelToCompare}
          >
            Compare
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MetricsPage;
