import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, TextField, FormControl, InputLabel, Select, MenuItem, Slider, Switch, FormControlLabel, Tabs, Tab, Chip, IconButton, Divider } from '@mui/material';
import { Stage, Layer, Rect, Line, Image as KonvaImage, Circle } from 'react-konva';
import { Delete, Add, Save, Undo, Redo, ZoomIn, ZoomOut, PanTool, Visibility, VisibilityOff } from '@mui/icons-material';
import useImage from 'use-image';

// Komponent do wyświetlania obrazu w Konva
const ImageCanvas = ({ src, annotations, currentTool, onAnnotationChange }) => {
  const [image] = useImage(src);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const stageRef = useRef(null);

  // Obsługa zmiany skali (przybliżanie/oddalanie)
  const handleZoom = (factor) => {
    setScale(Math.max(0.1, Math.min(5, scale * factor)));
  };

  // Obsługa rozpoczęcia rysowania
  const handleMouseDown = (e) => {
    if (currentTool === 'pan') {
      setIsDragging(true);
      return;
    }

    const pos = e.target.getStage().getPointerPosition();
    const x = (pos.x - position.x) / scale;
    const y = (pos.y - position.y) / scale;

    if (currentTool === 'bbox') {
      setStartPoint({ x, y });
      setCurrentAnnotation({
        type: 'bbox',
        x,
        y,
        width: 0,
        height: 0,
        class: 'default',
      });
    } else if (currentTool === 'polygon') {
      if (!currentAnnotation) {
        setCurrentAnnotation({
          type: 'polygon',
          points: [x, y],
          class: 'default',
        });
      } else {
        // Dodaj nowy punkt do wielokąta
        const points = [...currentAnnotation.points, x, y];
        setCurrentAnnotation({
          ...currentAnnotation,
          points,
        });
      }
    } else if (currentTool === 'select') {
      // Sprawdź, czy kliknięto na istniejącą adnotację
      let found = false;
      for (let i = 0; i < annotations.length; i++) {
        const ann = annotations[i];
        if (ann.type === 'bbox') {
          if (
            x >= ann.x &&
            x <= ann.x + ann.width &&
            y >= ann.y &&
            y <= ann.y + ann.height
          ) {
            setSelectedAnnotation(i);
            found = true;
            break;
          }
        } else if (ann.type === 'polygon') {
          // Sprawdzenie, czy punkt jest wewnątrz wielokąta (uproszczone)
          // W rzeczywistej aplikacji należałoby użyć bardziej zaawansowanego algorytmu
          const points = ann.points;
          for (let j = 0; j < points.length; j += 2) {
            const px = points[j];
            const py = points[j + 1];
            if (Math.sqrt((x - px) ** 2 + (y - py) ** 2) < 5) {
              setSelectedAnnotation(i);
              found = true;
              break;
            }
          }
        }
      }
      if (!found) {
        setSelectedAnnotation(null);
      }
    }
  };

  // Obsługa ruchu myszy podczas rysowania
  const handleMouseMove = (e) => {
    if (isDragging && currentTool === 'pan') {
      const pos = e.target.getStage().getPointerPosition();
      setPosition({
        x: position.x + (pos.x - startPoint.x),
        y: position.y + (pos.y - startPoint.y),
      });
      return;
    }

    if (!currentAnnotation) return;

    const pos = e.target.getStage().getPointerPosition();
    const x = (pos.x - position.x) / scale;
    const y = (pos.y - position.y) / scale;

    if (currentTool === 'bbox') {
      setCurrentAnnotation({
        ...currentAnnotation,
        width: x - startPoint.x,
        height: y - startPoint.y,
      });
    }
  };

  // Obsługa zakończenia rysowania
  const handleMouseUp = () => {
    if (isDragging && currentTool === 'pan') {
      setIsDragging(false);
      return;
    }

    if (currentTool === 'bbox' && currentAnnotation) {
      // Normalizacja współrzędnych (obsługa ujemnych wymiarów)
      let { x, y, width, height } = currentAnnotation;
      if (width < 0) {
        x += width;
        width = Math.abs(width);
      }
      if (height < 0) {
        y += height;
        height = Math.abs(height);
      }

      // Dodaj nową adnotację tylko jeśli ma sensowny rozmiar
      if (width > 5 && height > 5) {
        const newAnnotation = { ...currentAnnotation, x, y, width, height };
        onAnnotationChange([...annotations, newAnnotation]);
      }
      setCurrentAnnotation(null);
    }
  };

  // Obsługa podwójnego kliknięcia (zakończenie wielokąta)
  const handleDblClick = () => {
    if (currentTool === 'polygon' && currentAnnotation) {
      // Zamknij wielokąt tylko jeśli ma co najmniej 3 punkty
      if (currentAnnotation.points.length >= 6) {
        onAnnotationChange([...annotations, currentAnnotation]);
      }
      setCurrentAnnotation(null);
    }
  };

  // Obsługa usunięcia zaznaczonej adnotacji
  const handleDeleteSelected = () => {
    if (selectedAnnotation !== null) {
      const newAnnotations = [...annotations];
      newAnnotations.splice(selectedAnnotation, 1);
      onAnnotationChange(newAnnotations);
      setSelectedAnnotation(null);
    }
  };

  // Efekt do obsługi klawisza Delete
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedAnnotation !== null) {
        handleDeleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedAnnotation]);

  return (
    <Box sx={{ position: 'relative', border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
      <Stage
        width={800}
        height={600}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleDblClick}
        style={{ backgroundColor: '#f5f5f5' }}
      >
        <Layer>
          {/* Obraz */}
          {image && (
            <KonvaImage
              image={image}
              x={position.x}
              y={position.y}
              scaleX={scale}
              scaleY={scale}
            />
          )}

          {/* Istniejące adnotacje */}
          {annotations.map((annotation, i) => {
            const isSelected = i === selectedAnnotation;
            if (annotation.type === 'bbox') {
              return (
                <Rect
                  key={i}
                  x={position.x + annotation.x * scale}
                  y={position.y + annotation.y * scale}
                  width={annotation.width * scale}
                  height={annotation.height * scale}
                  stroke={isSelected ? 'blue' : 'red'}
                  strokeWidth={isSelected ? 3 : 2}
                  dash={isSelected ? undefined : [5, 5]}
                  fill="transparent"
                />
              );
            } else if (annotation.type === 'polygon') {
              const scaledPoints = [];
              for (let j = 0; j < annotation.points.length; j += 2) {
                scaledPoints.push(position.x + annotation.points[j] * scale);
                scaledPoints.push(position.y + annotation.points[j + 1] * scale);
              }
              return (
                <Line
                  key={i}
                  points={scaledPoints}
                  stroke={isSelected ? 'blue' : 'green'}
                  strokeWidth={isSelected ? 3 : 2}
                  dash={isSelected ? undefined : [5, 5]}
                  closed={true}
                  fill="transparent"
                />
              );
            }
            return null;
          })}

          {/* Bieżąca adnotacja */}
          {currentAnnotation && currentAnnotation.type === 'bbox' && (
            <Rect
              x={position.x + currentAnnotation.x * scale}
              y={position.y + currentAnnotation.y * scale}
              width={currentAnnotation.width * scale}
              height={currentAnnotation.height * scale}
              stroke="blue"
              strokeWidth={2}
              dash={[5, 5]}
              fill="transparent"
            />
          )}

          {currentAnnotation && currentAnnotation.type === 'polygon' && (
            <>
              <Line
                points={currentAnnotation.points.flatMap((p, i) => [
                  position.x + p * scale,
                  position.y + currentAnnotation.points[i + 1] * scale,
                ]).filter((_, i) => i % 4 < 2)}
                stroke="blue"
                strokeWidth={2}
                dash={[5, 5]}
                fill="transparent"
              />
              {currentAnnotation.points.map((p, i) => {
                if (i % 2 === 0) {
                  return (
                    <Circle
                      key={i}
                      x={position.x + p * scale}
                      y={position.y + currentAnnotation.points[i + 1] * scale}
                      radius={4}
                      fill="blue"
                    />
                  );
                }
                return null;
              })}
            </>
          )}
        </Layer>
      </Stage>

      {/* Kontrolki pod canvasem */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, gap: 1 }}>
        <IconButton onClick={() => handleZoom(1.1)} title="Przybliż">
          <ZoomIn />
        </IconButton>
        <IconButton onClick={() => handleZoom(0.9)} title="Oddal">
          <ZoomOut />
        </IconButton>
        <IconButton onClick={handleDeleteSelected} disabled={selectedAnnotation === null} title="Usuń zaznaczone">
          <Delete />
        </IconButton>
      </Box>
    </Box>
  );
};

const EditorPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentTool, setCurrentTool] = useState('select');
  const [annotations, setAnnotations] = useState([]);
  const [classes, setClasses] = useState([
    { id: 1, name: 'Osoba', color: '#FF5252' },
    { id: 2, name: 'Samochód', color: '#4CAF50' },
    { id: 3, name: 'Rower', color: '#2196F3' },
  ]);
  const [selectedClass, setSelectedClass] = useState(1);
  const [currentImage, setCurrentImage] = useState('https://via.placeholder.com/800x600');
  const [showAnnotations, setShowAnnotations] = useState(true);

  // Przykładowe obrazy
  const images = [
    { id: 1, name: 'street_001.jpg', thumbnail: 'https://via.placeholder.com/150', dataset: 'Ulice' },
    { id: 2, name: 'street_002.jpg', thumbnail: 'https://via.placeholder.com/150', dataset: 'Ulice' },
    { id: 3, name: 'street_003.jpg', thumbnail: 'https://via.placeholder.com/150', dataset: 'Ulice' },
  ];

  // Obsługa zmiany zakładki
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Obsługa zmiany narzędzia
  const handleToolChange = (tool) => {
    setCurrentTool(tool);
  };

  // Obsługa zmiany klasy
  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  // Obsługa dodania nowej klasy
  const handleAddClass = () => {
    const newClass = {
      id: classes.length + 1,
      name: `Klasa ${classes.length + 1}`,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    };
    setClasses([...classes, newClass]);
  };

  // Obsługa zmiany obrazu
  const handleImageChange = (imageId) => {
    setCurrentImage(`https://via.placeholder.com/800x600?text=Image+${imageId}`);
    // W rzeczywistej aplikacji tutaj byłoby ładowanie adnotacji dla wybranego obrazu
    setAnnotations([]);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Edytor etykiet
      </Typography>

      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Edytor" />
          <Tab label="Klasy" />
          <Tab label="Ustawienia" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            // Zakładka edytora
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                {/* Główny obszar edycji */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Obraz: {images.find(img => img.id === 1)?.name}
                  </Typography>
                  <ImageCanvas 
                    src={currentImage}
                    annotations={showAnnotations ? annotations : []}
                    currentTool={currentTool}
                    onAnnotationChange={setAnnotations}
                  />
                </Box>

                {/* Narzędzia edycji */}
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Narzędzia
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item>
                      <Button
                        variant={currentTool === 'select' ? 'contained' : 'outlined'}
                        onClick={() => handleToolChange('select')}
                        startIcon={<PanTool />}
                      >
                        Zaznacz
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant={currentTool === 'bbox' ? 'contained' : 'outlined'}
                        onClick={() => handleToolChange('bbox')}
                        startIcon={<Add />}
                      >
                        Bounding Box
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant={currentTool === 'polygon' ? 'contained' : 'outlined'}
                        onClick={() => handleToolChange('polygon')}
                        startIcon={<Add />}
                      >
                        Wielokąt
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant={currentTool === 'pan' ? 'contained' : 'outlined'}
                        onClick={() => handleToolChange('pan')}
                        startIcon={<PanTool />}
                      >
                        Przesuń
                      </Button>
                    </Grid>
                    <Grid item>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={showAnnotations}
                            onChange={(e) => setShowAnnotations(e.target.checked)}
                          />
                        }
                        label="Pokaż adnotacje"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                {/* Panel boczny */}
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Klasa obiektu
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Klasa</InputLabel>
                    <Select
                      value={selectedClass}
                      label="Klasa"
                      onChange={handleClassChange}
                    >
                      {classes.map((cls) => (
                        <MenuItem key={cls.id} value={cls.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: cls.color,
                                mr: 1,
                              }}
                            />
                            {cls.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleAddClass}
                    fullWidth
                  >
                    Dodaj klasę
                  </Button>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Adnotacje
                  </Typography>
                  {annotations.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Brak adnotacji dla tego obrazu
                    </Typography>
                  ) : (
                    <Box>
                      {annotations.map((ann, i) => (
                        <Box
                          key={i}
                          sx={{
                            p: 1,
                            mb: 1,
                            border: '1px solid #eee',
                            borderRadius: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: ann.type === 'bbox' ? 'red' : 'green',
                                mr: 1,
                              }}
                            />
                            <Typography variant="body2">
                              {ann.type === 'bbox' ? 'Box' : 'Wielokąt'} #{i + 1}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newAnnotations = [...annotations];
                              newAnnotations.splice(i, 1);
                              setAnnotations(newAnnotations);
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>

                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Obrazy
                  </Typography>
                  <Grid container spacing={1}>
                    {images.map((img) => (
                      <Grid item xs={4} key={img.id}>
                        <Box
                          sx={{
                            border: currentImage.includes(`Image+${img.id}`) ? '2px solid blue' : '1px solid #ddd',
                            borderRadius: 1,
                            overflow: 'hidden',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleImageChange(img.id)}
                        >
                          <img
                            src={img.thumbnail}
                            alt={img.name}
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Undo />}
                  >
                    Cofnij
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Redo />}
                  >
                    Ponów
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Save />}
                  >
                    Zapisz adnotacje
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            // Zakładka klas
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Wyszukaj klasy"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    fullWidth
                    onClick={handleAddClass}
                  >
                    Dodaj klasę
                  </Button>
                </Grid>
              </Grid>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Lista klas
                </Typography>
                {classes.map((cls) => (
                  <Box
                    key={cls.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: '1px solid #eee',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: cls.color,
                          mr: 2,
                        }}
                      />
                      <Typography variant="body1">{cls.name}</Typography>
                    </Box>
                    <Box>
                      <IconButton size="small">
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Box>
          )}

          {activeTab === 2 && (
            // Zakładka ustawień
            <Box>
              <Typography variant="h6" gutterBottom>
                Ustawienia edytora
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Domyślne narzędzie
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Narzędzie</InputLabel>
                    <Select
                      value={currentTool}
                      label="Narzędzie"
                      onChange={(e) => setCurrentTool(e.target.value)}
                    >
                      <MenuItem value="select">Zaznaczanie</MenuItem>
                      <MenuItem value="bbox">Bounding Box</MenuItem>
                      <MenuItem value="polygon">Wielokąt</MenuItem>
                      <MenuItem value="pan">Przesuwanie</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Domyślna klasa
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Klasa</InputLabel>
                    <Select
                      value={selectedClass}
                      label="Klasa"
                      onChange={handleClassChange}
                    >
                      {classes.map((cls) => (
                        <MenuItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Opcje wyświetlania
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showAnnotations}
                        onChange={(e) => setShowAnnotations(e.target.checked)}
                      />
                    }
                    label="Pokaż adnotacje"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Format eksportu
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Format</InputLabel>
                    <Select
                      defaultValue="yolo"
                      label="Format"
                    >
                      <MenuItem value="yolo">YOLO</MenuItem>
                      <MenuItem value="coco">COCO JSON</MenuItem>
                      <MenuItem value="voc">Pascal VOC XML</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                >
                  Zapisz ustawienia
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default EditorPage;
