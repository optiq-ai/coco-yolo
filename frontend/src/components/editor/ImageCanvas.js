import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

// Komponent płótna do edycji adnotacji obrazów
const ImageCanvas = forwardRef(({
  image,
  annotations,
  selectedAnnotation,
  selectedClass,
  classes,
  tool,
  zoom,
  onAddAnnotation,
  onUpdateAnnotation,
  onSelectAnnotation
}, ref) => {
  // Referencje do elementów canvas
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  
  // Stan dla rysowania
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  
  // Eksponowanie metod dla komponentu nadrzędnego
  useImperativeHandle(ref, () => ({
    // Metoda do resetowania stanu płótna
    reset: () => {
      setIsDrawing(false);
      setPolygonPoints([]);
      setIsDragging(false);
      setResizeHandle(null);
      redrawCanvas();
    },
    // Metoda do eksportu płótna jako obrazu
    exportImage: () => {
      return canvasRef.current.toDataURL('image/png');
    }
  }));
  
  // Efekt inicjalizujący płótno po załadowaniu obrazu
  useEffect(() => {
    if (!image) return;
    
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const ctx = canvas.getContext('2d');
    
    // Resetuj stan
    setIsDrawing(false);
    setPolygonPoints([]);
    setIsDragging(false);
    setResizeHandle(null);
    
    // Załaduj obraz
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = image.url;
    
    img.onload = () => {
      // Ustaw rozmiar płótna
      const containerWidth = canvas.parentElement.clientWidth;
      const containerHeight = canvas.parentElement.clientHeight;
      
      // Oblicz skalę, aby obraz zmieścił się w kontenerze
      const scaleX = containerWidth / img.width;
      const scaleY = containerHeight / img.height;
      const scale = Math.min(scaleX, scaleY);
      
      // Oblicz rozmiar obrazu po skalowaniu
      const scaledWidth = img.width * scale * zoom;
      const scaledHeight = img.height * scale * zoom;
      
      // Ustaw rozmiar płótna
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      overlay.width = containerWidth;
      overlay.height = containerHeight;
      
      // Oblicz przesunięcie, aby obraz był wyśrodkowany
      const offsetX = (containerWidth - scaledWidth) / 2;
      const offsetY = (containerHeight - scaledHeight) / 2;
      
      // Zapisz offset i rozmiar obrazu
      setCanvasOffset({ x: offsetX, y: offsetY });
      setImageSize({ width: scaledWidth, height: scaledHeight });
      setViewportSize({ width: containerWidth, height: containerHeight });
      
      // Wyczyść płótno
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Narysuj obraz
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      
      setImageLoaded(true);
    };
  }, [image, zoom]);
  
  // Efekt przerysowujący płótno po zmianie adnotacji lub narzędzia
  useEffect(() => {
    if (imageLoaded) {
      redrawCanvas();
    }
  }, [annotations, selectedAnnotation, tool, imageLoaded, selectedClass]);
  
  // Funkcja do przerysowania płótna
  const redrawCanvas = () => {
    if (!canvasRef.current || !overlayRef.current || !image) return;
    
    const overlay = overlayRef.current;
    const ctx = overlay.getContext('2d');
    
    // Wyczyść płótno nakładki
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    
    // Narysuj wszystkie adnotacje
    drawAnnotations(ctx);
    
    // Narysuj aktualnie rysowany kształt
    if (isDrawing) {
      if (tool === 'box') {
        drawBox(ctx, startPoint, currentPoint, getClassColor(selectedClass), 2);
      } else if (tool === 'polygon' && polygonPoints.length > 0) {
        drawPolygon(ctx, polygonPoints, getClassColor(selectedClass), 2);
        
        // Narysuj linię od ostatniego punktu do kursora
        ctx.beginPath();
        ctx.moveTo(polygonPoints[polygonPoints.length - 1].x, polygonPoints[polygonPoints.length - 1].y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.strokeStyle = getClassColor(selectedClass);
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  };
  
  // Funkcja do rysowania wszystkich adnotacji
  const drawAnnotations = (ctx) => {
    if (!annotations || annotations.length === 0) return;
    
    annotations.forEach(annotation => {
      const isSelected = selectedAnnotation && selectedAnnotation.id === annotation.id;
      const color = getClassColor(annotation.class_id);
      
      if (annotation.type === 'box') {
        const { x, y, width, height } = transformCoordinates(annotation.coordinates);
        drawBox(ctx, { x, y }, { x: x + width, y: y + height }, color, isSelected ? 3 : 2);
        
        // Jeśli adnotacja jest wybrana, narysuj uchwyty do zmiany rozmiaru
        if (isSelected) {
          drawResizeHandles(ctx, { x, y, width, height });
        }
      } else if (annotation.type === 'polygon') {
        const points = annotation.coordinates.map(point => transformCoordinates(point));
        drawPolygon(ctx, points, color, isSelected ? 3 : 2);
        
        // Jeśli adnotacja jest wybrana, narysuj punkty wielokąta
        if (isSelected) {
          points.forEach(point => {
            drawPoint(ctx, point, color);
          });
        }
      }
    });
  };
  
  // Funkcja do rysowania prostokąta
  const drawBox = (ctx, start, end, color, lineWidth = 2) => {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // Narysuj półprzezroczysty wypełniony prostokąt
    ctx.fillStyle = `${color}33`; // 20% przezroczystości
    ctx.fill();
  };
  
  // Funkcja do rysowania wielokąta
  const drawPolygon = (ctx, points, color, lineWidth = 2) => {
    if (points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    // Zamknij wielokąt, jeśli ma więcej niż 2 punkty
    if (points.length > 2) {
      ctx.closePath();
    }
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // Narysuj półprzezroczysty wypełniony wielokąt
    if (points.length > 2) {
      ctx.fillStyle = `${color}33`; // 20% przezroczystości
      ctx.fill();
    }
  };
  
  // Funkcja do rysowania punktu
  const drawPoint = (ctx, point, color, radius = 5) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  
  // Funkcja do rysowania uchwytów do zmiany rozmiaru
  const drawResizeHandles = (ctx, rect) => {
    const { x, y, width, height } = rect;
    const handleSize = 8;
    
    // Narysuj uchwyty w rogach
    const handles = [
      { x: x, y: y, cursor: 'nwse-resize', position: 'tl' },
      { x: x + width, y: y, cursor: 'nesw-resize', position: 'tr' },
      { x: x, y: y + height, cursor: 'nesw-resize', position: 'bl' },
      { x: x + width, y: y + height, cursor: 'nwse-resize', position: 'br' }
    ];
    
    // Narysuj uchwyty na środkach boków
    handles.push(
      { x: x + width / 2, y: y, cursor: 'ns-resize', position: 'tc' },
      { x: x + width, y: y + height / 2, cursor: 'ew-resize', position: 'rc' },
      { x: x + width / 2, y: y + height, cursor: 'ns-resize', position: 'bc' },
      { x: x, y: y + height / 2, cursor: 'ew-resize', position: 'lc' }
    );
    
    // Narysuj wszystkie uchwyty
    handles.forEach(handle => {
      ctx.beginPath();
      ctx.rect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  };
  
  // Funkcja do transformacji współrzędnych z oryginalnego obrazu na płótno
  const transformCoordinates = (coords) => {
    if (!coords) return { x: 0, y: 0 };
    
    if (coords.x !== undefined && coords.y !== undefined) {
      // Dla pojedynczego punktu
      const x = coords.x * (imageSize.width / image.width) + canvasOffset.x;
      const y = coords.y * (imageSize.height / image.height) + canvasOffset.y;
      
      if (coords.width !== undefined && coords.height !== undefined) {
        // Dla prostokąta
        const width = coords.width * (imageSize.width / image.width);
        const height = coords.height * (imageSize.height / image.height);
        return { x, y, width, height };
      }
      
      return { x, y };
    }
    
    // Dla tablicy punktów (wielokąt)
    return coords.map(point => transformCoordinates(point));
  };
  
  // Funkcja do transformacji współrzędnych z płótna na oryginalny obraz
  const reverseTransformCoordinates = (coords) => {
    if (!coords) return { x: 0, y: 0 };
    
    if (coords.x !== undefined && coords.y !== undefined) {
      // Dla pojedynczego punktu
      const x = Math.round((coords.x - canvasOffset.x) * (image.width / imageSize.width));
      const y = Math.round((coords.y - canvasOffset.y) * (image.height / imageSize.height));
      
      if (coords.width !== undefined && coords.height !== undefined) {
        // Dla prostokąta
        const width = Math.round(coords.width * (image.width / imageSize.width));
        const height = Math.round(coords.height * (image.height / imageSize.height));
        return { x, y, width, height };
      }
      
      return { x, y };
    }
    
    // Dla tablicy punktów (wielokąt)
    return coords.map(point => reverseTransformCoordinates(point));
  };
  
  // Funkcja do sprawdzania, czy punkt jest wewnątrz prostokąta
  const isPointInBox = (point, box) => {
    return (
      point.x >= box.x &&
      point.x <= box.x + box.width &&
      point.y >= box.y &&
      point.y <= box.y + box.height
    );
  };
  
  // Funkcja do sprawdzania, czy punkt jest wewnątrz wielokąta
  const isPointInPolygon = (point, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      
      const intersect = ((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }
    
    return inside;
  };
  
  // Funkcja do sprawdzania, czy punkt jest blisko uchwytu do zmiany rozmiaru
  const getResizeHandle = (point, box) => {
    const { x, y, width, height } = box;
    const handleSize = 8;
    
    // Sprawdź uchwyty w rogach
    const handles = [
      { x: x, y: y, cursor: 'nwse-resize', position: 'tl' },
      { x: x + width, y: y, cursor: 'nesw-resize', position: 'tr' },
      { x: x, y: y + height, cursor: 'nesw-resize', position: 'bl' },
      { x: x + width, y: y + height, cursor: 'nwse-resize', position: 'br' }
    ];
    
    // Sprawdź uchwyty na środkach boków
    handles.push(
      { x: x + width / 2, y: y, cursor: 'ns-resize', position: 'tc' },
      { x: x + width, y: y + height / 2, cursor: 'ew-resize', position: 'rc' },
      { x: x + width / 2, y: y + height, cursor: 'ns-resize', position: 'bc' },
      { x: x, y: y + height / 2, cursor: 'ew-resize', position: 'lc' }
    );
    
    // Sprawdź, czy punkt jest blisko któregoś z uchwytów
    for (const handle of handles) {
      if (
        point.x >= handle.x - handleSize &&
        point.x <= handle.x + handleSize &&
        point.y >= handle.y - handleSize &&
        point.y <= handle.y + handleSize
      ) {
        return handle;
      }
    }
    
    return null;
  };
  
  // Funkcja do znajdowania adnotacji pod kursorem
  const findAnnotationAtPoint = (point) => {
    if (!annotations || annotations.length === 0) return null;
    
    // Sprawdź od końca (najnowsze adnotacje są na wierzchu)
    for (let i = annotations.length - 1; i >= 0; i--) {
      const annotation = annotations[i];
      
      if (annotation.type === 'box') {
        const { x, y, width, height } = transformCoordinates(annotation.coordinates);
        if (isPointInBox(point, { x, y, width, height })) {
          return annotation;
        }
      } else if (annotation.type === 'polygon') {
        const points = annotation.coordinates.map(point => transformCoordinates(point));
        if (isPointInPolygon(point, points)) {
          return annotation;
        }
      }
    }
    
    return null;
  };
  
  // Funkcja do pobierania koloru klasy
  const getClassColor = (classId) => {
    if (!classId || !classes || classes.length === 0) return '#FF0000';
    
    const classObj = classes.find(c => c.id === classId);
    return classObj ? classObj.color : '#FF0000';
  };
  
  // Obsługa rozpoczęcia rysowania
  const handleMouseDown = (e) => {
    if (!image || !imageLoaded) return;
    
    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Sprawdź, czy kliknięcie jest wewnątrz obrazu
    if (
      x < canvasOffset.x ||
      y < canvasOffset.y ||
      x > canvasOffset.x + imageSize.width ||
      y > canvasOffset.y + imageSize.height
    ) {
      return;
    }
    
    if (tool === 'select') {
      // Sprawdź, czy kliknięto na wybraną adnotację
      if (selectedAnnotation) {
        const { x: boxX, y: boxY, width, height } = transformCoordinates(selectedAnnotation.coordinates);
        
        // Sprawdź, czy kliknięto na uchwyt do zmiany rozmiaru
        const handle = getResizeHandle({ x, y }, { x: boxX, y: boxY, width, height });
        
        if (handle) {
          // Rozpocznij zmianę rozmiaru
          setResizeHandle(handle);
          setIsDragging(true);
          return;
        }
        
        // Sprawdź, czy kliknięto wewnątrz prostokąta
        if (selectedAnnotation.type === 'box' && isPointInBox({ x, y }, { x: boxX, y: boxY, width, height })) {
          // Rozpocznij przeciąganie
          setIsDragging(true);
          setDragOffset({ x: x - boxX, y: y - boxY });
          return;
        }
      }
      
      // Sprawdź, czy kliknięto na inną adnotację
      const clickedAnnotation = findAnnotationAtPoint({ x, y });
      if (clickedAnnotation) {
        onSelectAnnotation(clickedAnnotation);
        
        // Jeśli kliknięto na adnotację, rozpocznij przeciąganie
        if (clickedAnnotation.type === 'box') {
          const { x: boxX, y: boxY } = transformCoordinates(clickedAnnotation.coordinates);
          setIsDragging(true);
          setDragOffset({ x: x - boxX, y: y - boxY });
        }
      } else {
        // Jeśli nie kliknięto na żadną adnotację, odznacz wybraną
        onSelectAnnotation(null);
      }
    } else if (tool === 'box') {
      // Rozpocznij rysowanie prostokąta
      setIsDrawing(true);
      setStartPoint({ x, y });
      setCurrentPoint({ x, y });
    } else if (tool === 'polygon') {
      // Jeśli to pierwszy punkt, rozpocznij rysowanie wielokąta
      if (polygonPoints.length === 0) {
        setIsDrawing(true);
        setPolygonPoints([{ x, y }]);
      } else {
        // Sprawdź, czy kliknięto blisko pierwszego punktu, aby zamknąć wielokąt
        const firstPoint = polygonPoints[0];
        const distance = Math.sqrt(Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2));
        
        if (polygonPoints.length > 2 && distance < 10) {
          // Zakończ rysowanie wielokąta
          finishPolygon();
        } else {
          // Dodaj nowy punkt do wielokąta
          setPolygonPoints([...polygonPoints, { x, y }]);
        }
      }
      
      setCurrentPoint({ x, y });
    }
  };
  
  // Obsługa ruchu myszy
  const handleMouseMove = (e) => {
    if (!image || !imageLoaded) return;
    
    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Aktualizuj pozycję kursora
    setCurrentPoint({ x, y });
    
    if (isDrawing && tool === 'box') {
      // Aktualizuj rysowany prostokąt
      redrawCanvas();
    } else if (isDrawing && tool === 'polygon') {
      // Aktualizuj rysowany wielokąt
      redrawCanvas();
    } else if (isDragging && selectedAnnotation) {
      if (resizeHandle) {
        // Zmiana rozmiaru prostokąta
        if (selectedAnnotation.type === 'box') {
          const { x: boxX, y: boxY, width, height } = transformCoordinates(selectedAnnotation.coordinates);
          let newX = boxX;
          let newY = boxY;
          let newWidth = width;
          let newHeight = height;
          
          // Aktualizuj rozmiar w zależności od uchwytu
          switch (resizeHandle.position) {
            case 'tl': // Lewy górny róg
              newX = x;
              newY = y;
              newWidth = boxX + width - x;
              newHeight = boxY + height - y;
              break;
            case 'tr': // Prawy górny róg
              newY = y;
              newWidth = x - boxX;
              newHeight = boxY + height - y;
              break;
            case 'bl': // Lewy dolny róg
              newX = x;
              newWidth = boxX + width - x;
              newHeight = y - boxY;
              break;
            case 'br': // Prawy dolny róg
              newWidth = x - boxX;
              newHeight = y - boxY;
              break;
            case 'tc': // Środek górnej krawędzi
              newY = y;
              newHeight = boxY + height - y;
              break;
            case 'rc': // Środek prawej krawędzi
              newWidth = x - boxX;
              break;
            case 'bc': // Środek dolnej krawędzi
              newHeight = y - boxY;
              break;
            case 'lc': // Środek lewej krawędzi
              newX = x;
              newWidth = boxX + width - x;
              break;
          }
          
          // Upewnij się, że wymiary są dodatnie
          if (newWidth < 0) {
            newX = newX + newWidth;
            newWidth = Math.abs(newWidth);
          }
          
          if (newHeight < 0) {
            newY = newY + newHeight;
            newHeight = Math.abs(newHeight);
          }
          
          // Aktualizuj adnotację
          const updatedCoordinates = reverseTransformCoordinates({
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight
          });
          
          const updatedAnnotation = {
            ...selectedAnnotation,
            coordinates: updatedCoordinates
          };
          
          onUpdateAnnotation(updatedAnnotation);
        }
      } else {
        // Przeciąganie prostokąta
        if (selectedAnnotation.type === 'box') {
          const newX = x - dragOffset.x;
          const newY = y - dragOffset.y;
          
          // Aktualizuj adnotację
          const { width, height } = transformCoordinates(selectedAnnotation.coordinates);
          const updatedCoordinates = reverseTransformCoordinates({
            x: newX,
            y: newY,
            width,
            height
          });
          
          const updatedAnnotation = {
            ...selectedAnnotation,
            coordinates: updatedCoordinates
          };
          
          onUpdateAnnotation(updatedAnnotation);
        }
      }
    } else if (tool === 'select') {
      // Aktualizuj kursor w zależności od tego, co jest pod myszą
      const overlay = overlayRef.current;
      
      if (selectedAnnotation && selectedAnnotation.type === 'box') {
        const { x: boxX, y: boxY, width, height } = transformCoordinates(selectedAnnotation.coordinates);
        
        // Sprawdź, czy kursor jest nad uchwytem do zmiany rozmiaru
        const handle = getResizeHandle({ x, y }, { x: boxX, y: boxY, width, height });
        
        if (handle) {
          overlay.style.cursor = handle.cursor;
          return;
        }
        
        // Sprawdź, czy kursor jest nad prostokątem
        if (isPointInBox({ x, y }, { x: boxX, y: boxY, width, height })) {
          overlay.style.cursor = 'move';
          return;
        }
      }
      
      // Sprawdź, czy kursor jest nad inną adnotacją
      const annotationUnderCursor = findAnnotationAtPoint({ x, y });
      if (annotationUnderCursor) {
        overlay.style.cursor = 'pointer';
      } else {
        overlay.style.cursor = 'default';
      }
    }
  };
  
  // Obsługa zakończenia rysowania
  const handleMouseUp = () => {
    if (!image || !imageLoaded) return;
    
    if (isDrawing && tool === 'box') {
      // Zakończ rysowanie prostokąta
      finishBox();
    }
    
    // Zakończ przeciąganie
    setIsDragging(false);
    setResizeHandle(null);
  };
  
  // Obsługa klawisza Escape
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      // Anuluj rysowanie
      if (isDrawing) {
        setIsDrawing(false);
        setPolygonPoints([]);
        redrawCanvas();
      }
    } else if (e.key === 'Enter') {
      // Zakończ rysowanie wielokąta
      if (isDrawing && tool === 'polygon' && polygonPoints.length > 2) {
        finishPolygon();
      }
    }
  };
  
  // Funkcja do zakończenia rysowania prostokąta
  const finishBox = () => {
    if (!selectedClass) {
      setIsDrawing(false);
      return;
    }
    
    // Oblicz współrzędne prostokąta
    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);
    
    // Sprawdź, czy prostokąt ma minimalny rozmiar
    if (width < 5 || height < 5) {
      setIsDrawing(false);
      return;
    }
    
    // Przekształć współrzędne na oryginalne wymiary obrazu
    const coordinates = reverseTransformCoordinates({ x, y, width, height });
    
    // Dodaj nową adnotację
    onAddAnnotation({
      type: 'box',
      coordinates
    });
    
    // Zakończ rysowanie
    setIsDrawing(false);
  };
  
  // Funkcja do zakończenia rysowania wielokąta
  const finishPolygon = () => {
    if (!selectedClass || polygonPoints.length < 3) {
      setIsDrawing(false);
      setPolygonPoints([]);
      return;
    }
    
    // Przekształć współrzędne na oryginalne wymiary obrazu
    const coordinates = polygonPoints.map(point => reverseTransformCoordinates(point));
    
    // Dodaj nową adnotację
    onAddAnnotation({
      type: 'polygon',
      coordinates
    });
    
    // Zakończ rysowanie
    setIsDrawing(false);
    setPolygonPoints([]);
  };
  
  // Dodaj nasłuchiwanie klawiatury
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawing, tool, polygonPoints]);
  
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Płótno do rysowania obrazu */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Płótno do rysowania adnotacji */}
      <canvas
        ref={overlayRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: tool === 'box' || tool === 'polygon' ? 'crosshair' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </Box>
  );
});

ImageCanvas.propTypes = {
  image: PropTypes.object,
  annotations: PropTypes.array,
  selectedAnnotation: PropTypes.object,
  selectedClass: PropTypes.number,
  classes: PropTypes.array,
  tool: PropTypes.string,
  zoom: PropTypes.number,
  onAddAnnotation: PropTypes.func,
  onUpdateAnnotation: PropTypes.func,
  onSelectAnnotation: PropTypes.func
};

ImageCanvas.defaultProps = {
  annotations: [],
  classes: [],
  tool: 'box',
  zoom: 1,
  onAddAnnotation: () => {},
  onUpdateAnnotation: () => {},
  onSelectAnnotation: () => {}
};

export default ImageCanvas;
