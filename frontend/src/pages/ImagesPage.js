import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Card, CardContent, Divider, List, ListItem, ListItemText } from '@mui/material';
import { 
  CloudUpload, 
  Delete, 
  Refresh, 
  Search,
  FilterList,
  Image,
  PhotoCamera,
  Folder
} from '@mui/icons-material';
import ImageUploader from '../components/common/ImageUploader';

const ImagesPage = () => {
  const [images, setImages] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showUploader, setShowUploader] = useState(false);
  
  // Przykładowe dane
  useEffect(() => {
    // Symulacja ładowania danych
    setIsLoading(true);
    
    setTimeout(() => {
      const mockDatasets = [
        { id: 'dataset1', name: 'Zbiór testowy', count: 120 },
        { id: 'dataset2', name: 'Zbiór treningowy', count: 500 },
        { id: 'dataset3', name: 'Zbiór walidacyjny', count: 100 },
        { id: 'dataset4', name: 'Zdjęcia z kamery', count: 45 },
      ];
      
      const mockImages = Array.from({ length: 50 }, (_, i) => ({
        id: `img${i + 1}`,
        name: `Obraz ${i + 1}.jpg`,
        dataset: mockDatasets[i % mockDatasets.length].id,
        datasetName: mockDatasets[i % mockDatasets.length].name,
        date: new Date(2025, 3, Math.floor(Math.random() * 14) + 1).toISOString(),
        size: Math.floor(Math.random() * 5000) + 500,
        width: 1920,
        height: 1080,
        labels: Math.floor(Math.random() * 10),
        thumbnail: `https://picsum.photos/id/${(i * 17) % 1000}/300/200`,
        classes: ['osoba', 'samochód', 'rower'].slice(0, Math.floor(Math.random() * 3) + 1)
      }));
      
      setDatasets(mockDatasets);
      setImages(mockImages);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Filtrowanie obrazów
  const filteredImages = images.filter(image => {
    // Filtrowanie po zbiorze danych
    if (selectedDataset !== 'all' && image.dataset !== selectedDataset) {
      return false;
    }
    
    // Filtrowanie po zapytaniu wyszukiwania
    if (searchQuery && !image.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Sortowanie obrazów
  const sortedImages = [...filteredImages].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = new Date(a.date) - new Date(b.date);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'labels':
        comparison = a.labels - b.labels;
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  // Obsługa wyboru zbioru danych
  const handleDatasetChange = (event) => {
    setSelectedDataset(event.target.value);
  };
  
  // Obsługa wyszukiwania
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Obsługa sortowania
  const handleSortByChange = (event) => {
    setSortBy(event.target.value);
  };
  
  // Obsługa zmiany kolejności sortowania
  const handleSortOrderChange = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  // Obsługa wyboru obrazu
  const handleImageSelect = (imageId) => {
    if (selectedImages.includes(imageId)) {
      setSelectedImages(selectedImages.filter(id => id !== imageId));
    } else {
      setSelectedImages([...selectedImages, imageId]);
    }
  };
  
  // Obsługa wyboru wszystkich obrazów
  const handleSelectAll = () => {
    if (selectedImages.length === sortedImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(sortedImages.map(image => image.id));
    }
  };
  
  // Obsługa usuwania wybranych obrazów
  const handleDeleteSelected = () => {
    if (window.confirm(`Czy na pewno chcesz usunąć ${selectedImages.length} wybranych obrazów?`)) {
      setImages(images.filter(image => !selectedImages.includes(image.id)));
      setSelectedImages([]);
    }
  };
  
  // Obsługa przesyłania obrazów
  const handleUpload = (files) => {
    // Dodawanie nowych obrazów
    const newImages = Array.from(files).map((file, index) => ({
      id: `new-img-${Date.now()}-${index}`,
      name: file.name,
      dataset: selectedDataset === 'all' ? 'dataset1' : selectedDataset,
      datasetName: datasets.find(d => d.id === (selectedDataset === 'all' ? 'dataset1' : selectedDataset))?.name || 'Nieznany',
      date: new Date().toISOString(),
      size: file.size,
      width: 1920,
      height: 1080,
      labels: 0,
      thumbnail: URL.createObjectURL(file),
      classes: []
    }));
    
    setImages([...newImages, ...images]);
    setShowUploader(false);
  };
  
  // Obsługa tworzenia nowego zbioru danych
  const handleCreateDataset = () => {
    const name = prompt('Podaj nazwę nowego zbioru danych:');
    
    if (name) {
      const newDataset = {
        id: `dataset${datasets.length + 1}`,
        name,
        count: 0
      };
      
      setDatasets([...datasets, newDataset]);
    }
  };
  
  // Obsługa przenoszenia obrazów do innego zbioru danych
  const handleMoveToDataset = (datasetId) => {
    if (selectedImages.length > 0) {
      const updatedImages = images.map(image => {
        if (selectedImages.includes(image.id)) {
          return {
            ...image,
            dataset: datasetId,
            datasetName: datasets.find(d => d.id === datasetId)?.name || 'Nieznany'
          };
        }
        return image;
      });
      
      setImages(updatedImages);
      setSelectedImages([]);
    }
  };
  
  // Formatowanie rozmiaru pliku
  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Zarządzanie obrazami
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Zbiory danych
            </Typography>
            
            <List>
              <ListItem 
                button 
                selected={selectedDataset === 'all'}
                onClick={() => setSelectedDataset('all')}
              >
                <ListItemText 
                  primary="Wszystkie obrazy" 
                  secondary={`${images.length} obrazów`} 
                />
              </ListItem>
              
              {datasets.map(dataset => (
                <ListItem 
                  key={dataset.id} 
                  button 
                  selected={selectedDataset === dataset.id}
                  onClick={() => setSelectedDataset(dataset.id)}
                >
                  <ListItemText 
                    primary={dataset.name} 
                    secondary={`${dataset.count} obrazów`} 
                  />
                </ListItem>
              ))}
            </List>
            
            <Button
              variant="outlined"
              fullWidth
              onClick={handleCreateDataset}
              sx={{ mt: 2 }}
            >
              Nowy zbiór danych
            </Button>
          </Paper>
          
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Filtry
            </Typography>
            
            <TextField
              fullWidth
              label="Szukaj obrazów"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Sortuj według</InputLabel>
              <Select
                value={sortBy}
                onChange={handleSortByChange}
                label="Sortuj według"
              >
                <MenuItem value="name">Nazwa</MenuItem>
                <MenuItem value="date">Data</MenuItem>
                <MenuItem value="size">Rozmiar</MenuItem>
                <MenuItem value="labels">Liczba etykiet</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              fullWidth
              onClick={handleSortOrderChange}
              startIcon={<FilterList />}
            >
              {sortOrder === 'asc' ? 'Rosnąco' : 'Malejąco'}
            </Button>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Statystyki
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Całkowita liczba obrazów"
                  secondary={images.length}
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Liczba zbiorów danych"
                  secondary={datasets.length}
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Obrazy z etykietami"
                  secondary={`${images.filter(img => img.labels > 0).length} (${Math.round(images.filter(img => img.labels > 0).length / images.length * 100)}%)`}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Button
                  variant="contained"
                  startIcon={<CloudUpload />}
                  sx={{ mr: 1 }}
                  onClick={() => setShowUploader(!showUploader)}
                >
                  {showUploader ? 'Ukryj uploader' : 'Prześlij obrazy'}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  sx={{ mr: 1 }}
                >
                  Zrób zdjęcie
                </Button>
              </Box>
              
              <Box>
                {selectedImages.length > 0 && (
                  <>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={handleDeleteSelected}
                      sx={{ mr: 1 }}
                    >
                      Usuń wybrane ({selectedImages.length})
                    </Button>
                    
                    <FormControl sx={{ minWidth: 150, mr: 1 }}>
                      <InputLabel>Przenieś do</InputLabel>
                      <Select
                        value=""
                        label="Przenieś do"
                        onChange={(e) => handleMoveToDataset(e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Wybierz zbiór
                        </MenuItem>
                        {datasets.map(dataset => (
                          <MenuItem key={dataset.id} value={dataset.id}>
                            {dataset.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => setIsLoading(false), 500);
                  }}
                >
                  Odśwież
                </Button>
              </Box>
            </Box>
            
            {showUploader && (
              <Box sx={{ mb: 3 }}>
                <ImageUploader onUpload={handleUpload} multiple={true} maxSize={10} />
              </Box>
            )}
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : sortedImages.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Nie znaleziono obrazów spełniających kryteria wyszukiwania.
              </Alert>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Znaleziono {sortedImages.length} obrazów
                  </Typography>
                  
                  <Button
                    variant="text"
                    onClick={handleSelectAll}
                  >
                    {selectedImages.length === sortedImages.length ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
                  </Button>
                </Box>
                
                <Grid container spacing={2}>
                  {sortedImages.map(image => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          position: 'relative',
                          border: selectedImages.includes(image.id) ? '2px solid #3f51b5' : '1px solid rgba(0, 0, 0, 0.12)',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                          }
                        }}
                        onClick={() => handleImageSelect(image.id)}
                      >
                        <Box 
                          sx={{ 
                            position: 'relative',
                            paddingTop: '56.25%', // 16:9 aspect ratio
                            backgroundColor: '#f5f5f5',
                            overflow: 'hidden'
                          }}
                        >
                          <img 
                            src={image.thumbnail} 
                            alt={image.name}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          
                          {image.labels > 0 && (
                            <Box 
                              sx={{ 
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                color: 'white',
                                borderRadius: 4,
                                px: 1,
                                py: 0.5,
                                fontSize: '0.75rem'
                              }}
                            >
                              {image.labels} etykiet
                            </Box>
                          )}
                        </Box>
                        
                        <CardContent sx={{ py: 1 }}>
                          <Typography variant="subtitle1" noWrap title={image.name}>
                            {image.name}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {image.datasetName}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(image.date)}
                            </Typography>
                            
                            <Typography variant="caption" color="text.secondary">
                              {formatFileSize(image.size)}
                            </Typography>
                          </Box>
                          
                          {image.classes.length > 0 && (
                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {image.classes.map((cls, index) => (
                                <Box 
                                  key={index}
                                  sx={{ 
                                    backgroundColor: '#e3f2fd',
                                    color: '#1976d2',
                                    borderRadius: 4,
                                    px: 1,
                                    py: 0.25,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  {cls}
                                </Box>
                              ))}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
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

export default ImagesPage;
