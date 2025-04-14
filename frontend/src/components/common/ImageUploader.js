import React, { useState, useRef } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

const ImageUploader = ({ onUpload, multiple = true, accept = "image/*", maxSize = 10 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Obsługa przeciągania plików
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Obsługa upuszczenia plików
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  // Obsługa kliknięcia przycisku wyboru plików
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Obsługa wyboru plików
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  // Przetwarzanie wybranych plików
  const handleFiles = (files) => {
    setError(null);
    
    // Sprawdzenie rozmiaru plików
    const oversizedFiles = Array.from(files).filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Niektóre pliki przekraczają maksymalny rozmiar ${maxSize}MB`);
      return;
    }
    
    // Symulacja przesyłania
    setIsUploading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Wywołanie funkcji zwrotnej z wybranymi plikami
          if (onUpload) {
            onUpload(files);
          }
          
          return 0;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <Box>
      <Box
        sx={{
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'grey.400',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          backgroundColor: isDragging ? 'rgba(63, 81, 181, 0.08)' : 'background.paper',
          transition: 'all 0.3s',
          cursor: 'pointer',
          mb: 2
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
        />
        
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Przeciągnij i upuść pliki tutaj
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          lub
        </Typography>
        
        <Button variant="contained" component="span">
          Wybierz pliki
        </Button>
        
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          {multiple ? 'Możesz wybrać wiele plików' : 'Możesz wybrać tylko jeden plik'}
        </Typography>
        
        <Typography variant="caption" display="block">
          Maksymalny rozmiar pliku: {maxSize}MB
        </Typography>
      </Box>
      
      {isUploading && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">{`${Math.round(progress)}%`}</Typography>
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Przesyłanie plików...
          </Typography>
        </Box>
      )}
      
      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

// Komponent LinearProgress
function LinearProgress({ variant, value }) {
  return (
    <div style={{ 
      width: '100%',
      height: 8,
      backgroundColor: '#e0e0e0',
      borderRadius: 4,
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${value}%`,
        height: '100%',
        backgroundColor: '#3f51b5',
        transition: 'width 0.3s ease',
      }} />
    </div>
  );
}

export default ImageUploader;
