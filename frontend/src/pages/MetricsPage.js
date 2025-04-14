import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Card, CardContent, Divider, List, ListItem, ListItemText } from '@mui/material';
import { 
  BarChart, 
  Timeline, 
  CompareArrows,
  FileDownload,
  Refresh,
  FilterList,
  ViewList,
  ViewModule
} from '@mui/icons-material';

const MetricsPage = () => {
  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('charts');
  const [chartType, setChartType] = useState('line');
  const [metricType, setMetricType] = useState('mAP50');
  const [timeRange, setTimeRange] = useState('all');
  
  // Przykładowe dane
  useEffect(() => {
    // Symulacja ładowania danych
    setIsLoading(true);
    
    setTimeout(() => {
      const mockModels = [
        { id: 'model1', name: 'YOLOv8n - Zbiór testowy', type: 'YOLO', size: 'Nano', dataset: 'Zbiór testowy', date: '2025-04-13' },
        { id: 'model2', name: 'YOLOv8s - Zbiór treningowy', type: 'YOLO', size: 'Small', dataset: 'Zbiór treningowy', date: '2025-04-14' },
        { id: 'model3', name: 'SSD - Zbiór walidacyjny', type: 'SSD', size: 'Medium', dataset: 'Zbiór walidacyjny', date: '2025-04-12' },
        { id: 'model4', name: 'Faster R-CNN - Zbiór treningowy', type: 'R-CNN', size: 'Large', dataset: 'Zbiór treningowy', date: '2025-04-10' },
      ];
      
      const mockMetrics = [
        {
          modelId: 'model1',
          modelName: 'YOLOv8n - Zbiór testowy',
          metrics: {
            mAP50: 0.83,
            mAP50_95: 0.62,
            precision: 0.85,
            recall: 0.79,
            f1: 0.82,
            inferenceTime: 15, // ms
          },
          classMetrics: [
            { class: 'osoba', precision: 0.92, recall: 0.88, f1: 0.90, count: 156 },
            { class: 'samochód', precision: 0.89, recall: 0.85, f1: 0.87, count: 203 },
            { class: 'rower', precision: 0.78, recall: 0.72, f1: 0.75, count: 45 },
          ],
          confusionMatrix: [
            [145, 8, 3],
            [12, 173, 18],
            [5, 7, 33]
          ],
          epochMetrics: Array.from({ length: 100 }, (_, i) => ({
            epoch: i + 1,
            loss: 0.5 - (0.3 * (1 - Math.exp(-i / 30))),
            mAP50: 0.4 + (0.43 * (1 - Math.exp(-i / 40))),
            mAP50_95: 0.2 + (0.42 * (1 - Math.exp(-i / 50))),
            precision: 0.5 + (0.35 * (1 - Math.exp(-i / 35))),
            recall: 0.4 + (0.39 * (1 - Math.exp(-i / 45))),
          }))
        },
        {
          modelId: 'model2',
          modelName: 'YOLOv8s - Zbiór treningowy',
          metrics: {
            mAP50: 0.87,
            mAP50_95: 0.68,
            precision: 0.89,
            recall: 0.83,
            f1: 0.86,
            inferenceTime: 25, // ms
          },
          classMetrics: [
            { class: 'osoba', precision: 0.94, recall: 0.91, f1: 0.92, count: 245 },
            { class: 'samochód', precision: 0.91, recall: 0.88, f1: 0.89, count: 312 },
            { class: 'rower', precision: 0.82, recall: 0.76, f1: 0.79, count: 78 },
            { class: 'znak drogowy', precision: 0.88, recall: 0.84, f1: 0.86, count: 156 },
            { class: 'autobus', precision: 0.85, recall: 0.79, f1: 0.82, count: 42 },
          ],
          confusionMatrix: [
            [223, 12, 5, 3, 2],
            [15, 275, 10, 8, 4],
            [6, 9, 59, 3, 1],
            [4, 7, 2, 131, 12],
            [2, 5, 0, 3, 32]
          ],
          epochMetrics: Array.from({ length: 100 }, (_, i) => ({
            epoch: i + 1,
            loss: 0.48 - (0.32 * (1 - Math.exp(-i / 25))),
            mAP50: 0.45 + (0.42 * (1 - Math.exp(-i / 35))),
            mAP50_95: 0.25 + (0.43 * (1 - Math.exp(-i / 45))),
            precision: 0.55 + (0.34 * (1 - Math.exp(-i / 30))),
            recall: 0.45 + (0.38 * (1 - Math.exp(-i / 40))),
          }))
        },
        {
          modelId: 'model3',
          modelName: 'SSD - Zbiór walidacyjny',
          metrics: {
            mAP50: 0.76,
            mAP50_95: 0.51,
            precision: 0.79,
            recall: 0.72,
            f1: 0.75,
            inferenceTime: 18, // ms
          },
          classMetrics: [
            { class: 'osoba', precision: 0.85, recall: 0.79, f1: 0.82, count: 98 },
            { class: 'samochód', precision: 0.82, recall: 0.75, f1: 0.78, count: 124 },
            { class: 'rower', precision: 0.71, recall: 0.65, f1: 0.68, count: 32 },
          ],
          confusionMatrix: [
            [77, 12, 9],
            [15, 93, 16],
            [8, 3, 21]
          ],
          epochMetrics: Array.from({ length: 50 }, (_, i) => ({
            epoch: i + 1,
            loss: 0.52 - (0.28 * (1 - Math.exp(-i / 20))),
            mAP50: 0.35 + (0.41 * (1 - Math.exp(-i / 30))),
            mAP50_95: 0.15 + (0.36 * (1 - Math.exp(-i / 35))),
            precision: 0.45 + (0.34 * (1 - Math.exp(-i / 25))),
            recall: 0.35 + (0.37 * (1 - Math.exp(-i / 30))),
          }))
        },
        {
          modelId: 'model4',
          modelName: 'Faster R-CNN - Zbiór treningowy',
          metrics: {
            mAP50: 0.89,
            mAP50_95: 0.71,
            precision: 0.91,
            recall: 0.85,
            f1: 0.88,
            inferenceTime: 45, // ms
          },
          classMetrics: [
            { class: 'osoba', precision: 0.95, recall: 0.92, f1: 0.93, count: 245 },
            { class: 'samochód', precision: 0.93, recall: 0.89, f1: 0.91, count: 312 },
            { class: 'rower', precision: 0.85, recall: 0.79, f1: 0.82, count: 78 },
            { class: 'znak drogowy', precision: 0.90, recall: 0.86, f1: 0.88, count: 156 },
            { class: 'autobus', precision: 0.87, recall: 0.82, f1: 0.84, count: 42 },
          ],
          confusionMatrix: [
            [225, 10, 5, 3, 2],
            [12, 278, 10, 8, 4],
            [5, 8, 62, 2, 1],
            [3, 6, 2, 134, 11],
            [2, 4, 0, 2, 34]
          ],
          epochMetrics: Array.from({ length: 80 }, (_, i) => ({
            epoch: i + 1,
            loss: 0.45 - (0.33 * (1 - Math.exp(-i / 20))),
            mAP50: 0.48 + (0.41 * (1 - Math.exp(-i / 30))),
            mAP50_95: 0.28 + (0.43 * (1 - Math.exp(-i / 40))),
            precision: 0.58 + (0.33 * (1 - Math.exp(-i / 25))),
            recall: 0.48 + (0.37 * (1 - Math.exp(-i / 35))),
          }))
        }
      ];
      
      setModels(mockModels);
      setMetrics(mockMetrics);
      setSelectedModels(['model1', 'model2']); // Domyślnie wybrane modele
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Obsługa wyboru modelu
  const handleModelToggle = (modelId) => {
    if (selectedModels.includes(modelId)) {
      setSelectedModels(selectedModels.filter(id => id !== modelId));
    } else {
      setSelectedModels([...selectedModels, modelId]);
    }
  };
  
  // Obsługa wyboru wszystkich modeli
  const handleSelectAllModels = () => {
    if (selectedModels.length === models.length) {
      setSelectedModels([]);
    } else {
      setSelectedModels(models.map(model => model.id));
    }
  };
  
  // Obsługa zmiany typu metryki
  const handleMetricTypeChange = (event) => {
    setMetricType(event.target.value);
  };
  
  // Obsługa zmiany zakresu czasu
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  // Obsługa zmiany typu wykresu
  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };
  
  // Obsługa zmiany trybu widoku
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  // Obsługa eksportu raportu
  const handleExportReport = () => {
    alert('Raport został wyeksportowany do pliku PDF.');
  };
  
  // Filtrowanie wybranych modeli
  const selectedModelData = metrics.filter(metric => selectedModels.includes(metric.modelId));
  
  // Generowanie danych dla wykresu
  const generateChartData = () => {
    if (selectedModelData.length === 0) return [];
    
    const chartData = [];
    
    selectedModelData.forEach(modelData => {
      // Filtrowanie danych epok w zależności od zakresu czasu
      let epochData = [...modelData.epochMetrics];
      
      if (timeRange === 'last10') {
        epochData = epochData.slice(-10);
      } else if (timeRange === 'last25') {
        epochData = epochData.slice(-25);
      } else if (timeRange === 'last50') {
        epochData = epochData.slice(-50);
      }
      
      // Dodawanie danych do wykresu
      chartData.push({
        id: modelData.modelId,
        name: modelData.modelName,
        data: epochData.map(epoch => ({
          x: epoch.epoch,
          y: epoch[metricType]
        }))
      });
    });
    
    return chartData;
  };
  
  // Generowanie danych dla porównania modeli
  const generateComparisonData = () => {
    if (selectedModelData.length === 0) return [];
    
    const metrics = ['mAP50', 'mAP50_95', 'precision', 'recall', 'f1', 'inferenceTime'];
    const comparisonData = [];
    
    metrics.forEach(metric => {
      const metricData = {
        metric: getMetricLabel(metric),
        unit: metric === 'inferenceTime' ? 'ms' : '',
      };
      
      selectedModelData.forEach(modelData => {
        metricData[modelData.modelId] = modelData.metrics[metric];
      });
      
      comparisonData.push(metricData);
    });
    
    return comparisonData;
  };
  
  // Generowanie danych dla porównania klas
  const generateClassComparisonData = () => {
    if (selectedModelData.length === 0) return [];
    
    // Zbieranie wszystkich unikalnych klas
    const allClasses = new Set();
    selectedModelData.forEach(modelData => {
      modelData.classMetrics.forEach(classMet => {
        allClasses.add(classMet.class);
      });
    });
    
    const classComparisonData = [];
    
    // Dla każdej klasy tworzymy porównanie między modelami
    Array.from(allClasses).forEach(className => {
      const classData = {
        class: className,
      };
      
      selectedModelData.forEach(modelData => {
        const classMetric = modelData.classMetrics.find(cm => cm.class === className);
        
        if (classMetric) {
          classData[`${modelData.modelId}_precision`] = classMetric.precision;
          classData[`${modelData.modelId}_recall`] = classMetric.recall;
          classData[`${modelData.modelId}_f1`] = classMetric.f1;
          classData[`${modelData.modelId}_count`] = classMetric.count;
        } else {
          classData[`${modelData.modelId}_precision`] = 0;
          classData[`${modelData.modelId}_recall`] = 0;
          classData[`${modelData.modelId}_f1`] = 0;
          classData[`${modelData.modelId}_count`] = 0;
        }
      });
      
      classComparisonData.push(classData);
    });
    
    return classComparisonData;
  };
  
  // Pobieranie etykiety metryki
  const getMetricLabel = (metric) => {
    switch (metric) {
      case 'mAP50':
        return 'mAP@0.5';
      case 'mAP50_95':
        return 'mAP@0.5:0.95';
      case 'precision':
        return 'Precyzja';
      case 'recall':
        return 'Czułość';
      case 'f1':
        return 'F1 Score';
      case 'inferenceTime':
        return 'Czas inferencji';
      default:
        return metric;
    }
  };
  
  // Renderowanie wykresu liniowego
  const renderLineChart = () => {
    const chartData = generateChartData();
    
    if (chartData.length === 0) {
      return (
        <Alert severity="info">
          Wybierz co najmniej jeden model, aby zobaczyć wykres.
        </Alert>
      );
    }
    
    return (
      <Box sx={{ height: 400, position: 'relative' }}>
        <Typography variant="subtitle1" align="center" gutterBottom>
          {getMetricLabel(metricType)} w czasie treningu
        </Typography>
        
        <Box sx={{ height: '100%', position: 'relative' }}>
          {/* Symulacja wykresu liniowego */}
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'flex-end',
            position: 'relative',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            p: 2
          }}>
            {/* Osie */}
            <Box sx={{ 
              position: 'absolute', 
              left: 0, 
              top: 0, 
              bottom: 0, 
              width: 40, 
              borderRight: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 1
            }}>
              <Typography variant="caption">1.0</Typography>
              <Typography variant="caption">0.8</Typography>
              <Typography variant="caption">0.6</Typography>
              <Typography variant="caption">0.4</Typography>
              <Typography variant="caption">0.2</Typography>
              <Typography variant="caption">0.0</Typography>
            </Box>
            
            <Box sx={{ 
              position: 'absolute', 
              left: 40, 
              right: 0, 
              bottom: 0, 
              height: 30, 
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              p: 1
            }}>
              <Typography variant="caption">0</Typography>
              <Typography variant="caption">25</Typography>
              <Typography variant="caption">50</Typography>
              <Typography variant="caption">75</Typography>
              <Typography variant="caption">100</Typography>
            </Box>
            
            {/* Linie danych */}
            {chartData.map((series, index) => (
              <Box 
                key={series.id}
                sx={{ 
                  position: 'absolute',
                  left: 40,
                  right: 0,
                  top: 0,
                  bottom: 30,
                  p: 2
                }}
              >
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path
                    d={`M ${series.data[0].x} ${100 - series.data[0].y * 100} ${series.data.slice(1).map(point => `L ${point.x} ${100 - point.y * 100}`).join(' ')}`}
                    stroke={index === 0 ? '#3f51b5' : index === 1 ? '#f50057' : '#4caf50'}
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </Box>
            ))}
            
            {/* Legenda */}
            <Box sx={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 1,
              p: 1
            }}>
              {chartData.map((series, index) => (
                <Box key={series.id} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 2, 
                      backgroundColor: index === 0 ? '#3f51b5' : index === 1 ? '#f50057' : '#4caf50',
                      mr: 1 
                    }} 
                  />
                  <Typography variant="caption">{series.name}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };
  
  // Renderowanie wykresu słupkowego
  const renderBarChart = () => {
    const comparisonData = generateComparisonData();
    
    if (comparisonData.length === 0) {
      return (
        <Alert severity="info">
          Wybierz co najmniej jeden model, aby zobaczyć porównanie.
        </Alert>
      );
    }
    
    return (
      <Box sx={{ height: 400, position: 'relative' }}>
        <Typography variant="subtitle1" align="center" gutterBottom>
          Porównanie metryk modeli
        </Typography>
        
        <Box sx={{ height: '100%', position: 'relative' }}>
          {/* Symulacja wykresu słupkowego */}
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'flex-end',
            position: 'relative',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            p: 2
          }}>
            {/* Osie */}
            <Box sx={{ 
              position: 'absolute', 
              left: 0, 
              top: 0, 
              bottom: 0, 
              width: 100, 
              borderRight: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              p: 1
            }}>
              {comparisonData.map(data => (
                <Typography key={data.metric} variant="caption">{data.metric}</Typography>
              ))}
            </Box>
            
            {/* Słupki */}
            <Box sx={{ 
              position: 'absolute',
              left: 100,
              right: 0,
              top: 0,
              bottom: 0,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around'
            }}>
              {comparisonData.map((data, index) => (
                <Box key={data.metric} sx={{ display: 'flex', alignItems: 'center', height: 30 }}>
                  {selectedModelData.map((model, modelIndex) => {
                    const value = data[model.modelId];
                    const maxValue = data.metric === 'Czas inferencji' ? 50 : 1;
                    const width = `${(value / maxValue) * 100}%`;
                    
                    return (
                      <Box key={model.modelId} sx={{ mr: 1, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            sx={{ 
                              height: 20, 
                              width: width, 
                              backgroundColor: modelIndex === 0 ? '#3f51b5' : modelIndex === 1 ? '#f50057' : '#4caf50',
                              borderRadius: 1,
                              position: 'relative'
                            }} 
                          >
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                position: 'absolute', 
                                right: -40, 
                                top: 0, 
                                whiteSpace: 'nowrap' 
                              }}
                            >
                              {value.toFixed(2)}{data.unit}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
            
            {/* Legenda */}
            <Box sx={{ 
              position: 'absolute', 
              bottom: 10, 
              right: 10, 
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 1,
              p: 1
            }}>
              {selectedModelData.map((model, index) => (
                <Box key={model.modelId} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      backgroundColor: index === 0 ? '#3f51b5' : index === 1 ? '#f50057' : '#4caf50',
                      mr: 1,
                      borderRadius: 0.5
                    }} 
                  />
                  <Typography variant="caption">{model.modelName}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };
  
  // Renderowanie tabeli porównawczej
  const renderComparisonTable = () => {
    const comparisonData = generateComparisonData();
    
    if (comparisonData.length === 0) {
      return (
        <Alert severity="info">
          Wybierz co najmniej jeden model, aby zobaczyć porównanie.
        </Alert>
      );
    }
    
    return (
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Metryka</th>
              {selectedModelData.map(model => (
                <th key={model.modelId} style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>
                  {model.modelName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, index) => (
              <tr key={row.metric} style={{ backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>
                <td style={{ padding: 12, fontWeight: 'bold' }}>{row.metric}</td>
                {selectedModelData.map(model => (
                  <td key={model.modelId} style={{ padding: 12, textAlign: 'right' }}>
                    {row[model.modelId].toFixed(3)}{row.unit}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  };
  
  // Renderowanie tabeli porównawczej klas
  const renderClassComparisonTable = () => {
    const classComparisonData = generateClassComparisonData();
    
    if (classComparisonData.length === 0) {
      return (
        <Alert severity="info">
          Wybierz co najmniej jeden model, aby zobaczyć porównanie klas.
        </Alert>
      );
    }
    
    return (
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Klasa</th>
              {selectedModelData.map(model => (
                <React.Fragment key={model.modelId}>
                  <th colSpan="3" style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>
                    {model.modelName}
                  </th>
                </React.Fragment>
              ))}
            </tr>
            <tr>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}></th>
              {selectedModelData.map(model => (
                <React.Fragment key={model.modelId}>
                  <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>Precyzja</th>
                  <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>Czułość</th>
                  <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>F1</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {classComparisonData.map((row, index) => (
              <tr key={row.class} style={{ backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>
                <td style={{ padding: 12, fontWeight: 'bold' }}>{row.class}</td>
                {selectedModelData.map(model => (
                  <React.Fragment key={model.modelId}>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      {row[`${model.modelId}_precision`].toFixed(3)}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      {row[`${model.modelId}_recall`].toFixed(3)}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      {row[`${model.modelId}_f1`].toFixed(3)}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Metryki i porównanie modeli
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Wybór modeli
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Button
                variant="text"
                size="small"
                onClick={handleSelectAllModels}
              >
                {selectedModels.length === models.length ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
              </Button>
              
              <Button
                variant="text"
                size="small"
                startIcon={<Refresh />}
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 500);
                }}
              >
                Odśwież
              </Button>
            </Box>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {models.map(model => (
                  <ListItem 
                    key={model.id} 
                    button 
                    onClick={() => handleModelToggle(model.id)}
                    sx={{ 
                      borderRadius: 1,
                      mb: 0.5,
                      backgroundColor: selectedModels.includes(model.id) ? 'rgba(63, 81, 181, 0.08)' : 'transparent',
                      border: selectedModels.includes(model.id) ? '1px solid #3f51b5' : '1px solid transparent',
                    }}
                  >
                    <ListItemText 
                      primary={model.name} 
                      secondary={`${model.type} - ${model.size}`} 
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
          
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Opcje wykresu
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Typ metryki</InputLabel>
              <Select
                value={metricType}
                onChange={handleMetricTypeChange}
                label="Typ metryki"
              >
                <MenuItem value="mAP50">mAP@0.5</MenuItem>
                <MenuItem value="mAP50_95">mAP@0.5:0.95</MenuItem>
                <MenuItem value="precision">Precyzja</MenuItem>
                <MenuItem value="recall">Czułość</MenuItem>
                <MenuItem value="loss">Loss</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Zakres czasu</InputLabel>
              <Select
                value={timeRange}
                onChange={handleTimeRangeChange}
                label="Zakres czasu"
              >
                <MenuItem value="all">Wszystkie epoki</MenuItem>
                <MenuItem value="last10">Ostatnie 10 epok</MenuItem>
                <MenuItem value="last25">Ostatnie 25 epok</MenuItem>
                <MenuItem value="last50">Ostatnie 50 epok</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Typ wykresu</InputLabel>
              <Select
                value={chartType}
                onChange={handleChartTypeChange}
                label="Typ wykresu"
              >
                <MenuItem value="line">Liniowy</MenuItem>
                <MenuItem value="bar">Słupkowy</MenuItem>
              </Select>
            </FormControl>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Tryb widoku
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Button
                variant={viewMode === 'charts' ? 'contained' : 'outlined'}
                startIcon={<BarChart />}
                onClick={() => handleViewModeChange('charts')}
                sx={{ flex: 1, mr: 1 }}
              >
                Wykresy
              </Button>
              
              <Button
                variant={viewMode === 'tables' ? 'contained' : 'outlined'}
                startIcon={<ViewList />}
                onClick={() => handleViewModeChange('tables')}
                sx={{ flex: 1 }}
              >
                Tabele
              </Button>
            </Box>
            
            <Button
              variant="outlined"
              fullWidth
              startIcon={<FileDownload />}
              onClick={handleExportReport}
              sx={{ mt: 2 }}
            >
              Eksportuj raport
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            {viewMode === 'charts' ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Wykresy metryk
                  </Typography>
                  
                  <Box>
                    <Button
                      variant={chartType === 'line' ? 'contained' : 'outlined'}
                      size="small"
                      startIcon={<Timeline />}
                      onClick={() => setChartType('line')}
                      sx={{ mr: 1 }}
                    >
                      Liniowy
                    </Button>
                    
                    <Button
                      variant={chartType === 'bar' ? 'contained' : 'outlined'}
                      size="small"
                      startIcon={<BarChart />}
                      onClick={() => setChartType('bar')}
                    >
                      Słupkowy
                    </Button>
                  </Box>
                </Box>
                
                {chartType === 'line' ? renderLineChart() : renderBarChart()}
              </>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Porównanie metryk
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CompareArrows />}
                  >
                    Porównaj wybrane
                  </Button>
                </Box>
                
                {renderComparisonTable()}
              </>
            )}
          </Paper>
          
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Porównanie metryk dla klas
            </Typography>
            
            {renderClassComparisonTable()}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

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

export default MetricsPage;
