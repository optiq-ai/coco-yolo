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
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { 
  Save, 
  Delete, 
  Refresh, 
  CloudUpload, 
  CloudDownload, 
  Settings as SettingsIcon,
  Security,
  Storage,
  Notifications,
  Language,
  ColorLens,
  AccountCircle,
  Backup,
  Speed,
  DeveloperMode
} from '@mui/icons-material';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      darkMode: false,
      language: 'en',
      autoSave: true,
      saveInterval: 5,
      notifications: true
    },
    model: {
      defaultModel: 'yolov5s',
      confidenceThreshold: 0.5,
      iouThreshold: 0.45,
      maxDetections: 100,
      useGPU: true
    },
    storage: {
      storageLocation: 'local',
      maxImageSize: 10,
      compressionEnabled: true,
      compressionQuality: 0.8,
      autoBackup: false,
      backupInterval: 24
    },
    api: {
      apiKey: 'sk_test_abcdefghijklmnopqrstuvwxyz',
      apiEndpoint: 'https://api.example.com/v1',
      requestTimeout: 30,
      maxConcurrentRequests: 5,
      enableLogging: true
    }
  });
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Fetch settings from API
  const fetchSettings = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from an API
      // For now, we'll just use the default settings
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle setting change
  const handleSettingChange = (category, setting, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value
      }
    });
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In a real app, this would save to an API
      console.log('Saving settings:', settings);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setLoading(false);
    }
  };

  // Handle reset settings
  const handleResetSettings = () => {
    setResetDialogOpen(true);
  };

  // Confirm reset settings
  const confirmResetSettings = async () => {
    setLoading(true);
    try {
      // In a real app, this would reset settings to defaults via API
      setSettings({
        general: {
          darkMode: false,
          language: 'en',
          autoSave: true,
          saveInterval: 5,
          notifications: true
        },
        model: {
          defaultModel: 'yolov5s',
          confidenceThreshold: 0.5,
          iouThreshold: 0.45,
          maxDetections: 100,
          useGPU: true
        },
        storage: {
          storageLocation: 'local',
          maxImageSize: 10,
          compressionEnabled: true,
          compressionQuality: 0.8,
          autoBackup: false,
          backupInterval: 24
        },
        api: {
          apiKey: 'sk_test_abcdefghijklmnopqrstuvwxyz',
          apiEndpoint: 'https://api.example.com/v1',
          requestTimeout: 30,
          maxConcurrentRequests: 5,
          enableLogging: true
        }
      });
      setResetDialogOpen(false);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error resetting settings:', error);
      setLoading(false);
      setResetDialogOpen(false);
    }
  };

  // Handle export settings
  const handleExportSettings = () => {
    setExportDialogOpen(true);
  };

  // Confirm export settings
  const confirmExportSettings = () => {
    try {
      // In a real app, this would generate a file for download
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
      setExportDialogOpen(false);
    } catch (error) {
      console.error('Error exporting settings:', error);
      setExportDialogOpen(false);
    }
  };

  // Handle import settings
  const handleImportSettings = () => {
    setImportDialogOpen(true);
  };

  // Confirm import settings
  const confirmImportSettings = (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          setImportDialogOpen(false);
        } catch (parseError) {
          console.error('Error parsing settings file:', parseError);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing settings:', error);
      setImportDialogOpen(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              onClick={handleImportSettings}
            >
              Import
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<CloudDownload />}
              onClick={handleExportSettings}
            >
              Export
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleResetSettings}
            >
              Reset
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveSettings}
            >
              Save
            </Button>
          </Box>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{ borderRight: 1, borderColor: 'divider' }}
                  >
                    <Tab icon={<SettingsIcon />} label="General" />
                    <Tab icon={<Speed />} label="Model" />
                    <Tab icon={<Storage />} label="Storage" />
                    <Tab icon={<DeveloperMode />} label="API" />
                  </Tabs>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={9}>
              <Card>
                <CardContent>
                  {activeTab === 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        General Settings
                      </Typography>
                      
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <ColorLens />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Dark Mode" 
                            secondary="Enable dark theme for the application"
                          />
                          <Switch
                            checked={settings.general.darkMode}
                            onChange={(e) => handleSettingChange('general', 'darkMode', e.target.checked)}
                          />
                        </ListItem>
                        
                        <Divider />
                        
                        <ListItem>
                          <ListItemIcon>
                            <Language />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Language" 
                            secondary="Select your preferred language"
                          />
                          <TextField
                            select
                            value={settings.general.language}
                            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{ width: 150 }}
                            SelectProps={{
                              native: true,
                            }}
                          >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                            <option value="pl">Polski</option>
                          </TextField>
                        </ListItem>
                        
                        <Divider />
                        
                        <ListItem>
                          <ListItemIcon>
                            <Save />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Auto Save" 
                            secondary="Automatically save annotations while editing"
                          />
                          <Switch
                            checked={settings.general.autoSave}
                            onChange={(e) => handleSettingChange('general', 'autoSave', e.target.checked)}
                          />
                        </ListItem>
                        
                        <Divider />
                        
                        <ListItem>
                          <ListItemIcon>
                            <Save />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Save Interval (minutes)" 
                            secondary="How often to auto-save annotations"
                          />
                          <TextField
                            type="number"
                            value={settings.general.saveInterval}
                            onChange={(e) => handleSettingChange('general', 'saveInterval', parseInt(e.target.value))}
                            variant="outlined"
                            size="small"
                            sx={{ width: 100 }}
                            disabled={!settings.general.autoSave}
                            InputProps={{ inputProps: { min: 1, max: 60 } }}
                          />
                        </ListItem>
                        
                        <Divider />
                        
                        <ListItem>
                          <ListItemIcon>
                            <Notifications />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Notifications" 
                            secondary="Enable desktop notifications"
                          />
                          <Switch
                            checked={settings.general.notifications}
                            onChange={(e) => handleSettingChange('general', 'notifications', e.target.checked)}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  )}
                  
                  {activeTab === 1 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Model Settings
                      </Typography>
                      
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <SettingsIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Default Model" 
                            secondary="Select the default detection model"
                          />
                          <TextField
                            select
                            value={settings.model.defaultModel}
                            onChange={(e) => handleSettingChange('model', 'defaultModel', e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{ width: 150 }}
                            SelectProps={{
                              native: true,
                            }}
                          >
                            <option value="yolov5n">YOLOv5n (Nano)</option>
                            <option value="yolov5s">YOLOv5s (Small)</option>
                            <option value="yolov5m">YOLOv5m (Medium)</option>
                            <option value="yolov5l">YOLOv5l (Large)</option>
                            <option value="yolov5x">YOLOv5x (XLarge)</option>
                            <option value="yolov8n">YOLOv8n (Nano)</option>
                            <option value="yolov8s">YOLOv8s (Small)</option>
                            <option value="yolov8m">YOLOv8m (Medium)</option>
                            <option value="yolov8l">YOLOv8l (Large)</option>
                            <option value="yolov8x">YOLOv8x (XLarge)</option>
                          </TextField>
                        </ListItem>
                        
                        <Divider />
                        
                        <ListItem>
                          <ListItemIcon>
                            <SettingsIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Confidence Threshold" 
                            secondary="Minimum confidence score for detections (0-1)"
                          />
                          <TextField
                            type="number"
                            value={settings.model.confidenceThreshold}
                            onChange={(e) => handleSettingChange('model', 'confidenceThreshold', parseFloat(e.target.value))}
                            variant="outlined"
                            size="small"
                            sx={{ width: 100 }}
                            InputProps={{ inputProps: { min: 0, max: 1, step: 0.05 } }}
                          />
                        </ListItem>
                        
                        <Divider />
                        
                        <ListItem>
                          <ListItemIcon>
                            <SettingsIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="IoU Threshold" 
                            secondary="Intersection over Union threshold for NMS (0-1)"
                          />
                          <TextField
                            type="number"
                            value={settings.model.iouThreshold}
                            onChange={(e) => handleSettingChange('model', 'iouThreshold', parseFloat(e.target.value))}
                            variant="outlined"
                            size="small"
                            sx={{ width: 100 }}
                            InputProps={{ inputProps: { min: 0, max: 1, step: 0.05 } }}
                          />
                        </ListItem>
                        
                        <Divider />
                        
                        <ListItem>
                          <ListItemIcon>
                            <SettingsIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Max Detections" 
                            secondary="Maximum number of detections per image"
                          />
                          <TextField
                            type="number"
                            value={settings.model.maxDetections}
                            onChange={(e) => handleSettingChange('model', 'maxDetections', parseInt(e.target.value))}
                            variant="outlined"
                            size="small"
                            sx={{ width: 100 }}
                            InputProps={{ inputProps: { min: 1, max: 1000 } }}
                          />
                        </ListItem>
                        
                        <Divider />
                        
                        <ListItem>
                          <ListItemIcon>
                            <Speed />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Use GPU" 
                            secondary="Enable GPU acceleration for inference (if available)"
                          />
                          <Switch
                            checked={settings.model.useGPU}
                            onChange={(e) => handleSettingChange('model', 'useGPU', e.target.checked)}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  )}
                  
                  {activeTab === 2 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Storage Settings
                      </Typography>
                      
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <Storage />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Storage Location" 
                            secondary="Where to store images and annotations"
                          />
                          <TextField
                            select
                            value={settings.storage.storageLocation}
                            onChange={(e) => handleSettingChange('storage', 'storageLocation', e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{ width: 150 }}
                            SelectProps={{
                              native: true,
                            }}
                          >
                            <option value="local">Local Storage</option>
                            <option value="s3">Amazon S3</option>
                            <option value="gcs">Google Cloud Storage</option>
                            <option value="azure">Azure Blob Storage</option>
                          </TextField>
                        </ListItem>
                        
                        <Divider />
                        
                        <ListItem>
                          <ListItemIcon>
                            <Storage />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Max Image Size (MB)" 
                            secondary="Maximum size for uploaded images"
                          />
                          <TextField
                            type="number"
                            value={settings.storage.maxImageSize}
                            onChange={(e) => handleSettingChange('storage', 'maxImageSize', parseInt(e.target.value))}
                            variant="outlined"
                            size="small"
                            sx={{ width: 100 }}
                            InputProps={{ inputProps: { min: 1, max: 100 } }}
                          />
                        </ListItem>
                        
                        <Divider />
                        
                        <ListItem>
                          <ListItemIcon>
                            <Storage />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Image Compression" 
                            secondary="Enable image compression to save storage space"
                          />
                          <Switch
                            checked={settings.storage.compressionEnabled}
                            onChange={(e) => handleSettingChange('storage', 'compressionEnabled', e.target.checked)}
                          />
                        </ListItem>
                        
                        <Divider />
                        
                        <ListItem>
                          <ListItemIcon>
                            <Storage />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Compression Quality" 
                            secondary="Image compression quality (0-1)"
                          />
                          <TextField
                            type="number"
                            value={settings.storage.compressionQuality}
                            onChange={(e) => handleSettingChange('storage', 'compressionQuality', parseFloat(e.target.value))}
                            variant="outlined"
                            size="small"
                            sx={{ width: 100 }}
                            disabled={!settings.storage.compressionEnabled}
                            InputProps={{ inputProps: { min: 0.1, max: 1, step: 0.1 } }}
                          />
                        </ListItem>
                        
                        <Divider />
                        
                        <ListItem>
                          <ListItemIcon>
                            <Backup />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Auto Backup" 
                            secondary="Automatically backup data"
                          />
                          <Switch
                            checked={settings.storage.autoBackup}
                            onChange={(e) => handleSettingChange('storage', 'autoBackup', e.target.checked)}
                          />
                        </ListItem>
                        
                        <Divider />
                        
                        <ListItem>
                          <ListItemIcon>
                            <Backup />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Backup Interval (hours)" 
                            secondary="How often to backup data"
                          />
                          <TextField
                            type="number"
                            value={settings.storage.backupInterval}
                            onChange={(e) => handleSettingChange('storage', 'backupInterval', parseInt(e.target.value))}
                            variant="outlined"
                            size="small"
                            sx={{ width: 100 }}
                            disabled={!settings.storage.autoBackup}
                            InputProps={{ inputProps: { min: 1, max: 168 } }}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  )}
                  
                  {activeTab === 3 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        API Settings
                      </Typography>
                      
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <Security />
                          </ListItemIcon>
                          <ListItemText 
                            primary="API Key" 
                            secondary="Your API key for external services"
                          />
                          <TextField
                            type="password"
                            value={settings.api.apiKey}
                            onChange={(e) => handleSettingChange('api', 'apiKey', e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{ width: 250 }}
                          />
                        </ListItem>
                        
                        <Divider />
                        
                        <ListItem>
                          <ListItemIcon>
                            <DeveloperMode />
                          </ListItemIcon>
                          <ListItemText 
                            primary="API Endpoint" 
                            secondary="Base URL for API requests"
                          />
                          <TextField
                            value={settings.api.apiEndpoint}
                            onChange={(e) => handleSettingChange('api', 'apiEndpoint', e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{ width: 250 }}
                          />
                        </ListItem>
                        
                        <Divider />
                        
                        <ListItem>
                          <ListItemIcon>
                            <DeveloperMode />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Request Timeout (seconds)" 
                            secondary="Maximum time to wait for API responses"
                          />
                          <TextField
                            type="number"
                            value={settings.api.requestTimeout}
                            onChange={(e) => handleSettingChange('api', 'requestTimeout', parseInt(e.target.value))}
                            variant="outlined"
                            size="small"
                            sx={{ width: 100 }}
                            InputProps={{ inputProps: { min: 1, max: 300 } }}
                          />
                        </ListItem>
                        
                        <Divider />
                        
                        <ListItem>
                          <ListItemIcon>
                            <DeveloperMode />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Max Concurrent Requests" 
                            secondary="Maximum number of simultaneous API requests"
                          />
                          <TextField
                            type="number"
                            value={settings.api.maxConcurrentRequests}
                            onChange={(e) => handleSettingChange('api', 'maxConcurrentRequests', parseInt(e.target.value))}
                            variant="outlined"
                            size="small"
                            sx={{ width: 100 }}
                            InputProps={{ inputProps: { min: 1, max: 20 } }}
                          />
                        </ListItem>
                        
                        <Divider />
                        
                        <ListItem>
                          <ListItemIcon>
                            <DeveloperMode />
                          </ListItemIcon>
                          <ListItemText 
                            primary="API Logging" 
                            secondary="Enable detailed logging of API requests"
                          />
                          <Switch
                            checked={settings.api.enableLogging}
                            onChange={(e) => handleSettingChange('api', 'enableLogging', e.target.checked)}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
      
      {/* Reset Settings Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to reset all settings to their default values? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmResetSettings} color="error" variant="contained">
            Reset
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Export Settings Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Export your settings as a JSON file that can be imported later or on another device.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmExportSettings} color="primary" variant="contained">
            Export
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Import Settings Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
        <DialogTitle>Import Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Import settings from a previously exported JSON file.
          </Typography>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUpload />}
            sx={{ mt: 2 }}
          >
            Select File
            <input
              type="file"
              accept=".json"
              hidden
              onChange={confirmImportSettings}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SettingsPage;
