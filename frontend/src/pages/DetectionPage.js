import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Grid, Paper, Button, TextField, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, CircularProgress, Alert, Card, CardContent, Divider, List, ListItem, ListItemText, ListItemIcon, Switch, Slider, FormControlLabel, Checkbox, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { 
  Videocam, 
  PhotoCamera, 
  Image, 
  Search, 
  Download, 
  Save, 
  Delete, 
  Refresh, 
  Settings,
  CheckCircle,
  Warning,
  Close
} from '@mui/icons-material';
import ImageCanvas from '../components/editor/ImageCanvas';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const DetectionPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedModel, setSelectedModel] = useState('');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResults, setDetectionResults] = useState(null);
  const [imageSource, setImageSource] = useState('upload'); // 'upload', 'camera', 'url'
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [isLiveDetection, setIsLiveDetection] = useState(false);
  const [liveDetectionSettings, setLiveDetectionSettings] = useState({
    fps: 15,
    showLabels: true,
    showConfidence: true,
    recordVideo: false
  });
  const [liveStats, setLiveStats] = useState({
    objectsDetected: 0,
    fps: 0,
    processingTime: 0,
    classesDetected: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [exportDialog, setExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const liveDetectionIntervalRef = useRef(null);
  
  // Przykładowe modele
  const models = [
    { id: 'model1', name: 'YOLOv8n', type: 'YOLO', classes: 80, speed: 'Szybki', accuracy: 'Średnia' },
    { id: 'model2', name: 'YOLOv8m', type: 'YOLO', classes: 80, speed: 'Średni', accuracy: 'Wysoka' },
    { id: 'model3', name: 'YOLOv8x', type: 'YOLO', classes: 80, speed: 'Wolny', accuracy: 'Bardzo wysoka' },
    { id: 'model4', name: 'Faster R-CNN', type: 'R-CNN', classes: 90, speed: 'Wolny', accuracy: 'Wysoka' },
    { id: 'model5', name: 'SSD MobileNet', type: 'SSD', classes: 90, speed: 'Bardzo szybki', accuracy: 'Niska' },
  ];
  
  // Przykładowe klasy obiektów
  const classes = [
    { id: 0, name: 'Osoba', color: '#FF0000' },
    { id: 1, name: 'Samochód', color: '#00FF00' },
    { id: 2, name: 'Rower', color: '#0000FF' },
    { id: 3, name: 'Pies', color: '#FFFF00' },
    { id: 4, name: 'Kot', color: '#FF00FF' },
    { id: 5, name: 'Krzesło', color: '#00FFFF' },
    { id: 6, name: 'Stół', color: '#FFA500' },
    { id: 7, name: 'Telefon', color: '#800080' },
    { id: 8, name: 'Laptop', color: '#008000' },
    { id: 9, name: 'Książka', color: '#000080' },
  ];
  
  // Obsługa zmiany zakładki
  const handleTabChange = (event, newValue) => {
    // Zatrzymaj detekcję na żywo przy zmianie zakładki
    if (activeTab === 1 && newValue !== 1) {
      stopLiveDetection();
    }
    
    setActiveTab(newValue);
  };
  
  // Obsługa zmiany modelu
  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };
  
  // Obsługa zmiany progu pewności
  const handleConfidenceChange = (event, newValue) => {
    setConfidenceThreshold(newValue);
  };
  
  // Obsługa zmiany źródła obrazu
  const handleImageSourceChange = (source) => {
    // Zatrzymaj strumień kamery, jeśli był aktywny
    if (imageSource === 'camera' && cameraStream) {
      stopCameraStream();
    }
    
    setImageSource(source);
    setPreviewUrl('');
    setImageFile(null);
    setImageUrl('');
    setDetectionResults(null);
  };
  
  // Obsługa przesyłania pliku
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setDetectionResults(null);
    }
  };
  
  // Obsługa zmiany URL obrazu
  const handleImageUrlChange = (event) => {
    setImageUrl(event.target.value);
  };
  
  // Obsługa przechwytywania obrazu z kamery
  const handleCaptureFromCamera = async () => {
    try {
      setLoading(true);
      
      // Zatrzymaj poprzedni strumień, jeśli istnieje
      if (cameraStream) {
        stopCameraStream();
      }
      
      // Uzyskaj dostęp do kamery
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      setCameraStream(stream);
      
      // Utwórz tymczasowy element wideo do przechwycenia klatki
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Poczekaj na załadowanie metadanych wideo
      video.onloadedmetadata = () => {
        // Utwórz canvas do przechwycenia klatki
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        // Poczekaj chwilę, aby kamera mogła się dostosować
        setTimeout(() => {
          // Narysuj klatkę na canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Pobierz obraz jako URL danych
          const imageDataUrl = canvas.toDataURL('image/jpeg');
          setPreviewUrl(imageDataUrl);
          
          // Zatrzymaj strumień kamery
          stopCameraStream();
          
          setLoading(false);
          setDetectionResults(null);
        }, 500);
      };
    } catch (error) {
      console.error('Błąd podczas dostępu do kamery:', error);
      
      setSnackbar({
        open: true,
        message: 'Nie udało się uzyskać dostępu do kamery. Sprawdź uprawnienia.',
        severity: 'error'
      });
      
      // Symulacja przechwytywania obrazu w przypadku błędu
      setPreviewUrl('https://via.placeholder.com/800x600?text=Camera+Capture');
      setLoading(false);
      setDetectionResults(null);
    }
  };
  
  // Zatrzymanie strumienia kamery
  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };
  
  // Obsługa wczytywania obrazu z URL
  const handleLoadFromUrl = () => {
    if (imageUrl) {
      setLoading(true);
      
      // Sprawdź, czy URL jest poprawny
      const img = new Image();
      img.onload = () => {
        setPreviewUrl(imageUrl);
        setLoading(false);
        setDetectionResults(null);
      };
      img.onerror = () => {
        setSnackbar({
          open: true,
          message: 'Nie udało się załadować obrazu z podanego URL.',
          severity: 'error'
        });
        setLoading(false);
      };
      img.src = imageUrl;
    }
  };
  
  // Obsługa detekcji obiektów
  const handleDetectObjects = async () => {
    if (!selectedModel || !previewUrl) {
      setSnackbar({
        open: true,
        message: 'Wybierz model i obraz do detekcji.',
        severity: 'warning'
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Przygotuj dane do wysłania
      const formData = new FormData();
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else {
        formData.append('image_url', previewUrl);
      }
      
      formData.append('model_id', selectedModel);
      formData.append('confidence_threshold', confidenceThreshold);
      
      // Wywołaj API detekcji
      const response = await axios.post(`${API_URL}/api/detect`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setDetectionResults(response.data.results);
        
        setSnackbar({
          open: true,
          message: `Wykryto ${response.data.results.length} obiektów.`,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Błąd podczas detekcji obiektów:', error);
      
      // Symulacja detekcji obiektów w przypadku błędu
      setTimeout(() => {
        // Przykładowe wyniki detekcji
        const results = [
          { class: 0, confidence: 0.92, bbox: { x: 100, y: 150, width: 200, height: 350 } },
          { class: 1, confidence: 0.87, bbox: { x: 400, y: 200, width: 250, height: 150 } },
          { class: 4, confidence: 0.76, bbox: { x: 300, y: 300, width: 100, height: 80 } },
          { class: 2, confidence: 0.68, bbox: { x: 600, y: 250, width: 120, height: 200 } },
        ].filter(result => result.confidence >= confidenceThreshold);
        
        setDetectionResults(results);
        
        setSnackbar({
          open: true,
          message: `Wykryto ${results.length} obiektów (symulacja).`,
          severity: 'success'
        });
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Obsługa zapisywania wyników
  const handleSaveResults = async () => {
    if (!detectionResults) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Przygotuj dane do zapisania
      const saveData = {
        image_url: previewUrl,
        model_id: selectedModel,
        confidence_threshold: confidenceThreshold,
        results: detectionResults,
        timestamp: new Date().toISOString()
      };
      
      // Wywołaj API zapisywania
      const response = await axios.post(`${API_URL}/api/detection-results`, saveData);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Wyniki zostały zapisane.',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania wyników:', error);
      
      // Symulacja zapisywania w przypadku błędu
      setTimeout(() => {
        setSnackbar({
          open: true,
          message: 'Wyniki zostały zapisane (symulacja).',
          severity: 'success'
        });
      }, 1000);
    } finally {
      setLoading(false);
    }
  };
  
  // Obsługa eksportu wyników
  const handleExportResults = async () => {
    if (!detectionResults) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Przygotuj dane do eksportu
      const exportData = {
        image_url: previewUrl,
        model_id: selectedModel,
        confidence_threshold: confidenceThreshold,
        results: detectionResults,
        format: exportFormat
      };
      
      // Wywołaj API eksportu
      const response = await axios.post(`${API_URL}/api/export-detection`, exportData, {
        responseType: 'blob'
      });
      
      // Utwórz link do pobrania pliku
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `detection_results.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSnackbar({
        open: true,
        message: `Wyniki zostały wyeksportowane w formacie ${exportFormat.toUpperCase()}.`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Błąd podczas eksportu wyników:', error);
      
      // Symulacja eksportu w przypadku błędu
      setTimeout(() => {
        // Utwórz przykładowe dane w zależności od formatu
        let content = '';
        let mimeType = '';
        let extension = '';
        
        if (exportFormat === 'json') {
          content = JSON.stringify({
            image: previewUrl,
            model: models.find(m => m.id === selectedModel)?.name || 'Unknown',
            confidence_threshold: confidenceThreshold,
            detections: detectionResults.map(result => ({
              class: classes[result.class]?.name || `Class ${result.class}`,
              confidence: result.confidence,
              bbox: result.bbox
            }))
          }, null, 2);
          mimeType = 'application/json';
          extension = 'json';
        } else if (exportFormat === 'csv') {
          content = 'class,confidence,x,y,width,height\n';
          content += detectionResults.map(result => 
            `${classes[result.class]?.name || `Class ${result.class}`},${result.confidence},${result.bbox.x},${result.bbox.y},${result.bbox.width},${result.bbox.height}`
          ).join('\n');
          mimeType = 'text/csv';
          extension = 'csv';
        }
        
        // Utwórz link do pobrania pliku
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `detection_results.${extension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        setSnackbar({
          open: true,
          message: `Wyniki zostały wyeksportowane w formacie ${exportFormat.toUpperCase()} (symulacja).`,
          severity: 'success'
        });
      }, 1000);
    } finally {
      setLoading(false);
      setExportDialog(false);
    }
  };
  
  // Obsługa uruchamiania detekcji na żywo
  const handleStartLiveDetection = async () => {
    try {
      // Zatrzymaj poprzedni strumień, jeśli istnieje
      if (cameraStream) {
        stopCameraStream();
      }
      
      // Sprawdź, czy wybrano model
      if (!selectedModel) {
        setSnackbar({
          open: true,
          message: 'Wybierz model do detekcji.',
          severity: 'warning'
        });
        return;
      }
      
      // Uzyskaj dostęp do kamery
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      setCameraStream(stream);
      
      // Przypisz strumień do elementu wideo
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setIsLiveDetection(true);
      
      // Rozpocznij detekcję na żywo
      const fps = liveDetectionSettings.fps;
      const interval = 1000 / fps;
      
      liveDetectionIntervalRef.current = setInterval(() => {
        performLiveDetection();
      }, interval);
      
      setSnackbar({
        open: true,
        message: 'Detekcja na żywo została uruchomiona.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Błąd podczas uruchamiania detekcji na żywo:', error);
      
      setSnackbar({
        open: true,
        message: 'Nie udało się uruchomić detekcji na żywo. Sprawdź uprawnienia kamery.',
        severity: 'error'
      });
    }
  };
  
  // Wykonanie detekcji na żywo
  const performLiveDetection = async () => {
    if (!videoRef.current || !canvasRef.current || !isLiveDetection) {
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Ustaw wymiary canvas na wymiary wideo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Narysuj klatkę wideo na canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      const startTime = performance.now();
      
      // W rzeczywistej aplikacji tutaj byłoby wywołanie API detekcji
      // Symulacja detekcji obiektów
      const results = [];
      const numObjects = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < numObjects; i++) {
        const classId = Math.floor(Math.random() * classes.length);
        const confidence = Math.random() * 0.3 + 0.7; // 0.7 - 1.0
        
        if (confidence >= confidenceThreshold) {
          results.push({
            class: classId,
            confidence,
            bbox: {
              x: Math.floor(Math.random() * (canvas.width - 200)),
              y: Math.floor(Math.random() * (canvas.height - 200)),
              width: Math.floor(Math.random() * 150) + 50,
              height: Math.floor(Math.random() * 150) + 50
            }
          });
        }
      }
      
      // Narysuj wyniki detekcji na canvas
      results.forEach(result => {
        const className = classes[result.class]?.name || `Klasa ${result.class}`;
        const color = classes[result.class]?.color || '#FF0000';
        
        // Narysuj bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(result.bbox.x, result.bbox.y, result.bbox.width, result.bbox.height);
        
        // Narysuj etykietę, jeśli włączone
        if (liveDetectionSettings.showLabels) {
          ctx.fillStyle = color;
          ctx.fillRect(result.bbox.x, result.bbox.y - 20, 
            liveDetectionSettings.showConfidence ? 
              ctx.measureText(`${className} (${Math.round(result.confidence * 100)}%)`).width + 10 : 
              ctx.measureText(className).width + 10, 
            20);
          
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '12px Arial';
          ctx.fillText(
            liveDetectionSettings.showConfidence ? 
              `${className} (${Math.round(result.confidence * 100)}%)` : 
              className, 
            result.bbox.x + 5, 
            result.bbox.y - 5
          );
        }
      });
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Aktualizuj statystyki
      setLiveStats({
        objectsDetected: results.length,
        fps: Math.round(1000 / processingTime),
        processingTime: Math.round(processingTime),
        classesDetected: new Set(results.map(r => r.class)).size
      });
      
      // Jeśli włączone nagrywanie, tutaj byłby kod do nagrywania wideo
    } catch (error) {
      console.error('Błąd podczas detekcji na żywo:', error);
    }
  };
  
  // Obsługa zatrzymania detekcji na żywo
  const stopLiveDetection = () => {
    setIsLiveDetection(false);
    
    // Zatrzymaj interwał detekcji
    if (liveDetectionIntervalRef.current) {
      clearInterval(liveDetectionIntervalRef.current);
      liveDetectionIntervalRef.current = null;
    }
    
    // Zatrzymaj strumień kamery
    stopCameraStream();
    
    // Wyczyść canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    // Resetuj statystyki
    setLiveStats({
      objectsDetected: 0,
      fps: 0,
      processingTime: 0,
      classesDetected: 0
    });
  };
  
  // Obsługa zmiany ustawień detekcji na żywo
  const handleLiveDetectionSettingChange = (setting, value) => {
    setLiveDetectionSettings({
      ...liveDetectionSettings,
      [setting]: value
    });
    
    // Jeśli zmieniono FPS, zaktualizuj interwał
    if (setting === 'fps' && isLiveDetection) {
      if (liveDetectionIntervalRef.current) {
        clearInterval(liveDetectionIntervalRef.current);
      }
      
      const interval = 1000 / value;
      liveDetectionIntervalRef.current = setInterval(() => {
        performLiveDetection();
      }, interval);
    }
  };
  
  // Obsługa zamknięcia snackbara
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Renderowanie wyników detekcji
  const renderDetectionResults = () => {
    if (!detectionResults) {
      return null;
    }
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Wyniki detekcji
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Obraz do detekcji"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                  />
                )}
                
                {/* Renderowanie bounding boxów */}
                {detectionResults.map((result, index) => {
                  const className = classes[result.class]?.name || `Klasa ${result.class}`;
                  const color = classes[result.class]?.color || '#FF0000';
                  
                  return (
                    <Box
                      key={index}
                      sx={{
                        position: 'absolute',
                        left: `${result.bbox.x}px`,
                        top: `${result.bbox.y}px`,
                        width: `${result.bbox.width}px`,
                        height: `${result.bbox.height}px`,
                        border: `2px solid ${color}`,
                        boxSizing: 'border-box',
                        '&::before': {
                          content: `"${className} (${Math.round(result.confidence * 100)}%)"`,
                          position: 'absolute',
                          top: '-24px',
                          left: '0',
                          backgroundColor: color,
                          color: '#fff',
                          padding: '2px 6px',
                          fontSize: '12px',
                          borderRadius: '4px',
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Wykryte obiekty ({detectionResults.length})
              </Typography>
              
              <List sx={{ maxHeight: 350, overflow: 'auto' }}>
                {detectionResults.map((result, index) => {
                  const className = classes[result.class]?.name || `Klasa ${result.class}`;
                  const color = classes[result.class]?.color || '#FF0000';
                  
                  return (
                    <ListItem key={index} divider={index < detectionResults.length - 1}>
                      <ListItemIcon>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            backgroundColor: color,
                            borderRadius: '50%',
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={className}
                        secondary={`Pewność: ${Math.round(result.confidence * 100)}%`}
                      />
                    </ListItem>
                  );
                })}
              </List>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Akcje
                </Typography>
                
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={handleSaveResults}
                  fullWidth
                  sx={{ mb: 1 }}
                  disabled={loading}
                >
                  Zapisz wyniki
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => setExportDialog(true)}
                  fullWidth
                  disabled={loading}
                >
                  Eksportuj wyniki
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Efekt czyszczący przy odmontowaniu komponentu
  useEffect(() => {
    return () => {
      // Zatrzymaj detekcję na żywo
      if (isLiveDetection) {
        stopLiveDetection();
      }
      
      // Zatrzymaj strumień kamery
      if (cameraStream) {
        stopCameraStream();
      }
    };
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Detekcja obiektów
      </Typography>
      
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Detekcja" />
          <Tab label="Detekcja w czasie rzeczywistym" />
          <Tab label="Ustawienia zaawansowane" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            // Zakładka detekcji
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Źródło obrazu
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button
                      variant={imageSource === 'upload' ? 'contained' : 'outlined'}
                      startIcon={<Image />}
                      onClick={() => handleImageSourceChange('upload')}
                      disabled={loading || isProcessing}
                    >
                      Prześlij obraz
                    </Button>
                    <Button
                      variant={imageSource === 'camera' ? 'contained' : 'outlined'}
                      startIcon={<PhotoCamera />}
                      onClick={() => handleImageSourceChange('camera')}
                      disabled={loading || isProcessing}
                    >
                      Kamera
                    </Button>
                    <Button
                      variant={imageSource === 'url' ? 'contained' : 'outlined'}
                      startIcon={<Search />}
                      onClick={() => handleImageSourceChange('url')}
                      disabled={loading || isProcessing}
                    >
                      URL
                    </Button>
                  </Box>
                  
                  {imageSource === 'upload' && (
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ mb: 2 }}
                      disabled={loading || isProcessing}
                    >
                      Wybierz plik
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </Button>
                  )}
                  
                  {imageSource === 'camera' && (
                    <Button
                      variant="outlined"
                      startIcon={<PhotoCamera />}
                      onClick={handleCaptureFromCamera}
                      fullWidth
                      sx={{ mb: 2 }}
                      disabled={loading || isProcessing}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Zrób zdjęcie'}
                    </Button>
                  )}
                  
                  {imageSource === 'url' && (
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label="URL obrazu"
                        value={imageUrl}
                        onChange={handleImageUrlChange}
                        sx={{ mb: 1 }}
                        disabled={loading || isProcessing}
                      />
                      <Button
                        variant="outlined"
                        onClick={handleLoadFromUrl}
                        disabled={!imageUrl || loading || isProcessing}
                        fullWidth
                      >
                        {loading ? <CircularProgress size={24} /> : 'Wczytaj obraz'}
                      </Button>
                    </Box>
                  )}
                  
                  {previewUrl && (
                    <Paper variant="outlined" sx={{ p: 1, mb: 2 }}>
                      <img
                        src={previewUrl}
                        alt="Podgląd"
                        style={{
                          width: '100%',
                          maxHeight: '300px',
                          objectFit: 'contain',
                        }}
                      />
                    </Paper>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Parametry detekcji
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Model detekcji</InputLabel>
                    <Select
                      value={selectedModel}
                      onChange={handleModelChange}
                      label="Model detekcji"
                      disabled={loading || isProcessing}
                    >
                      <MenuItem value="">Wybierz model</MenuItem>
                      {models.map((model) => (
                        <MenuItem key={model.id} value={model.id}>
                          {model.name} ({model.type}) - {model.speed}, {model.accuracy} dokładność
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Próg pewności: {confidenceThreshold * 100}%
                  </Typography>
                  
                  <Slider
                    value={confidenceThreshold}
                    onChange={handleConfidenceChange}
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    marks={[
                      { value: 0.1, label: '10%' },
                      { value: 0.5, label: '50%' },
                      { value: 1.0, label: '100%' },
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value * 100}%`}
                    sx={{ mb: 3 }}
                    disabled={loading || isProcessing}
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Search />}
                    onClick={handleDetectObjects}
                    fullWidth
                    disabled={!selectedModel || !previewUrl || loading || isProcessing}
                  >
                    {isProcessing ? <CircularProgress size={24} color="inherit" /> : 'Wykryj obiekty'}
                  </Button>
                </Grid>
              </Grid>
              
              {renderDetectionResults()}
            </Box>
          )}
          
          {activeTab === 1 && (
            // Zakładka detekcji w czasie rzeczywistym
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Detekcja w czasie rzeczywistym wymaga dostępu do kamery. Upewnij się, że Twoja przeglądarka ma uprawnienia do korzystania z kamery.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper variant="outlined" sx={{ p: 2, height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {!isLiveDetection ? (
                      <Box sx={{ textAlign: 'center' }}>
                        <Videocam sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Podgląd kamery
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<Videocam />}
                          onClick={handleStartLiveDetection}
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} color="inherit" /> : 'Uruchom kamerę'}
                        </Button>
                      </Box>
                    ) : (
                      <>
                        <video 
                          ref={videoRef} 
                          style={{ 
                            position: 'absolute', 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain',
                            opacity: 0 // Ukryj wideo, pokazuj tylko canvas
                          }} 
                          muted 
                        />
                        <canvas 
                          ref={canvasRef} 
                          style={{ 
                            position: 'absolute', 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain' 
                          }} 
                        />
                        <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={stopLiveDetection}
                          >
                            Zatrzymaj
                          </Button>
                        </Box>
                      </>
                    )}
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>
                    Ustawienia detekcji na żywo
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Model detekcji</InputLabel>
                    <Select
                      value={selectedModel}
                      onChange={handleModelChange}
                      label="Model detekcji"
                      disabled={isLiveDetection || loading}
                    >
                      <MenuItem value="">Wybierz model</MenuItem>
                      {models.map((model) => (
                        <MenuItem key={model.id} value={model.id}>
                          {model.name} ({model.type})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Próg pewności: {confidenceThreshold * 100}%
                  </Typography>
                  
                  <Slider
                    value={confidenceThreshold}
                    onChange={handleConfidenceChange}
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    marks={[
                      { value: 0.1, label: '10%' },
                      { value: 0.5, label: '50%' },
                      { value: 1.0, label: '100%' },
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value * 100}%`}
                    sx={{ mb: 3 }}
                    disabled={loading}
                  />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Liczba klatek na sekundę: {liveDetectionSettings.fps}
                  </Typography>
                  
                  <Slider
                    value={liveDetectionSettings.fps}
                    onChange={(e, value) => handleLiveDetectionSettingChange('fps', value)}
                    min={1}
                    max={30}
                    step={1}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 15, label: '15' },
                      { value: 30, label: '30' },
                    ]}
                    valueLabelDisplay="auto"
                    sx={{ mb: 3 }}
                    disabled={loading}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={liveDetectionSettings.showLabels}
                        onChange={(e) => handleLiveDetectionSettingChange('showLabels', e.target.checked)}
                        disabled={loading}
                      />
                    }
                    label="Pokaż etykiety klas"
                    sx={{ mb: 1, display: 'block' }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={liveDetectionSettings.showConfidence}
                        onChange={(e) => handleLiveDetectionSettingChange('showConfidence', e.target.checked)}
                        disabled={loading || !liveDetectionSettings.showLabels}
                      />
                    }
                    label="Pokaż procent pewności"
                    sx={{ mb: 1, display: 'block' }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={liveDetectionSettings.recordVideo}
                        onChange={(e) => handleLiveDetectionSettingChange('recordVideo', e.target.checked)}
                        disabled={loading || !isLiveDetection}
                      />
                    }
                    label="Nagrywaj wideo"
                    sx={{ mb: 1, display: 'block' }}
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleStartLiveDetection}
                    disabled={isLiveDetection || loading || !selectedModel}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Rozpocznij detekcję'}
                  </Button>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Statystyki detekcji
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5" component="div">
                          {liveStats.objectsDetected}
                        </Typography>
                        <Typography color="text.secondary">
                          Wykrytych obiektów
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5" component="div">
                          {liveStats.fps} FPS
                        </Typography>
                        <Typography color="text.secondary">
                          Szybkość detekcji
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5" component="div">
                          {liveStats.processingTime} ms
                        </Typography>
                        <Typography color="text.secondary">
                          Czas przetwarzania
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5" component="div">
                          {liveStats.classesDetected}
                        </Typography>
                        <Typography color="text.secondary">
                          Liczba klas
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
          
          {activeTab === 2 && (
            // Zakładka ustawień zaawansowanych
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Ustawienia modelu
                  </Typography>
                  
                  <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Używaj GPU do detekcji (jeśli dostępne)"
                      sx={{ mb: 1, display: 'block' }}
                    />
                    
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Automatycznie wybieraj najlepszy model"
                      sx={{ mb: 1, display: 'block' }}
                    />
                    
                    <FormControlLabel
                      control={<Switch />}
                      label="Używaj modeli kwantyzowanych"
                      sx={{ mb: 1, display: 'block' }}
                    />
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Rozmiar wsadu (batch size)
                    </Typography>
                    
                    <Slider
                      defaultValue={1}
                      min={1}
                      max={16}
                      step={1}
                      marks={[
                        { value: 1, label: '1' },
                        { value: 8, label: '8' },
                        { value: 16, label: '16' },
                      ]}
                      valueLabelDisplay="auto"
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Non-maximum suppression (IoU threshold)
                    </Typography>
                    
                    <Slider
                      defaultValue={0.45}
                      min={0.1}
                      max={0.9}
                      step={0.05}
                      marks={[
                        { value: 0.1, label: '0.1' },
                        { value: 0.45, label: '0.45' },
                        { value: 0.9, label: '0.9' },
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Card>
                  
                  <Typography variant="h6" gutterBottom>
                    Przetwarzanie obrazu
                  </Typography>
                  
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Automatyczne skalowanie obrazu"
                      sx={{ mb: 1, display: 'block' }}
                    />
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Rozmiar wejściowy modelu
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Szerokość"
                          defaultValue="640"
                          type="number"
                          InputProps={{ inputProps: { min: 32, step: 32 } }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Wysokość"
                          defaultValue="640"
                          type="number"
                          InputProps={{ inputProps: { min: 32, step: 32 } }}
                        />
                      </Grid>
                    </Grid>
                    
                    <FormControlLabel
                      control={<Switch />}
                      label="Zastosuj augmentację danych"
                      sx={{ mb: 1, display: 'block' }}
                    />
                    
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Normalizacja obrazu"
                      sx={{ mb: 1, display: 'block' }}
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Filtrowanie klas
                  </Typography>
                  
                  <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Pokaż wszystkie klasy"
                      sx={{ mb: 2, display: 'block' }}
                    />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Wybierz klasy do detekcji:
                    </Typography>
                    
                    <Grid container spacing={1}>
                      {classes.map((cls) => (
                        <Grid item xs={6} key={cls.id}>
                          <FormControlLabel
                            control={<Checkbox defaultChecked />}
                            label={cls.name}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Card>
                  
                  <Typography variant="h6" gutterBottom>
                    Eksport i integracja
                  </Typography>
                  
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Format eksportu wyników
                    </Typography>
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <Select 
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                      >
                        <MenuItem value="json">COCO JSON</MenuItem>
                        <MenuItem value="yolo">YOLO TXT</MenuItem>
                        <MenuItem value="voc">Pascal VOC XML</MenuItem>
                        <MenuItem value="csv">CSV</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Automatycznie zapisuj wyniki"
                      sx={{ mb: 1, display: 'block' }}
                    />
                    
                    <FormControlLabel
                      control={<Switch />}
                      label="Integracja z bazą danych"
                      sx={{ mb: 1, display: 'block' }}
                    />
                    
                    <FormControlLabel
                      control={<Switch />}
                      label="Powiadomienia o detekcji"
                      sx={{ mb: 1, display: 'block' }}
                    />
                  </Card>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  sx={{ mr: 1 }}
                >
                  Przywróć domyślne
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                >
                  Zapisz ustawienia
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
        Tip: Możesz dostosować próg pewności, aby filtrować wyniki detekcji. Wyższy próg oznacza mniej wyników, ale większą pewność.
      </Typography>
      
      {/* Dialog eksportu wyników */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)}>
        <DialogTitle>Eksportuj wyniki</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Wybierz format eksportu wyników detekcji:
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Format</InputLabel>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              label="Format"
            >
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="yolo">YOLO TXT</MenuItem>
              <MenuItem value="voc">Pascal VOC XML</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Anuluj</Button>
          <Button 
            onClick={handleExportResults} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Eksportuj'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar do powiadomień */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DetectionPage;
