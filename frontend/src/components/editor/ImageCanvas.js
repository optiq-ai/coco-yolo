import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Line, Image as KonvaImage, Circle, Text } from 'react-konva';
import { Box, Typography, Paper, IconButton, ButtonGroup, Tooltip, Slider, FormControlLabel, Switch, Grid } from '@mui/material';
import { 
  Square, 
  Polyline, 
  PanTool, 
  ZoomIn, 
  ZoomOut, 
  Delete, 
  Undo, 
  Redo, 
  Save, 
  Visibility, 
  VisibilityOff,
  ColorLens
} from '@mui/icons-material';

const ImageCanvas = ({ 
  imageUrl, 
  annotations = [], 
  classes = [], 
  onAnnotationChange,
  selectedClass = 0
}) => {
  const [image, setImage] = useState(null);
  const [tool, setTool] = useState('select'); // 'select', 'bbox', 'polygon'
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const stageRef = useRef(null);
  const imageRef = useRef(null);
  
  // Załadowanie obrazu
  useEffect(() => {
    if (imageUrl) {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.src = imageUrl;
      img.onload = () => {
        setImage(img);
      };
    }
  }, [imageUrl]);
  
  // Zapisanie stanu do historii
  const saveToHistory = (newAnnotations) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newAnnotations]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  // Cofnięcie zmiany
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      onAnnotationChange(history[historyIndex - 1]);
    }
  };
  
  // Ponowienie zmiany
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      onAnnotationChange(history[historyIndex + 1]);
    }
  };
  
  // Obsługa zmiany narzędzia
  const handleToolChange = (newTool) => {
    setTool(newTool);
    setSelectedAnnotation(null);
    setCurrentAnnotation(null);
  };
  
  // Obsługa przybliżania/oddalania
  const handleZoom = (direction) => {
    const newScale = direction === 'in' ? scale * 1.2 : scale / 1.2;
    setScale(Math.min(Math.max(0.1, newScale), 5));
  };
  
  // Obsługa rozpoczęcia rysowania
  const handleMouseDown = (e) => {
    if (tool === 'select') {
      // Sprawdzenie, czy kliknięto na adnotację
      const clickedAnnotation = findAnnotationAtPoint(e.evt.layerX, e.evt.layerY);
      setSelectedAnnotation(clickedAnnotation);
      return;
    }
    
    if (tool === 'pan') {
      setIsDragging(true);
      return;
    }
    
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    const scaledPoint = {
      x: (point.x - position.x) / scale,
      y: (point.y - position.y) / scale
    };
    
    if (tool === 'bbox') {
      const newAnnotation = {
        type: 'bbox',
        x: scaledPoint.x,
        y: scaledPoint.y,
        width: 0,
        height: 0,
        class: selectedClass
      };
      setCurrentAnnotation(newAnnotation);
    } else if (tool === 'polygon') {
      if (!currentAnnotation) {
        const newAnnotation = {
          type: 'polygon',
          points: [scaledPoint.x, scaledPoint.y],
          class: selectedClass
        };
        setCurrentAnnotation(newAnnotation);
      } else {
        // Dodanie nowego punktu do wielokąta
        const points = [...currentAnnotation.points, scaledPoint.x, scaledPoint.y];
        setCurrentAnnotation({
          ...currentAnnotation,
          points
        });
      }
    }
  };
  
  // Obsługa ruchu myszą podczas rysowania
  const handleMouseMove = (e) => {
    if (!currentAnnotation || tool === 'select' || tool === 'polygon') {
      return;
    }
    
    if (tool === 'pan' && isDragging) {
      const stage = stageRef.current;
      const pointerPosition = stage.getPointerPosition();
      const newPosition = {
        x: position.x + (pointerPosition.x - stage.lastPointerPosition.x),
        y: position.y + (pointerPosition.y - stage.lastPointerPosition.y)
      };
      stage.lastPointerPosition = pointerPosition;
      setPosition(newPosition);
      return;
    }
    
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    const scaledPoint = {
      x: (point.x - position.x) / scale,
      y: (point.y - position.y) / scale
    };
    
    if (tool === 'bbox') {
      const newWidth = scaledPoint.x - currentAnnotation.x;
      const newHeight = scaledPoint.y - currentAnnotation.y;
      
      setCurrentAnnotation({
        ...currentAnnotation,
        width: newWidth,
        height: newHeight
      });
    }
  };
  
  // Obsługa zakończenia rysowania
  const handleMouseUp = () => {
    if (tool === 'pan') {
      setIsDragging(false);
      return;
    }
    
    if (tool === 'bbox' && currentAnnotation) {
      // Normalizacja współrzędnych (obsługa ujemnych wymiarów)
      const normalizedAnnotation = normalizeRectCoordinates(currentAnnotation);
      
      // Dodanie nowej adnotacji
      const newAnnotations = [...annotations, normalizedAnnotation];
      onAnnotationChange(newAnnotations);
      saveToHistory(newAnnotations);
      setCurrentAnnotation(null);
    }
  };
  
  // Obsługa podwójnego kliknięcia (zakończenie wielokąta)
  const handleDoubleClick = () => {
    if (tool === 'polygon' && currentAnnotation && currentAnnotation.points.length >= 6) {
      // Zamknięcie wielokąta i dodanie adnotacji
      const newAnnotations = [...annotations, currentAnnotation];
      onAnnotationChange(newAnnotations);
      saveToHistory(newAnnotations);
      setCurrentAnnotation(null);
    }
  };
  
  // Normalizacja współrzędnych prostokąta
  const normalizeRectCoordinates = (rect) => {
    const { x, y, width, height, class: classId } = rect;
    
    const normalizedRect = {
      type: 'bbox',
      class: classId,
      x: width < 0 ? x + width : x,
      y: height < 0 ? y + height : y,
      width: Math.abs(width),
      height: Math.abs(height)
    };
    
    return normalizedRect;
  };
  
  // Znalezienie adnotacji w punkcie
  const findAnnotationAtPoint = (x, y) => {
    const scaledX = (x - position.x) / scale;
    const scaledY = (y - position.y) / scale;
    
    // Sprawdzenie dla bounding boxów
    for (let i = annotations.length - 1; i >= 0; i--) {
      const annotation = annotations[i];
      
      if (annotation.type === 'bbox') {
        if (
          scaledX >= annotation.x &&
          scaledX <= annotation.x + annotation.width &&
          scaledY >= annotation.y &&
          scaledY <= annotation.y + annotation.height
        ) {
          return i;
        }
      } else if (annotation.type === 'polygon') {
        // Sprawdzenie dla wielokątów (uproszczone)
        if (isPointInPolygon(scaledX, scaledY, annotation.points)) {
          return i;
        }
      }
    }
    
    return null;
  };
  
  // Sprawdzenie, czy punkt jest wewnątrz wielokąta
  const isPointInPolygon = (x, y, points) => {
    let inside = false;
    for (let i = 0, j = points.length - 2; i < points.length; i += 2) {
      const xi = points[i];
      const yi = points[i + 1];
      const xj = points[j];
      const yj = points[j + 1];
      
      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
      
      j = i;
    }
    
    return inside;
  };
  
  // Usunięcie zaznaczonej adnotacji
  const handleDeleteAnnotation = () => {
    if (selectedAnnotation !== null) {
      const newAnnotations = [...annotations];
      newAnnotations.splice(selectedAnnotation, 1);
      onAnnotationChange(newAnnotations);
      saveToHistory(newAnnotations);
      setSelectedAnnotation(null);
    }
  };
  
  // Renderowanie kolorów klas
  const getClassColor = (classId) => {
    const colors = [
      '#FF0000', // czerwony
      '#00FF00', // zielony
      '#0000FF', // niebieski
      '#FFFF00', // żółty
      '#FF00FF', // magenta
      '#00FFFF', // cyjan
      '#FFA500', // pomarańczowy
      '#800080', // fioletowy
      '#008000', // ciemnozielony
      '#000080', // granatowy
    ];
    
    return colors[classId % colors.length];
  };
  
  // Renderowanie etykiety klasy
  const renderClassLabel = (annotation, index) => {
    if (!showLabels) return null;
    
    const className = classes[annotation.class]?.name || `Klasa ${annotation.class}`;
    const color = getClassColor(annotation.class);
    
    if (annotation.type === 'bbox') {
      return (
        <Text
          key={`label-${index}`}
          x={annotation.x}
          y={annotation.y - 20}
          text={className}
          fontSize={14}
          fill={color}
          stroke="black"
          strokeWidth={0.5}
        />
      );
    } else if (annotation.type === 'polygon') {
      // Znalezienie środka wielokąta
      let sumX = 0;
      let sumY = 0;
      for (let i = 0; i < annotation.points.length; i += 2) {
        sumX += annotation.points[i];
        sumY += annotation.points[i + 1];
      }
      const centerX = sumX / (annotation.points.length / 2);
      const centerY = sumY / (annotation.points.length / 2);
      
      return (
        <Text
          key={`label-${index}`}
          x={centerX}
          y={centerY}
          text={className}
          fontSize={14}
          fill={color}
          stroke="black"
          strokeWidth={0.5}
        />
      );
    }
    
    return null;
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Pasek narzędzi */}
      <Paper 
        elevation={3} 
        sx={{ 
          position: 'absolute', 
          top: 10, 
          left: 10, 
          zIndex: 10, 
          p: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1 
        }}
      >
        <ButtonGroup orientation="vertical">
          <Tooltip title="Wybierz/Przesuń">
            <IconButton 
              color={tool === 'select' ? 'primary' : 'default'} 
              onClick={() => handleToolChange('select')}
            >
              <PanTool />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rysuj prostokąt">
            <IconButton 
              color={tool === 'bbox' ? 'primary' : 'default'} 
              onClick={() => handleToolChange('bbox')}
            >
              <Square />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rysuj wielokąt">
            <IconButton 
              color={tool === 'polygon' ? 'primary' : 'default'} 
              onClick={() => handleToolChange('polygon')}
            >
              <Polyline />
            </IconButton>
          </Tooltip>
          <Tooltip title="Przesuń widok">
            <IconButton 
              color={tool === 'pan' ? 'primary' : 'default'} 
              onClick={() => handleToolChange('pan')}
            >
              <PanTool />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
        
        <Divider />
        
        <ButtonGroup orientation="vertical">
          <Tooltip title="Przybliż">
            <IconButton onClick={() => handleZoom('in')}>
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Oddal">
            <IconButton onClick={() => handleZoom('out')}>
              <ZoomOut />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
        
        <Divider />
        
        <ButtonGroup orientation="vertical">
          <Tooltip title="Usuń zaznaczoną adnotację">
            <IconButton 
              onClick={handleDeleteAnnotation}
              disabled={selectedAnnotation === null}
            >
              <Delete />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cofnij">
            <IconButton 
              onClick={handleUndo}
              disabled={historyIndex <= 0}
            >
              <Undo />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ponów">
            <IconButton 
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
        
        <Divider />
        
        <ButtonGroup orientation="vertical">
          <Tooltip title={showLabels ? "Ukryj etykiety" : "Pokaż etykiety"}>
            <IconButton onClick={() => setShowLabels(!showLabels)}>
              {showLabels ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Zapisz adnotacje">
            <IconButton>
              <Save />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
      </Paper>
      
      {/* Informacje o klasach */}
      <Paper 
        elevation={3} 
        sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          zIndex: 10, 
          p: 1, 
          maxWidth: 250 
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Klasy obiektów
        </Typography>
        
        <Grid container spacing={1}>
          {classes.map((cls, index) => (
            <Grid item xs={6} key={index}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 0.5, 
                  borderRadius: 1,
                  bgcolor: selectedClass === index ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.05)'
                  }
                }}
                onClick={() => setSelectedClass(index)}
              >
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    bgcolor: getClassColor(index),
                    borderRadius: '50%',
                    mr: 1
                  }} 
                />
                <Typography variant="body2" noWrap>
                  {cls.name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* Obszar rysowania */}
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleDoubleClick}
        style={{ background: '#f0f0f0' }}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
      >
        <Layer>
          {/* Obraz */}
          {image && (
            <KonvaImage
              ref={imageRef}
              image={image}
              x={0}
              y={0}
              width={image.width}
              height={image.height}
            />
          )}
          
          {/* Istniejące adnotacje */}
          {annotations.map((annotation, i) => {
            const isSelected = selectedAnnotation === i;
            const color = getClassColor(annotation.class);
            
            if (annotation.type === 'bbox') {
              return (
                <React.Fragment key={i}>
                  <Rect
                    x={annotation.x}
                    y={annotation.y}
                    width={annotation.width}
                    height={annotation.height}
                    stroke={color}
                    strokeWidth={isSelected ? 3 : 2}
                    dash={isSelected ? undefined : [5, 5]}
                    fill={isSelected ? `${color}33` : undefined}
                  />
                  {renderClassLabel(annotation, i)}
                </React.Fragment>
              );
            } else if (annotation.type === 'polygon') {
              return (
                <React.Fragment key={i}>
                  <Line
                    points={annotation.points}
                    stroke={color}
                    strokeWidth={isSelected ? 3 : 2}
                    dash={isSelected ? undefined : [5, 5]}
                    fill={isSelected ? `${color}33` : undefined}
                    closed
                  />
                  {/* Punkty wielokąta */}
                  {isSelected && annotation.points.map((_, j) => {
                    if (j % 2 === 0) {
                      return (
                        <Circle
                          key={`point-${j}`}
                          x={annotation.points[j]}
                          y={annotation.points[j + 1]}
                          radius={5}
                          fill={color}
                          stroke="white"
                          strokeWidth={1}
                        />
                      );
                    }
                    return null;
                  })}
                  {renderClassLabel(annotation, i)}
                </React.Fragment>
              );
            }
            return null;
          })}
          
          {/* Rysowanie bieżącej adnotacji */}
          {currentAnnotation && currentAnnotation.type === 'bbox' && (
            <Rect
              x={currentAnnotation.x}
              y={currentAnnotation.y}
              width={currentAnnotation.width}
              height={currentAnnotation.height}
              stroke={getClassColor(currentAnnotation.class)}
              strokeWidth={2}
              dash={[5, 5]}
            />
          )}
          
          {currentAnnotation && currentAnnotation.type === 'polygon' && (
            <React.Fragment>
              <Line
                points={currentAnnotation.points}
                stroke={getClassColor(currentAnnotation.class)}
                strokeWidth={2}
                dash={[5, 5]}
              />
              {/* Punkty wielokąta */}
              {currentAnnotation.points.map((_, i) => {
                if (i % 2 === 0) {
                  return (
                    <Circle
                      key={`current-point-${i}`}
                      x={currentAnnotation.points[i]}
                      y={currentAnnotation.points[i + 1]}
                      radius={5}
                      fill={getClassColor(currentAnnotation.class)}
                      stroke="white"
                      strokeWidth={1}
                    />
                  );
                }
                return null;
              })}
            </React.Fragment>
          )}
        </Layer>
      </Stage>
      
      {/* Informacje o skali */}
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: 10, 
          right: 10, 
          zIndex: 10, 
          bgcolor: 'rgba(255, 255, 255, 0.7)', 
          p: 0.5, 
          borderRadius: 1 
        }}
      >
        <Typography variant="body2">
          Skala: {Math.round(scale * 100)}%
        </Typography>
      </Box>
    </Box>
  );
};

// Komponent Divider
function Divider() {
  return (
    <Box sx={{ width: '100%', height: 1, bgcolor: 'rgba(0, 0, 0, 0.12)', my: 0.5 }} />
  );
}

export default ImageCanvas;
