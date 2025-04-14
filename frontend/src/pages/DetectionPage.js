import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, TextField, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, CircularProgress, Alert, Card, CardContent, Divider, List, ListItem, ListItemText, ListItemIcon, Switch, Slider, FormControlLabel, Checkbox } from '@mui/material';
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
  Warning
} from '@mui/icons-material';
import ImageCanvas from '../components/editor/ImageCanvas';

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
  const handleCaptureFromCamera = () => {
    // W rzeczywistej aplikacji tutaj byłaby obsługa kamery
    // Symulacja przechwytywania obrazu
    setPreviewUrl('https://via.placeholder.com/800x600?text=Camera+Capture');
    setDetectionResults(null);
  };
  
  // Obsługa wczytywania obrazu z URL
  const handleLoadFromUrl = () => {
    if (imageUrl) {
      setPreviewUrl(imageUrl);
      setDetectionResults(null);
    }
  };
  
  // Obsługa detekcji obiektów
  const handleDetectObjects = () => {
    if (!selectedModel || !previewUrl) {
      return;
    }
    
    setIsProcessing(true);
    
    // Symulacja detekcji obiektów
    setTimeout(() => {
      // Przykładowe wyniki detekcji
      const results = [
        { class: 0, confidence: 0.92, bbox: { x: 100, y: 150, width: 200, height: 350 } },
        { class: 1, confidence: 0.87, bbox: { x: 400, y: 200, width: 250, height: 150 } },
        { class: 4, confidence: 0.76, bbox: { x: 300, y: 300, width: 100, height: 80 } },
        { class: 2, confidence: 0.68, bbox: { x: 600, y: 250, width: 120, height: 200 } },
      ].filter(result => result.confidence >= confidenceThreshold);
      
      setDetectionResults(results);
      setIsProcessing(false);
    }, 2000);
  };
  
  // Obsługa zapisywania wyników
  const handleSaveResults = () => {
    if (!detectionResults) {
      return;
    }
    
    // W rzeczywistej aplikacji tutaj byłoby zapisywanie wyników
    // Symulacja zapisywania
    alert('Wyniki zostały zapisane!');
  };
  
  // Obsługa eksportu wyników
  const handleExportResults = (format) => {
    if (!detectionResults) {
      return;
    }
    
    // W rzeczywistej aplikacji tutaj byłoby eksportowanie wyników
    // Symulacja eksportowania
    alert(`Wyniki zostały wyeksportowane w formacie ${format}!`);
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
                >
                  Zapisz wyniki
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => handleExportResults('JSON')}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Eksportuj jako JSON
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => handleExportResults('CSV')}
                  fullWidth
                >
                  Eksportuj jako CSV
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

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
                    >
                      Prześlij obraz
                    </Button>
                    <Button
                      variant={imageSource === 'camera' ? 'contained' : 'outlined'}
                      startIcon={<PhotoCamera />}
                      onClick={() => handleImageSourceChange('camera')}
                    >
                      Kamera
                    </Button>
                    <Button
                      variant={imageSource === 'url' ? 'contained' : 'outlined'}
                      startIcon={<Search />}
                      onClick={() => handleImageSourceChange('url')}
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
                    >
                      Zrób zdjęcie
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
                      />
                      <Button
                        variant="outlined"
                        onClick={handleLoadFromUrl}
                        disabled={!imageUrl}
                        fullWidth
                      >
                        Wczytaj obraz
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
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleDetectObjects}
                    disabled={!selectedModel || !previewUrl || isProcessing}
                    startIcon={isProcessing ? <CircularProgress size={24} /> : null}
                  >
                    {isProcessing ? 'Przetwarzanie...' : 'Wykryj obiekty'}
                  </Button>
                  
                  {selectedModel && (
                    <Card variant="outlined" sx={{ mt: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Informacje o modelu
                        </Typography>
                        
                        {models.find(m => m.id === selectedModel) && (
                          <List dense>
                            <ListItem>
                              <ListItemText 
                                primary="Nazwa" 
                                secondary={models.find(m => m.id === selectedModel).name} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Typ" 
                                secondary={models.find(m => m.id === selectedModel).type} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Liczba klas" 
                                secondary={models.find(m => m.id === selectedModel).classes} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Szybkość" 
                                secondary={models.find(m => m.id === selectedModel).speed} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Dokładność" 
                                secondary={models.find(m => m.id === selectedModel).accuracy} 
                              />
                            </ListItem>
                          </List>
                        )}
                      </CardContent>
                    </Card>
                  )}
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
                  <Paper variant="outlined" sx={{ p: 2, height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Videocam sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Podgląd kamery
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Videocam />}
                      >
                        Uruchom kamerę
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>
                    Ustawienia detekcji na żywo
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Model detekcji</InputLabel>
                    <Select
                      defaultValue=""
                      label="Model detekcji"
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
                    Próg pewności: 50%
                  </Typography>
                  
                  <Slider
                    defaultValue={0.5}
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
                  />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Liczba klatek na sekundę: 15
                  </Typography>
                  
                  <Slider
                    defaultValue={15}
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
                  />
                  
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Pokaż etykiety klas"
                    sx={{ mb: 1, display: 'block' }}
                  />
                  
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Pokaż procent pewności"
                    sx={{ mb: 1, display: 'block' }}
                  />
                  
                  <FormControlLabel
                    control={<Switch />}
                    label="Nagrywaj wideo"
                    sx={{ mb: 1, display: 'block' }}
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled
                  >
                    Rozpocznij detekcję
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
                          0
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
                          0 FPS
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
                          0 ms
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
                          0
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
                      <Select defaultValue="coco">
                        <MenuItem value="coco">COCO JSON</MenuItem>
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
    </Box>
  );
};

export default DetectionPage;
