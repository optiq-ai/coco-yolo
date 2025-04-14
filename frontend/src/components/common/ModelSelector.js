import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Card, CardContent, Divider, List, ListItem, ListItemText, Switch, FormControlLabel } from '@mui/material';
import { 
  Settings, 
  Save, 
  Refresh,
  DarkMode,
  LightMode,
  Language,
  Storage,
  Security,
  Notifications,
  CloudUpload,
  CloudDownload
} from '@mui/icons-material';

const SettingsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Ustawienia ogólne
    darkMode: true,
    language: 'pl',
    autoSave: true,
    saveInterval: 5,
    
    // Ustawienia interfejsu
    showThumbnails: true,
    thumbnailSize: 'medium',
    showConfidence: true,
    showLabelsCount: true,
    
    // Ustawienia detekcji
    defaultModel: 'yolov8n',
    confidenceThreshold: 0.5,
    nmsThreshold: 0.45,
    maxDetections: 100,
    
    // Ustawienia treningu
    defaultEpochs: 100,
    defaultBatchSize: 16,
    defaultLearningRate: 0.001,
    defaultImageSize: 640,
    defaultAugmentation: true,
    
    // Ustawienia powiadomień
    notifyOnTrainingComplete: true,
    notifyOnDetectionComplete: true,
    notifyOnError: true,
    
    // Ustawienia przechowywania
    storageLimit: 10, // GB
    autoCleanup: true,
    cleanupThreshold: 80, // %
    keepBackups: true,
    backupCount: 3,
    
    // Ustawienia zaawansowane
    useGPU: true,
    maxGPUMemory: 80, // %
    workerThreads: 4,
    enableExperimental: false,
    debugMode: false
  });
  
  const [models, setModels] = useState([]);
  const [activeTab, setActiveTab] = useState('general');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Przykładowe dane
  useEffect(() => {
    // Symulacja ładowania danych
    setIsLoading(true);
    
    setTimeout(() => {
      const mockModels = [
        { id: 'yolov8n', name: 'YOLOv8 Nano', type: 'YOLO', size: 'Mały', params: '3.2M' },
        { id: 'yolov8s', name: 'YOLOv8 Small', type: 'YOLO', size: 'Średni', params: '11.2M' },
        { id: 'yolov8m', name: 'YOLOv8 Medium', type: 'YOLO', size: 'Duży', params: '25.9M' },
        { id: 'yolov8l', name: 'YOLOv8 Large', type: 'YOLO', size: 'Bardzo duży', params: '43.7M' },
        { id: 'fasterrcnn', name: 'Faster R-CNN', type: 'R-CNN', size: 'Duży', params: '41.8M' },
        { id: 'ssd', name: 'SSD MobileNet', type: 'SSD', size: 'Mały', params: '4.3M' },
      ];
      
      setModels(mockModels);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Obsługa zmiany zakładki
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Obsługa zmiany ustawień
  const handleSettingChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    });
    
    setUnsavedChanges(true);
    setSaveSuccess(false);
  };
  
  // Obsługa zapisywania ustawień
  const handleSaveSettings = () => {
    setIsLoading(true);
    
    // Symulacja zapisywania ustawień
    setTimeout(() => {
      setIsLoading(false);
      setUnsavedChanges(false);
      setSaveSuccess(true);
      
      // Ukrycie komunikatu o sukcesie po 3 sekundach
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
  };
  
  // Obsługa resetowania ustawień
  const handleResetSettings = () => {
    if (window.confirm('Czy na pewno chcesz przywrócić ustawienia domyślne? Ta operacja nie może być cofnięta.')) {
      setIsLoading(true);
      
      // Symulacja resetowania ustawień
      setTimeout(() => {
        setSettings({
          // Ustawienia ogólne
          darkMode: true,
          language: 'pl',
          autoSave: true,
          saveInterval: 5,
          
          // Ustawienia interfejsu
          showThumbnails: true,
          thumbnailSize: 'medium',
          showConfidence: true,
          showLabelsCount: true,
          
          // Ustawienia detekcji
          defaultModel: 'yolov8n',
          confidenceThreshold: 0.5,
          nmsThreshold: 0.45,
          maxDetections: 100,
          
          // Ustawienia treningu
          defaultEpochs: 100,
          defaultBatchSize: 16,
          defaultLearningRate: 0.001,
          defaultImageSize: 640,
          defaultAugmentation: true,
          
          // Ustawienia powiadomień
          notifyOnTrainingComplete: true,
          notifyOnDetectionComplete: true,
          notifyOnError: true,
          
          // Ustawienia przechowywania
          storageLimit: 10,
          autoCleanup: true,
          cleanupThreshold: 80,
          keepBackups: true,
          backupCount: 3,
          
          // Ustawienia zaawansowane
          useGPU: true,
          maxGPUMemory: 80,
          workerThreads: 4,
          enableExperimental: false,
          debugMode: false
        });
        
        setIsLoading(false);
        setUnsavedChanges(false);
        setSaveSuccess(true);
        
        // Ukrycie komunikatu o sukcesie po 3 sekundach
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }, 1000);
    }
  };
  
  // Obsługa eksportu ustawień
  const handleExportSettings = () => {
    const settingsJson = JSON.stringify(settings, null, 2);
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yolo-coco-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Obsługa importu ustawień
  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      
      if (file) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            const importedSettings = JSON.parse(event.target.result);
            setSettings(importedSettings);
            setUnsavedChanges(true);
            alert('Ustawienia zostały zaimportowane pomyślnie.');
          } catch (error) {
            alert('Błąd podczas importowania ustawień. Upewnij się, że plik jest prawidłowym plikiem JSON.');
          }
        };
        
        reader.readAsText(file);
      }
    };
    
    input.click();
  };
  
  // Renderowanie zakładki ustawień ogólnych
  const renderGeneralSettings = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Ustawienia ogólne
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                />
              }
              label="Tryb ciemny"
            />
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1, mb: 2 }}>
              Włącz ciemny motyw interfejsu
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Język</InputLabel>
              <Select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                label="Język"
              >
                <MenuItem value="pl">Polski</MenuItem>
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="de">Deutsch</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="es">Español</MenuItem>
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Język interfejsu użytkownika
              </Typography>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoSave}
                  onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                />
              }
              label="Automatyczne zapisywanie"
            />
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1, mb: 2 }}>
              Automatycznie zapisuj zmiany w etykietach
            </Typography>
            
            <TextField
              fullWidth
              label="Interwał zapisywania (min)"
              type="number"
              value={settings.saveInterval}
              onChange={(e) => handleSettingChange('saveInterval', parseInt(e.target.value))}
              disabled={!settings.autoSave}
              inputProps={{ min: 1, max: 60 }}
              sx={{ mb: 3 }}
            />
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Ustawienia interfejsu
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showThumbnails}
                  onChange={(e) => handleSettingChange('showThumbnails', e.target.checked)}
                />
              }
              label="Pokaż miniatury"
            />
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1, mb: 2 }}>
              Wyświetlaj miniatury obrazów na liście
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }} disabled={!settings.showThumbnails}>
              <InputLabel>Rozmiar miniatur</InputLabel>
              <Select
                value={settings.thumbnailSize}
                onChange={(e) => handleSettingChange('thumbnailSize', e.target.value)}
                label="Rozmiar miniatur"
              >
                <MenuItem value="small">Mały</MenuItem>
                <MenuItem value="medium">Średni</MenuItem>
                <MenuItem value="large">Duży</MenuItem>
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Rozmiar miniatur na liście obrazów
              </Typography>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showConfidence}
                  onChange={(e) => handleSettingChange('showConfidence', e.target.checked)}
                />
              }
              label="Pokaż pewność detekcji"
            />
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1, mb: 2 }}>
              Wyświetlaj wartość pewności dla każdej detekcji
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showLabelsCount}
                  onChange={(e) => handleSettingChange('showLabelsCount', e.target.checked)}
                />
              }
              label="Pokaż liczbę etykiet"
            />
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1, mb: 2 }}>
              Wyświetlaj liczbę etykiet dla każdego obrazu
            </Typography>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  // Renderowanie zakładki ustawień detekcji
  const renderDetectionSettings = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Ustawienia detekcji obiektów
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Domyślny model</InputLabel>
              <Select
                value={settings.defaultModel}
                onChange={(e) => handleSettingChange('defaultModel', e.target.value)}
                label="Domyślny model"
              >
                {models.map(model => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name} ({model.type}) - {model.size}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Model używany domyślnie do detekcji obiektów
              </Typography>
            </FormControl>
            
            <TextField
              fullWidth
              label="Próg pewności"
              type="number"
              value={settings.confidenceThreshold}
              onChange={(e) => handleSettingChange('confidenceThreshold', parseFloat(e.target.value))}
              inputProps={{ step: 0.05, min: 0.05, max: 0.95 }}
              sx={{ mb: 3 }}
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -2.5, mb: 2 }}>
              Minimalny próg pewności dla detekcji (0.05 - 0.95)
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Próg NMS"
              type="number"
              value={settings.nmsThreshold}
              onChange={(e) => handleSettingChange('nmsThreshold', parseFloat(e.target.value))}
              inputProps={{ step: 0.05, min: 0.05, max: 0.95 }}
              sx={{ mb: 3 }}
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -2.5, mb: 2 }}>
              Próg Non-Maximum Suppression (0.05 - 0.95)
            </Typography>
            
            <TextField
              fullWidth
              label="Maksymalna liczba detekcji"
              type="number"
              value={settings.maxDetections}
              onChange={(e) => handleSettingChange('maxDetections', parseInt(e.target.value))}
              inputProps={{ min: 10, max: 1000 }}
              sx={{ mb: 3 }}
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -2.5, mb: 2 }}>
              Maksymalna liczba detekcji na obraz (10 - 1000)
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Ustawienia treningu
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Domyślna liczba epok"
              type="number"
              value={settings.defaultEpochs}
              onChange={(e) => handleSettingChange('defaultEpochs', parseInt(e.target.value))}
              inputProps={{ min: 1, max: 1000 }}
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Domyślny rozmiar batcha"
              type="number"
              value={settings.defaultBatchSize}
              onChange={(e) => handleSettingChange('defaultBatchSize', parseInt(e.target.value))}
              inputProps={{ min: 1, max: 128 }}
              sx={{ mb: 3 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Domyślny współczynnik uczenia"
              type="number"
              value={settings.defaultLearningRate}
              onChange={(e) => handleSettingChange('defaultLearningRate', parseFloat(e.target.value))}
              inputProps={{ step: 0.0001, min: 0.0001, max: 0.1 }}
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Domyślny rozmiar obrazu"
              type="number"
              value={settings.defaultImageSize}
              onChange={(e) => handleSettingChange('defaultImageSize', parseInt(e.target.value))}
              inputProps={{ step: 32, min: 32, max: 1280 }}
              sx={{ mb: 3 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.defaultAugmentation}
                  onChange={(e) => handleSettingChange('defaultAugmentation', e.target.checked)}
                />
              }
              label="Domyślna augmentacja danych"
            />
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  // Renderowanie zakładki ustawień powiadomień
  const renderNotificationSettings = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Ustawienia powiadomień
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyOnTrainingComplete}
                  onChange={(e) => handleSettingChange('notifyOnTrainingComplete', e.target.checked)}
                />
              }
              label="Powiadomienie o zakończeniu treningu"
            />
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1, mb: 2 }}>
              Otrzymuj powiadomienia po zakończeniu treningu modelu
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyOnDetectionComplete}
                  onChange={(e) => handleSettingChange('notifyOnDetectionComplete', e.target.checked)}
                />
              }
              label="Powiadomienie o zakończeniu detekcji"
            />
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1, mb: 2 }}>
              Otrzymuj powiadomienia po zakończeniu detekcji obiektów
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyOnError}
                  onChange={(e) => handleSettingChange('notifyOnError', e.target.checked)}
                />
              }
              label="Powiadomienie o błędach"
            />
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1, mb: 2 }}>
              Otrzymuj powiadomienia o błędach w systemie
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Ustawienia przechowywania
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Limit przechowywania (GB)"
              type="number"
              value={settings.storageLimit}
              onChange={(e) => handleSettingChange('storageLimit', parseInt(e.target.value))}
              inputProps={{ min: 1, max: 1000 }}
              sx={{ mb: 3 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoCleanup}
                  onChange={(e) => handleSettingChange('autoCleanup', e.target.checked)}
                />
              }
              label="Automatyczne czyszczenie"
            />
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1, mb: 2 }}>
              Automatycznie usuwaj stare dane, gdy przekroczony zostanie próg
            </Typography>
            
            <TextField
              fullWidth
              label="Próg czyszczenia (%)"
              type="number"
              value={settings.cleanupThreshold}
              onChange={(e) => handleSettingChange('cleanupThreshold', parseInt(e.target.value))}
              disabled={!settings.autoCleanup}
              inputProps={{ min: 50, max: 95 }}
              sx={{ mb: 3 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.keepBackups}
                  onChange={(e) => handleSettingChange('keepBackups', e.target.checked)}
                />
              }
              label="Przechowuj kopie zapasowe"
            />
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1, mb: 2 }}>
              Twórz kopie zapasowe danych i ustawień
            </Typography>
            
            <TextField
              fullWidth
              label="Liczba kopii zapasowych"
              type="number"
              value={settings.backupCount}
              onChange={(e) => handleSettingChange('backupCount', parseInt(e.target.value))}
              disabled={!settings.keepBackups}
              inputProps={{ min: 1, max: 10 }}
              sx={{ mb: 3 }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  // Renderowanie zakładki ustawień zaawansowanych
  const renderAdvancedSettings = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Ustawienia zaawansowane
        </Typography>
        
        <Alert severity="warning" sx={{ mb: 3 }}>
          Uwaga! Zmiana tych ustawień może wpłynąć na wydajność i stabilność aplikacji. Zmieniaj je tylko, jeśli wiesz, co robisz.
        </Alert>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.useGPU}
                  onChange={(e) => handleSettingChange('useGPU', e.target.checked)}
                />
              }
              label="Używaj GPU"
            />
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1, mb: 2 }}>
              Używaj akceleracji GPU do detekcji i treningu
            </Typography>
            
            <TextField
              fullWidth
              label="Maksymalne użycie pamięci GPU (%)"
              type="number"
              value={settings.maxGPUMemory}
              onChange={(e) => handleSettingChange('maxGPUMemory', parseInt(e.target.value))}
              disabled={!settings.useGPU}
              inputProps={{ min: 10, max: 100 }}
              sx={{ mb: 3 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Liczba wątków roboczych"
              type="number"
              value={settings.workerThreads}
              onChange={(e) => handleSettingChange('workerThreads', parseInt(e.target.value))}
              inputProps={{ min: 1, max: 16 }}
              sx={{ mb: 3 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableExperimental}
                  onChange={(e) => handleSettingChange('enableExperimental', e.target.checked)}
                />
              }
              label="Włącz funkcje eksperymentalne"
            />
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1, mb: 2 }}>
              Włącz eksperymentalne funkcje, które mogą być niestabilne
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.debugMode}
                  onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
                />
              }
              label="Tryb debugowania"
            />
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1, mb: 2 }}>
              Włącz szczegółowe logowanie dla celów debugowania
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Zarządzanie ustawieniami
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CloudDownload />}
              onClick={handleExportSettings}
            >
              Eksportuj ustawienia
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CloudUpload />}
              onClick={handleImportSettings}
            >
              Importuj ustawienia
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={handleResetSettings}
            >
              Resetuj ustawienia
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Ustawienia
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={1}>
          <Grid item>
            <Button
              variant={activeTab === 'general' ? 'contained' : 'outlined'}
              onClick={() => handleTabChange('general')}
              startIcon={<Settings />}
            >
              Ogólne
            </Button>
          </Grid>
          
          <Grid item>
            <Button
              variant={activeTab === 'detection' ? 'contained' : 'outlined'}
              onClick={() => handleTabChange('detection')}
              startIcon={<Settings />}
            >
              Detekcja i trening
            </Button>
          </Grid>
          
          <Grid item>
            <Button
              variant={activeTab === 'notifications' ? 'contained' : 'outlined'}
              onClick={() => handleTabChange('notifications')}
              startIcon={<Notifications />}
            >
              Powiadomienia
            </Button>
          </Grid>
          
          <Grid item>
            <Button
              variant={activeTab === 'advanced' ? 'contained' : 'outlined'}
              onClick={() => handleTabChange('advanced')}
              startIcon={<Settings />}
            >
              Zaawansowane
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'detection' && renderDetectionSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'advanced' && renderAdvancedSettings()}
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                {unsavedChanges && (
                  <Typography variant="body2" color="warning.main">
                    Masz niezapisane zmiany
                  </Typography>
                )}
                
                {saveSuccess && (
                  <Typography variant="body2" color="success.main">
                    Ustawienia zostały zapisane pomyślnie
                  </Typography>
                )}
              </Box>
              
              <Box>
                <Button
                  variant="outlined"
                  onClick={handleResetSettings}
                  sx={{ mr: 2 }}
                >
                  Anuluj zmiany
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveSettings}
                  disabled={!unsavedChanges}
                >
                  Zapisz ustawienia
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default SettingsPage;
