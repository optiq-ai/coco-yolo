import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  Tooltip,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Slider
} from '@mui/material';
import { 
  Save, 
  Delete, 
  Add, 
  Edit, 
  Image, 
  Label, 
  Download, 
  Upload, 
  Refresh,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  PanTool,
  Crop,
  FormatColorFill,
  Check,
  Close
} from '@mui/icons-material';
import ImageCanvas from '../components/editor/ImageCanvas';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const EditorPage = () => {
  // Stan dla listy obrazów
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Stan dla adnotacji
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  
  // Stan dla narzędzi edytora
  const [currentTool, setCurrentTool] = useState('box'); // 'box', 'polygon', 'select', 'pan'
  const [zoom, setZoom] = useState(1);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Stan dla dialogów
  const [classDialog, setClassDialog] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassColor, setNewClassColor] = useState('#FF0000');
  const [editingClass, setEditingClass] = useState(null);
  
  // Stan dla powiadomień
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Referencje
  const canvasRef = useRef(null);
  
  // Przykładowe dane dla klas obiektów
  const sampleClasses = [
    { id: 1, name: 'Osoba', color: '#FF0000' },
    { id: 2, name: 'Samochód', color: '#00FF00' },
    { id: 3, name: 'Rower', color: '#0000FF' },
    { id: 4, name: 'Pies', color: '#FFFF00' },
    { id: 5, name: 'Kot', color: '#FF00FF' }
  ];
  
  // Przykładowe dane dla datasetów
  const sampleDatasets = [
    { id: 1, name: 'COCO Dataset', images_count: 120 },
    { id: 2, name: 'Custom Dataset 1', images_count: 45 },
    { id: 3, name: 'Custom Dataset 2', images_count: 78 }
  ];
  
  // Przykładowe dane dla obrazów
  const sampleImages = [
    { id: 1, name: 'image1.jpg', dataset_id: 1, width: 800, height: 600, url: 'https://via.placeholder.com/800x600?text=Image+1', annotations_count: 5 },
    { id: 2, name: 'image2.jpg', dataset_id: 1, width: 1024, height: 768, url: 'https://via.placeholder.com/1024x768?text=Image+2', annotations_count: 3 },
    { id: 3, name: 'image3.jpg', dataset_id: 2, width: 640, height: 480, url: 'https://via.placeholder.com/640x480?text=Image+3', annotations_count: 0 },
    { id: 4, name: 'image4.jpg', dataset_id: 2, width: 1280, height: 720, url: 'https://via.placeholder.com/1280x720?text=Image+4', annotations_count: 8 },
    { id: 5, name: 'image5.jpg', dataset_id: 3, width: 800, height: 600, url: 'https://via.placeholder.com/800x600?text=Image+5', annotations_count: 2 }
  ];
  
  // Przykładowe dane dla adnotacji
  const sampleAnnotations = [
    { id: 1, image_id: 1, class_id: 1, type: 'box', coordinates: { x: 100, y: 150, width: 200, height: 300 } },
    { id: 2, image_id: 1, class_id: 2, type: 'box', coordinates: { x: 400, y: 200, width: 150, height: 100 } },
    { id: 3, image_id: 1, class_id: 3, type: 'polygon', coordinates: [
      { x: 300, y: 300 }, { x: 350, y: 320 }, { x: 380, y: 350 }, { x: 330, y: 380 }, { x: 280, y: 350 }
    ] },
    { id: 4, image_id: 2, class_id: 1, type: 'box', coordinates: { x: 200, y: 300, width: 250, height: 350 } },
    { id: 5, image_id: 2, class_id: 4, type: 'box', coordinates: { x: 600, y: 400, width: 120, height: 80 } }
  ];
  
  // Pobieranie danych przy pierwszym renderowaniu
  useEffect(() => {
    fetchData();
  }, []);
  
  // Pobieranie danych z API
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Pobieranie datasetów
      const datasetsResponse = await axios.get(`${API_URL}/api/datasets`);
      if (datasetsResponse.data.success) {
        setDatasets(datasetsResponse.data.data);
      }
      
      // Pobieranie klas obiektów
      const classesResponse = await axios.get(`${API_URL}/api/classes`);
      if (classesResponse.data.success) {
        setClasses(classesResponse.data.data);
      }
      
      // Jeśli wybrany dataset, pobierz obrazy
      if (selectedDataset) {
        const imagesResponse = await axios.get(`${API_URL}/api/datasets/${selectedDataset}/images`);
        if (imagesResponse.data.success) {
          setImages(imagesResponse.data.data);
        }
      }
    } catch (error) {
      console.error('Błąd podczas pobierania danych:', error);
      
      // Symulacja danych w przypadku błędu
      setDatasets(sampleDatasets);
      setClasses(sampleClasses);
      
      if (selectedDataset) {
        setImages(sampleImages.filter(img => img.dataset_id === parseInt(selectedDataset)));
      }
      
      setSnackbar({
        open: true,
        message: 'Nie udało się pobrać danych. Używam danych przykładowych.',
        severity: 'warning'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Obsługa zmiany datasetu
  const handleDatasetChange = (event) => {
    const datasetId = event.target.value;
    setSelectedDataset(datasetId);
    setSelectedImage(null);
    setAnnotations([]);
    
    if (datasetId) {
      fetchImagesForDataset(datasetId);
    } else {
      setImages([]);
    }
  };
  
  // Pobieranie obrazów dla wybranego datasetu
  const fetchImagesForDataset = async (datasetId) => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${API_URL}/api/datasets/${datasetId}/images`);
      if (response.data.success) {
        setImages(response.data.data);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania obrazów:', error);
      
      // Symulacja danych w przypadku błędu
      setImages(sampleImages.filter(img => img.dataset_id === parseInt(datasetId)));
      
      setSnackbar({
        open: true,
        message: 'Nie udało się pobrać obrazów. Używam danych przykładowych.',
        severity: 'warning'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Obsługa wyboru obrazu
  const handleSelectImage = async (image) => {
    if (selectedImage && selectedImage.id === image.id) {
      return;
    }
    
    // Sprawdź, czy są niezapisane zmiany
    if (annotations.length > 0 && !window.confirm('Masz niezapisane zmiany. Czy na pewno chcesz zmienić obraz?')) {
      return;
    }
    
    setSelectedImage(image);
    setAnnotations([]);
    setSelectedAnnotation(null);
    setZoom(1);
    
    // Pobierz adnotacje dla wybranego obrazu
    fetchAnnotationsForImage(image.id);
  };
  
  // Pobieranie adnotacji dla wybranego obrazu
  const fetchAnnotationsForImage = async (imageId) => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${API_URL}/api/images/${imageId}/annotations`);
      if (response.data.success) {
        setAnnotations(response.data.data);
        
        // Dodaj do historii
        addToHistory(response.data.data);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania adnotacji:', error);
      
      // Symulacja danych w przypadku błędu
      const sampleAnnotationsForImage = sampleAnnotations.filter(ann => ann.image_id === imageId);
      setAnnotations(sampleAnnotationsForImage);
      
      // Dodaj do historii
      addToHistory(sampleAnnotationsForImage);
      
      setSnackbar({
        open: true,
        message: 'Nie udało się pobrać adnotacji. Używam danych przykładowych.',
        severity: 'warning'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Obsługa zmiany klasy
  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };
  
  // Obsługa zmiany narzędzia
  const handleToolChange = (tool) => {
    setCurrentTool(tool);
    
    // Jeśli zmieniono narzędzie, odznacz wybraną adnotację
    if (tool !== 'select') {
      setSelectedAnnotation(null);
    }
  };
  
  // Obsługa zmiany zakładki
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Obsługa zmiany powiększenia
  const handleZoomChange = (newZoom) => {
    setZoom(Math.max(0.1, Math.min(5, newZoom)));
  };
  
  // Obsługa dodawania adnotacji
  const handleAddAnnotation = (annotation) => {
    // Generuj unikalny ID dla nowej adnotacji
    const newId = annotations.length > 0 ? Math.max(...annotations.map(a => a.id)) + 1 : 1;
    
    const newAnnotation = {
      ...annotation,
      id: newId,
      image_id: selectedImage.id,
      class_id: parseInt(selectedClass)
    };
    
    const updatedAnnotations = [...annotations, newAnnotation];
    setAnnotations(updatedAnnotations);
    
    // Dodaj do historii
    addToHistory(updatedAnnotations);
    
    setSnackbar({
      open: true,
      message: 'Dodano nową adnotację.',
      severity: 'success'
    });
  };
  
  // Obsługa aktualizacji adnotacji
  const handleUpdateAnnotation = (updatedAnnotation) => {
    const updatedAnnotations = annotations.map(ann => 
      ann.id === updatedAnnotation.id ? updatedAnnotation : ann
    );
    
    setAnnotations(updatedAnnotations);
    
    // Dodaj do historii
    addToHistory(updatedAnnotations);
    
    setSnackbar({
      open: true,
      message: 'Zaktualizowano adnotację.',
      severity: 'success'
    });
  };
  
  // Obsługa usuwania adnotacji
  const handleDeleteAnnotation = (annotationId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę adnotację?')) {
      return;
    }
    
    const updatedAnnotations = annotations.filter(ann => ann.id !== annotationId);
    setAnnotations(updatedAnnotations);
    
    // Jeśli usunięto wybraną adnotację, odznacz ją
    if (selectedAnnotation && selectedAnnotation.id === annotationId) {
      setSelectedAnnotation(null);
    }
    
    // Dodaj do historii
    addToHistory(updatedAnnotations);
    
    setSnackbar({
      open: true,
      message: 'Usunięto adnotację.',
      severity: 'success'
    });
  };
  
  // Obsługa wyboru adnotacji
  const handleSelectAnnotation = (annotation) => {
    setSelectedAnnotation(annotation);
    setCurrentTool('select');
  };
  
  // Obsługa zapisywania adnotacji
  const handleSaveAnnotations = async () => {
    try {
      setLoading(true);
      
      // Przygotuj dane do zapisania
      const saveData = {
        image_id: selectedImage.id,
        annotations: annotations
      };
      
      // Wywołaj API zapisywania
      const response = await axios.post(`${API_URL}/api/images/${selectedImage.id}/annotations`, saveData);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Adnotacje zostały zapisane.',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania adnotacji:', error);
      
      // Symulacja sukcesu w przypadku błędu
      setTimeout(() => {
        setSnackbar({
          open: true,
          message: 'Adnotacje zostały zapisane (symulacja).',
          severity: 'success'
        });
      }, 1000);
    } finally {
      setLoading(false);
    }
  };
  
  // Obsługa eksportu adnotacji
  const handleExportAnnotations = async (format = 'coco') => {
    try {
      setLoading(true);
      
      // Przygotuj dane do eksportu
      const exportData = {
        image_id: selectedImage.id,
        annotations: annotations,
        format: format
      };
      
      // Wywołaj API eksportu
      const response = await axios.post(`${API_URL}/api/export-annotations`, exportData, {
        responseType: 'blob'
      });
      
      // Utwórz link do pobrania pliku
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `annotations_${selectedImage.name}.${format === 'coco' ? 'json' : format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSnackbar({
        open: true,
        message: `Adnotacje zostały wyeksportowane w formacie ${format.toUpperCase()}.`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Błąd podczas eksportu adnotacji:', error);
      
      // Symulacja eksportu w przypadku błędu
      setTimeout(() => {
        // Utwórz przykładowe dane w zależności od formatu
        let content = '';
        let mimeType = '';
        let extension = '';
        
        if (format === 'coco') {
          content = JSON.stringify({
            images: [
              {
                id: selectedImage.id,
                file_name: selectedImage.name,
                width: selectedImage.width,
                height: selectedImage.height
              }
            ],
            annotations: annotations.map(ann => ({
              id: ann.id,
              image_id: ann.image_id,
              category_id: ann.class_id,
              bbox: ann.type === 'box' ? [
                ann.coordinates.x,
                ann.coordinates.y,
                ann.coordinates.width,
                ann.coordinates.height
              ] : null,
              segmentation: ann.type === 'polygon' ? [
                ann.coordinates.flatMap(point => [point.x, point.y])
              ] : [],
              area: ann.type === 'box' ? 
                ann.coordinates.width * ann.coordinates.height : 
                0, // W rzeczywistości należałoby obliczyć pole wielokąta
              iscrowd: 0
            })),
            categories: classes.map(cls => ({
              id: cls.id,
              name: cls.name,
              supercategory: ''
            }))
          }, null, 2);
          mimeType = 'application/json';
          extension = 'json';
        } else if (format === 'yolo') {
          content = annotations.map(ann => {
            if (ann.type === 'box') {
              // Format YOLO: <class_id> <x_center> <y_center> <width> <height>
              // Gdzie wszystkie wartości są znormalizowane do zakresu [0, 1]
              const x_center = (ann.coordinates.x + ann.coordinates.width / 2) / selectedImage.width;
              const y_center = (ann.coordinates.y + ann.coordinates.height / 2) / selectedImage.height;
              const width = ann.coordinates.width / selectedImage.width;
              const height = ann.coordinates.height / selectedImage.height;
              
              return `${ann.class_id} ${x_center.toFixed(6)} ${y_center.toFixed(6)} ${width.toFixed(6)} ${height.toFixed(6)}`;
            }
            return '';
          }).filter(line => line !== '').join('\n');
          mimeType = 'text/plain';
          extension = 'txt';
        } else if (format === 'voc') {
          content = `<annotation>
  <folder>images</folder>
  <filename>${selectedImage.name}</filename>
  <size>
    <width>${selectedImage.width}</width>
    <height>${selectedImage.height}</height>
    <depth>3</depth>
  </size>
  ${annotations.map(ann => {
    if (ann.type === 'box') {
      const className = classes.find(c => c.id === ann.class_id)?.name || `Class ${ann.class_id}`;
      return `  <object>
    <name>${className}</name>
    <pose>Unspecified</pose>
    <truncated>0</truncated>
    <difficult>0</difficult>
    <bndbox>
      <xmin>${ann.coordinates.x}</xmin>
      <ymin>${ann.coordinates.y}</ymin>
      <xmax>${ann.coordinates.x + ann.coordinates.width}</xmax>
      <ymax>${ann.coordinates.y + ann.coordinates.height}</ymax>
    </bndbox>
  </object>`;
    }
    return '';
  }).join('\n')}
</annotation>`;
          mimeType = 'application/xml';
          extension = 'xml';
        }
        
        // Utwórz link do pobrania pliku
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `annotations_${selectedImage.name}.${extension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        setSnackbar({
          open: true,
          message: `Adnotacje zostały wyeksportowane w formacie ${format.toUpperCase()} (symulacja).`,
          severity: 'success'
        });
      }, 1000);
    } finally {
      setLoading(false);
    }
  };
  
  // Obsługa cofania zmian
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setAnnotations([...canvasHistory[newIndex]]);
    }
  };
  
  // Obsługa ponawiania zmian
  const handleRedo = () => {
    if (historyIndex < canvasHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setAnnotations([...canvasHistory[newIndex]]);
    }
  };
  
  // Dodawanie stanu do historii
  const addToHistory = (newState) => {
    // Jeśli jesteśmy w środku historii, usuń wszystkie stany po bieżącym indeksie
    const newHistory = canvasHistory.slice(0, historyIndex + 1);
    
    // Dodaj nowy stan
    newHistory.push([...newState]);
    
    // Ogranicz historię do 20 stanów
    if (newHistory.length > 20) {
      newHistory.shift();
    }
    
    setCanvasHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  // Obsługa otwierania dialogu klasy
  const handleOpenClassDialog = (classObj = null) => {
    if (classObj) {
      setEditingClass(classObj);
      setNewClassName(classObj.name);
      setNewClassColor(classObj.color);
    } else {
      setEditingClass(null);
      setNewClassName('');
      setNewClassColor('#FF0000');
    }
    setClassDialog(true);
  };
  
  // Obsługa zamykania dialogu klasy
  const handleCloseClassDialog = () => {
    setClassDialog(false);
  };
  
  // Obsługa zapisywania klasy
  const handleSaveClass = async () => {
    if (!newClassName) {
      setSnackbar({
        open: true,
        message: 'Nazwa klasy jest wymagana.',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const classData = {
        name: newClassName,
        color: newClassColor
      };
      
      if (editingClass) {
        // Aktualizacja istniejącej klasy
        const response = await axios.put(`${API_URL}/api/classes/${editingClass.id}`, classData);
        
        if (response.data.success) {
          setClasses(classes.map(c => 
            c.id === editingClass.id ? { ...c, ...classData } : c
          ));
          
          setSnackbar({
            open: true,
            message: 'Klasa została zaktualizowana.',
            severity: 'success'
          });
        }
      } else {
        // Tworzenie nowej klasy
        const response = await axios.post(`${API_URL}/api/classes`, classData);
        
        if (response.data.success) {
          const newClass = {
            id: response.data.data.id,
            ...classData
          };
          
          setClasses([...classes, newClass]);
          
          setSnackbar({
            open: true,
            message: 'Nowa klasa została utworzona.',
            severity: 'success'
          });
        }
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania klasy:', error);
      
      // Symulacja sukcesu w przypadku błędu
      if (editingClass) {
        setClasses(classes.map(c => 
          c.id === editingClass.id ? { ...c, name: newClassName, color: newClassColor } : c
        ));
        
        setSnackbar({
          open: true,
          message: 'Klasa została zaktualizowana (symulacja).',
          severity: 'success'
        });
      } else {
        const newClass = {
          id: classes.length > 0 ? Math.max(...classes.map(c => c.id)) + 1 : 1,
          name: newClassName,
          color: newClassColor
        };
        
        setClasses([...classes, newClass]);
        
        setSnackbar({
          open: true,
          message: 'Nowa klasa została utworzona (symulacja).',
          severity: 'success'
        });
      }
    } finally {
      setLoading(false);
      handleCloseClassDialog();
    }
  };
  
  // Obsługa usuwania klasy
  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę klasę? Wszystkie adnotacje z tą klasą również zostaną usunięte.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.delete(`${API_URL}/api/classes/${classId}`);
      
      if (response.data.success) {
        // Usuń klasę z listy
        setClasses(classes.filter(c => c.id !== classId));
        
        // Usuń adnotacje z tą klasą
        const updatedAnnotations = annotations.filter(ann => ann.class_id !== classId);
        setAnnotations(updatedAnnotations);
        
        // Dodaj do historii
        addToHistory(updatedAnnotations);
        
        // Jeśli usunięto wybraną klasę, odznacz ją
        if (parseInt(selectedClass) === classId) {
          setSelectedClass('');
        }
        
        setSnackbar({
          open: true,
          message: 'Klasa została usunięta.',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Błąd podczas usuwania klasy:', error);
      
      // Symulacja sukcesu w przypadku błędu
      setClasses(classes.filter(c => c.id !== classId));
      
      // Usuń adnotacje z tą klasą
      const updatedAnnotations = annotations.filter(ann => ann.class_id !== classId);
      setAnnotations(updatedAnnotations);
      
      // Dodaj do historii
      addToHistory(updatedAnnotations);
      
      // Jeśli usunięto wybraną klasę, odznacz ją
      if (parseInt(selectedClass) === classId) {
        setSelectedClass('');
      }
      
      setSnackbar({
        open: true,
        message: 'Klasa została usunięta (symulacja).',
        severity: 'success'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Obsługa zamknięcia snackbara
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Renderowanie listy obrazów
  const renderImagesList = () => {
    if (images.length === 0) {
      return (
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Brak obrazów w wybranym datasecie.
          </Typography>
        </Paper>
      );
    }
    
    return (
      <List sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
        {images.map((image) => (
          <ListItem 
            key={image.id} 
            button 
            selected={selectedImage && selectedImage.id === image.id}
            onClick={() => handleSelectImage(image)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box 
                component="img" 
                src={image.url} 
                alt={image.name}
                sx={{ 
                  width: 60, 
                  height: 60, 
                  objectFit: 'cover', 
                  mr: 2,
                  borderRadius: 1
                }}
              />
              <ListItemText 
                primary={image.name} 
                secondary={`${image.width}x${image.height} | ${image.annotations_count} adnotacji`}
              />
            </Box>
          </ListItem>
        ))}
      </List>
    );
  };
  
  // Renderowanie listy adnotacji
  const renderAnnotationsList = () => {
    if (annotations.length === 0) {
      return (
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Brak adnotacji dla tego obrazu.
          </Typography>
        </Paper>
      );
    }
    
    return (
      <List sx={{ maxHeight: 'calc(100vh - 500px)', overflow: 'auto' }}>
        {annotations.map((annotation) => {
          const annotationClass = classes.find(c => c.id === annotation.class_id);
          
          return (
            <ListItem 
              key={annotation.id} 
              button 
              selected={selectedAnnotation && selectedAnnotation.id === annotation.id}
              onClick={() => handleSelectAnnotation(annotation)}
            >
              <Box 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  backgroundColor: annotationClass ? annotationClass.color : '#CCCCCC',
                  borderRadius: '50%',
                  mr: 2
                }}
              />
              <ListItemText 
                primary={annotationClass ? annotationClass.name : `Klasa ${annotation.class_id}`} 
                secondary={`Typ: ${annotation.type === 'box' ? 'Prostokąt' : 'Wielokąt'}`}
              />
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => handleDeleteAnnotation(annotation.id)}
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    );
  };
  
  // Renderowanie listy klas
  const renderClassesList = () => {
    if (classes.length === 0) {
      return (
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Brak zdefiniowanych klas.
          </Typography>
        </Paper>
      );
    }
    
    return (
      <List sx={{ maxHeight: 'calc(100vh - 400px)', overflow: 'auto' }}>
        {classes.map((classObj) => (
          <ListItem 
            key={classObj.id} 
            button 
            selected={selectedClass === classObj.id.toString()}
            onClick={() => setSelectedClass(classObj.id.toString())}
          >
            <Box 
              sx={{ 
                width: 16, 
                height: 16, 
                backgroundColor: classObj.color,
                borderRadius: '50%',
                mr: 2
              }}
            />
            <ListItemText primary={classObj.name} />
            <ListItemSecondaryAction>
              <IconButton 
                edge="end" 
                aria-label="edit"
                onClick={() => handleOpenClassDialog(classObj)}
                sx={{ mr: 1 }}
              >
                <Edit />
              </IconButton>
              <IconButton 
                edge="end" 
                aria-label="delete"
                onClick={() => handleDeleteClass(classObj.id)}
              >
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Edytor adnotacji
      </Typography>
      
      <Grid container spacing={2}>
        {/* Panel boczny */}
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Dataset
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Wybierz dataset</InputLabel>
              <Select
                value={selectedDataset}
                onChange={handleDatasetChange}
                label="Wybierz dataset"
                disabled={loading}
              >
                <MenuItem value="">
                  <em>Wybierz dataset</em>
                </MenuItem>
                {datasets.map((dataset) => (
                  <MenuItem key={dataset.id} value={dataset.id.toString()}>
                    {dataset.name} ({dataset.images_count} obrazów)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Obrazy
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              renderImagesList()
            )}
          </Paper>
        </Grid>
        
        {/* Główny obszar edycji */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            {selectedImage ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {selectedImage.name}
                  </Typography>
                  
                  <Box>
                    <Tooltip title="Powiększ">
                      <IconButton 
                        onClick={() => handleZoomChange(zoom + 0.1)}
                        disabled={zoom >= 5}
                      >
                        <ZoomIn />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Pomniejsz">
                      <IconButton 
                        onClick={() => handleZoomChange(zoom - 0.1)}
                        disabled={zoom <= 0.1}
                      >
                        <ZoomOut />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cofnij">
                      <span>
                        <IconButton 
                          onClick={handleUndo}
                          disabled={historyIndex <= 0}
                        >
                          <Undo />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Ponów">
                      <span>
                        <IconButton 
                          onClick={handleRedo}
                          disabled={historyIndex >= canvasHistory.length - 1}
                        >
                          <Redo />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <Tooltip title="Prostokąt">
                    <Button
                      variant={currentTool === 'box' ? 'contained' : 'outlined'}
                      onClick={() => handleToolChange('box')}
                      sx={{ mr: 1 }}
                      disabled={!selectedClass}
                    >
                      <Crop sx={{ mr: 1 }} />
                      Prostokąt
                    </Button>
                  </Tooltip>
                  <Tooltip title="Wielokąt">
                    <Button
                      variant={currentTool === 'polygon' ? 'contained' : 'outlined'}
                      onClick={() => handleToolChange('polygon')}
                      sx={{ mr: 1 }}
                      disabled={!selectedClass}
                    >
                      <FormatColorFill sx={{ mr: 1 }} />
                      Wielokąt
                    </Button>
                  </Tooltip>
                  <Tooltip title="Wybierz">
                    <Button
                      variant={currentTool === 'select' ? 'contained' : 'outlined'}
                      onClick={() => handleToolChange('select')}
                      sx={{ mr: 1 }}
                    >
                      <PanTool sx={{ mr: 1 }} />
                      Wybierz
                    </Button>
                  </Tooltip>
                </Box>
                
                <Box 
                  sx={{ 
                    border: '1px solid #ccc', 
                    borderRadius: 1,
                    height: 'calc(100vh - 350px)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <ImageCanvas
                    ref={canvasRef}
                    image={selectedImage}
                    annotations={annotations}
                    selectedAnnotation={selectedAnnotation}
                    selectedClass={selectedClass ? parseInt(selectedClass) : null}
                    classes={classes}
                    tool={currentTool}
                    zoom={zoom}
                    onAddAnnotation={handleAddAnnotation}
                    onUpdateAnnotation={handleUpdateAnnotation}
                    onSelectAnnotation={handleSelectAnnotation}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={() => handleExportAnnotations('coco')}
                    sx={{ mr: 1 }}
                    disabled={loading || annotations.length === 0}
                  >
                    Eksportuj
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Save />}
                    onClick={handleSaveAnnotations}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Zapisz adnotacje'}
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Image sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Wybierz obraz do edycji
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Wybierz dataset i obraz z panelu bocznego, aby rozpocząć edycję adnotacji.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Panel właściwości */}
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant="fullWidth"
              sx={{ mb: 2 }}
            >
              <Tab label="Adnotacje" />
              <Tab label="Klasy" />
            </Tabs>
            
            {activeTab === 0 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Adnotacje
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {annotations.length} elementów
                  </Typography>
                </Box>
                
                {selectedImage ? (
                  renderAnnotationsList()
                ) : (
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      Wybierz obraz, aby zobaczyć adnotacje.
                    </Typography>
                  </Paper>
                )}
                
                {selectedAnnotation && (
                  <Card sx={{ mt: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Szczegóły adnotacji
                      </Typography>
                      
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Klasa</InputLabel>
                        <Select
                          value={selectedAnnotation.class_id.toString()}
                          onChange={(e) => {
                            const updatedAnnotation = {
                              ...selectedAnnotation,
                              class_id: parseInt(e.target.value)
                            };
                            handleUpdateAnnotation(updatedAnnotation);
                          }}
                          label="Klasa"
                          disabled={loading}
                        >
                          {classes.map((classObj) => (
                            <MenuItem key={classObj.id} value={classObj.id.toString()}>
                              {classObj.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <Typography variant="body2" gutterBottom>
                        Typ: {selectedAnnotation.type === 'box' ? 'Prostokąt' : 'Wielokąt'}
                      </Typography>
                      
                      {selectedAnnotation.type === 'box' && (
                        <>
                          <Typography variant="body2" gutterBottom>
                            Pozycja: ({selectedAnnotation.coordinates.x}, {selectedAnnotation.coordinates.y})
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            Wymiary: {selectedAnnotation.coordinates.width} x {selectedAnnotation.coordinates.height}
                          </Typography>
                        </>
                      )}
                      
                      {selectedAnnotation.type === 'polygon' && (
                        <Typography variant="body2" gutterBottom>
                          Punkty: {selectedAnnotation.coordinates.length}
                        </Typography>
                      )}
                      
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteAnnotation(selectedAnnotation.id)}
                        fullWidth
                        sx={{ mt: 1 }}
                        disabled={loading}
                      >
                        Usuń adnotację
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
            
            {activeTab === 1 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Klasy obiektów
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => handleOpenClassDialog()}
                    disabled={loading}
                  >
                    Dodaj
                  </Button>
                </Box>
                
                {renderClassesList()}
                
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Aktywna klasa</InputLabel>
                  <Select
                    value={selectedClass}
                    onChange={handleClassChange}
                    label="Aktywna klasa"
                    disabled={loading || classes.length === 0}
                  >
                    <MenuItem value="">
                      <em>Wybierz klasę</em>
                    </MenuItem>
                    {classes.map((classObj) => (
                      <MenuItem key={classObj.id} value={classObj.id.toString()}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            sx={{ 
                              width: 16, 
                              height: 16, 
                              backgroundColor: classObj.color,
                              borderRadius: '50%',
                              mr: 1
                            }}
                          />
                          {classObj.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Wybierz klasę przed dodaniem nowych adnotacji.
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Dialog dodawania/edycji klasy */}
      <Dialog open={classDialog} onClose={handleCloseClassDialog}>
        <DialogTitle>
          {editingClass ? 'Edytuj klasę' : 'Dodaj nową klasę'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nazwa klasy"
            fullWidth
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Kolor
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  backgroundColor: newClassColor,
                  borderRadius: '50%',
                  mr: 2,
                  border: '1px solid #ccc'
                }}
              />
              <TextField
                value={newClassColor}
                onChange={(e) => setNewClassColor(e.target.value)}
                size="small"
                sx={{ width: 120 }}
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#000080'].map((color) => (
              <Box 
                key={color}
                sx={{ 
                  width: 24, 
                  height: 24, 
                  backgroundColor: color,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: newClassColor === color ? '2px solid #000' : '1px solid #ccc'
                }}
                onClick={() => setNewClassColor(color)}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClassDialog} disabled={loading}>Anuluj</Button>
          <Button 
            onClick={handleSaveClass} 
            variant="contained"
            disabled={loading || !newClassName}
          >
            {loading ? <CircularProgress size={24} /> : editingClass ? 'Aktualizuj' : 'Dodaj'}
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

export default EditorPage;
