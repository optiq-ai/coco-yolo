import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Text, Circle } from 'react-konva';
import { Button, IconButton, Box, Typography, Slider, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ZoomIn, ZoomOut, Delete, Edit, Save, Undo, Redo, PanTool } from '@mui/icons-material';
import './ImageCanvas.css';

const ImageCanvas = ({ imageUrl, annotations = [], classes = [], onSave, readOnly = false }) => {
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [currentAnnotations, setCurrentAnnotations] = useState(annotations);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [mode, setMode] = useState('view'); // view, draw, edit, pan
  const [drawingRect, setDrawingRect] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(classes.length > 0 ? classes[0].id : null);
  const stageRef = useRef(null);
  const containerRef = useRef(null);

  // Load image
  useEffect(() => {
    if (!imageUrl) return;

    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      
      // Reset view when new image is loaded
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setSelectedAnnotation(null);
    };
  }, [imageUrl]);

  // Initialize history when annotations change from props
  useEffect(() => {
    setCurrentAnnotations(annotations);
    setHistory([annotations]);
    setHistoryIndex(0);
  }, [annotations]);

  // Save current state to history when annotations change
  const saveToHistory = (newAnnotations) => {
    // Remove future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newAnnotations);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Handle undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentAnnotations(history[historyIndex - 1]);
    }
  };

  // Handle redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentAnnotations(history[historyIndex + 1]);
    }
  };

  // Handle zoom in
  const handleZoomIn = () => {
    setScale(scale * 1.2);
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setScale(scale / 1.2);
  };

  // Handle wheel zoom
  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = scale;
    
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - position.x / oldScale,
      y: stage.getPointerPosition().y / oldScale - position.y / oldScale,
    };
    
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    setScale(newScale);
    setPosition({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    });
  };

  // Handle mouse down for drawing or selecting
  const handleMouseDown = (e) => {
    if (readOnly) return;
    
    // Prevent default behavior
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    const pos = stage.getPointerPosition();
    const x = (pos.x - position.x) / scale;
    const y = (pos.y - position.y) / scale;
    
    if (mode === 'draw') {
      setDrawingRect({
        x,
        y,
        width: 0,
        height: 0,
        class_id: selectedClassId
      });
    } else if (mode === 'pan') {
      stage.container().style.cursor = 'grabbing';
    }
  };

  // Handle mouse move for drawing or panning
  const handleMouseMove = (e) => {
    if (readOnly) return;
    
    const stage = stageRef.current;
    const pos = stage.getPointerPosition();
    
    if (mode === 'draw' && drawingRect) {
      const x = (pos.x - position.x) / scale;
      const y = (pos.y - position.y) / scale;
      
      setDrawingRect({
        ...drawingRect,
        width: x - drawingRect.x,
        height: y - drawingRect.y
      });
    } else if (mode === 'pan') {
      if (e.evt.buttons === 1) { // Left mouse button is pressed
        const dx = pos.x - stage.getPointerPosition().x;
        const dy = pos.y - stage.getPointerPosition().y;
        
        setPosition({
          x: position.x + dx,
          y: position.y + dy
        });
      }
    }
  };

  // Handle mouse up for finishing drawing
  const handleMouseUp = (e) => {
    if (readOnly) return;
    
    if (mode === 'draw' && drawingRect) {
      // Ensure width and height are positive
      const x = Math.min(drawingRect.x, drawingRect.x + drawingRect.width);
      const y = Math.min(drawingRect.y, drawingRect.y + drawingRect.height);
      const width = Math.abs(drawingRect.width);
      const height = Math.abs(drawingRect.height);
      
      // Only add if the rectangle has some size
      if (width > 5 && height > 5) {
        const newAnnotation = {
          id: Date.now(), // Temporary ID
          x,
          y,
          width,
          height,
          class_id: drawingRect.class_id
        };
        
        const newAnnotations = [...currentAnnotations, newAnnotation];
        setCurrentAnnotations(newAnnotations);
        saveToHistory(newAnnotations);
      }
      
      setDrawingRect(null);
    } else if (mode === 'pan') {
      const stage = stageRef.current;
      stage.container().style.cursor = 'grab';
    }
  };

  // Handle annotation selection
  const handleAnnotationClick = (annotation) => {
    if (readOnly || mode !== 'edit') return;
    
    setSelectedAnnotation(annotation);
  };

  // Handle annotation drag
  const handleAnnotationDrag = (e, annotation) => {
    if (readOnly) return;
    
    const { x, y } = e.target.position();
    
    const updatedAnnotations = currentAnnotations.map(a => {
      if (a.id === annotation.id) {
        return { ...a, x, y };
      }
      return a;
    });
    
    setCurrentAnnotations(updatedAnnotations);
  };

  // Handle annotation drag end
  const handleAnnotationDragEnd = (annotation) => {
    if (readOnly) return;
    
    saveToHistory(currentAnnotations);
  };

  // Handle annotation transform
  const handleAnnotationTransform = (e, annotation) => {
    if (readOnly) return;
    
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale to avoid accumulation
    node.scaleX(1);
    node.scaleY(1);
    
    const updatedAnnotations = currentAnnotations.map(a => {
      if (a.id === annotation.id) {
        return {
          ...a,
          x: node.x(),
          y: node.y(),
          width: node.width() * scaleX,
          height: node.height() * scaleY
        };
      }
      return a;
    });
    
    setCurrentAnnotations(updatedAnnotations);
  };

  // Handle annotation transform end
  const handleAnnotationTransformEnd = (annotation) => {
    if (readOnly) return;
    
    saveToHistory(currentAnnotations);
  };

  // Handle annotation deletion
  const handleDeleteAnnotation = () => {
    if (readOnly || !selectedAnnotation) return;
    
    const updatedAnnotations = currentAnnotations.filter(a => a.id !== selectedAnnotation.id);
    setCurrentAnnotations(updatedAnnotations);
    saveToHistory(updatedAnnotations);
    setSelectedAnnotation(null);
  };

  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave(currentAnnotations);
    }
  };

  // Get class color
  const getClassColor = (classId) => {
    const classObj = classes.find(c => c.id === classId);
    return classObj ? classObj.color || '#FF0000' : '#FF0000';
  };

  // Get class name
  const getClassName = (classId) => {
    const classObj = classes.find(c => c.id === classId);
    return classObj ? classObj.name : 'Unknown';
  };

  // Render annotations
  const renderAnnotations = () => {
    return currentAnnotations.map((annotation, index) => {
      const isSelected = selectedAnnotation && selectedAnnotation.id === annotation.id;
      const color = getClassColor(annotation.class_id);
      
      return (
        <React.Fragment key={annotation.id || index}>
          <Rect
            x={annotation.x}
            y={annotation.y}
            width={annotation.width}
            height={annotation.height}
            stroke={color}
            strokeWidth={2 / scale}
            dash={isSelected ? [5, 5] : []}
            fill={isSelected ? `${color}33` : 'transparent'}
            onClick={() => handleAnnotationClick(annotation)}
            onTap={() => handleAnnotationClick(annotation)}
            draggable={mode === 'edit'}
            onDragMove={(e) => handleAnnotationDrag(e, annotation)}
            onDragEnd={() => handleAnnotationDragEnd(annotation)}
            onTransform={(e) => handleAnnotationTransform(e, annotation)}
            onTransformEnd={() => handleAnnotationTransformEnd(annotation)}
          />
          <Text
            x={annotation.x}
            y={annotation.y - 20 / scale}
            text={getClassName(annotation.class_id)}
            fontSize={16 / scale}
            fill={color}
            padding={2}
            background="#00000088"
          />
        </React.Fragment>
      );
    });
  };

  // Render drawing rectangle
  const renderDrawingRect = () => {
    if (!drawingRect) return null;
    
    const color = getClassColor(drawingRect.class_id);
    
    return (
      <Rect
        x={drawingRect.x}
        y={drawingRect.y}
        width={drawingRect.width}
        height={drawingRect.height}
        stroke={color}
        strokeWidth={2 / scale}
        dash={[5, 5]}
        fill={`${color}33`}
      />
    );
  };

  return (
    <div className="image-canvas-container" ref={containerRef}>
      <div className="image-canvas-toolbar">
        <IconButton 
          onClick={() => setMode('view')} 
          color={mode === 'view' ? 'primary' : 'default'}
          title="View mode"
        >
          <ZoomIn />
        </IconButton>
        <IconButton 
          onClick={() => setMode('draw')} 
          color={mode === 'draw' ? 'primary' : 'default'}
          disabled={readOnly}
          title="Draw mode"
        >
          <Edit />
        </IconButton>
        <IconButton 
          onClick={() => setMode('edit')} 
          color={mode === 'edit' ? 'primary' : 'default'}
          disabled={readOnly}
          title="Edit mode"
        >
          <PanTool />
        </IconButton>
        <IconButton 
          onClick={() => setMode('pan')} 
          color={mode === 'pan' ? 'primary' : 'default'}
          title="Pan mode"
        >
          <PanTool />
        </IconButton>
        <IconButton onClick={handleZoomIn} title="Zoom in">
          <ZoomIn />
        </IconButton>
        <IconButton onClick={handleZoomOut} title="Zoom out">
          <ZoomOut />
        </IconButton>
        <IconButton 
          onClick={handleUndo} 
          disabled={historyIndex <= 0 || readOnly}
          title="Undo"
        >
          <Undo />
        </IconButton>
        <IconButton 
          onClick={handleRedo} 
          disabled={historyIndex >= history.length - 1 || readOnly}
          title="Redo"
        >
          <Redo />
        </IconButton>
        <IconButton 
          onClick={handleDeleteAnnotation} 
          disabled={!selectedAnnotation || readOnly}
          title="Delete selected annotation"
        >
          <Delete />
        </IconButton>
        <IconButton 
          onClick={handleSave} 
          disabled={readOnly}
          title="Save annotations"
        >
          <Save />
        </IconButton>
        
        {!readOnly && (
          <FormControl variant="outlined" size="small" style={{ minWidth: 120, marginLeft: 10 }}>
            <InputLabel>Class</InputLabel>
            <Select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              label="Class"
            >
              {classes.map(classObj => (
                <MenuItem key={classObj.id} value={classObj.id}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div 
                      style={{ 
                        width: 16, 
                        height: 16, 
                        backgroundColor: classObj.color || '#FF0000',
                        marginRight: 8
                      }} 
                    />
                    {classObj.name}
                  </div>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>
      
      <div className="image-canvas-stage-container">
        {image ? (
          <Stage
            ref={stageRef}
            width={containerRef.current ? containerRef.current.clientWidth : 800}
            height={containerRef.current ? containerRef.current.clientHeight - 60 : 600}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            draggable={mode === 'pan'}
            onDragMove={(e) => {
              setPosition({
                x: e.target.x(),
                y: e.target.y()
              });
            }}
          >
            <Layer>
              <KonvaImage
                image={image}
                x={position.x}
                y={position.y}
                width={image.width * scale}
                height={image.height * scale}
                scaleX={scale}
                scaleY={scale}
              />
            </Layer>
            <Layer>
              {renderAnnotations()}
              {renderDrawingRect()}
            </Layer>
          </Stage>
        ) : (
          <div className="image-canvas-placeholder">
            <Typography variant="h6">No image loaded</Typography>
          </div>
        )}
      </div>
      
      <div className="image-canvas-status-bar">
        <Typography variant="body2">
          {image ? `${image.width} x ${image.height}px` : 'No image'} | 
          Zoom: {Math.round(scale * 100)}% | 
          Annotations: {currentAnnotations.length}
        </Typography>
      </div>
    </div>
  );
};

export default ImageCanvas;
