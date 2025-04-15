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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { Add, Delete, Edit, Visibility, CloudUpload } from '@mui/icons-material';
import ImageUploader from '../components/common/ImageUploader';
import { useNavigate } from 'react-router-dom';

const ImagesPage = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('all');
  const [loading, setLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);

  // Fetch images and datasets on component mount
  useEffect(() => {
    fetchImages();
    fetchDatasets();
  }, []);

  // Fetch images from API
  const fetchImages = async () => {
    setLoading(true);
    try {
      // Mock data for now
      const mockImages = [
        { id: 1, name: 'street_scene_1.jpg', dataset: 'Traffic Scenes', width: 1920, height: 1080, size: '2.4 MB', created_at: '2023-01-15', annotations_count: 12 },
        { id: 2, name: 'person_walking.jpg', dataset: 'Pedestrians', width: 1280, height: 720, size: '1.8 MB', created_at: '2023-01-16', annotations_count: 3 },
        { id: 3, name: 'cars_highway.jpg', dataset: 'Traffic Scenes', width: 1920, height: 1080, size: '3.1 MB', created_at: '2023-01-17', annotations_count: 24 },
        { id: 4, name: 'bicycle_rider.jpg', dataset: 'Cyclists', width: 1280, height: 720, size: '1.5 MB', created_at: '2023-01-18', annotations_count: 2 },
        { id: 5, name: 'intersection.jpg', dataset: 'Traffic Scenes', width: 1920, height: 1080, size: '2.9 MB', created_at: '2023-01-19', annotations_count: 18 },
        { id: 6, name: 'night_scene.jpg', dataset: 'Night Scenes', width: 1920, height: 1080, size: '2.2 MB', created_at: '2023-01-20', annotations_count: 8 },
        { id: 7, name: 'pedestrian_crossing.jpg', dataset: 'Pedestrians', width: 1280, height: 720, size: '1.7 MB', created_at: '2023-01-21', annotations_count: 5 },
        { id: 8, name: 'traffic_jam.jpg', dataset: 'Traffic Scenes', width: 1920, height: 1080, size: '3.3 MB', created_at: '2023-01-22', annotations_count: 32 },
      ];
      
      setImages(mockImages);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch datasets from API
  const fetchDatasets = async () => {
    try {
      // Mock data for now
      const mockDatasets = [
        { id: 1, name: 'Traffic Scenes', image_count: 4 },
        { id: 2, name: 'Pedestrians', image_count: 2 },
        { id: 3, name: 'Cyclists', image_count: 1 },
        { id: 4, name: 'Night Scenes', image_count: 1 },
      ];
      
      setDatasets(mockDatasets);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    }
  };

  // Handle image upload
  const handleImageUpload = async (files) => {
    setLoading(true);
    try {
      // Mock upload for now
      console.log('Uploading files:', files);
      
      // Add mock data for uploaded images
      const newImages = Array.from(files).map((file, index) => ({
        id: images.length + index + 1,
        name: file.name,
        dataset: selectedDataset !== 'all' ? datasets.find(d => d.id === parseInt(selectedDataset))?.name : null,
        width: 1280,
        height: 720,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        created_at: new Date().toISOString().split('T')[0],
        annotations_count: 0
      }));
      
      setImages([...newImages, ...images]);
      setUploadOpen(false);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle image deletion
  const handleDeleteImages = async () => {
    try {
      // Mock deletion for now
      console.log('Deleting images:', selectedImages);
      
      const remainingImages = images.filter(image => !selectedImages.includes(image.id));
      setImages(remainingImages);
      setSelectedImages([]);
    } catch (error) {
      console.error('Error deleting images:', error);
    }
  };

  // Handle image selection
  const handleSelectImage = (imageId) => {
    if (selectedImages.includes(imageId)) {
      setSelectedImages(selectedImages.filter(id => id !== imageId));
    } else {
      setSelectedImages([...selectedImages, imageId]);
    }
  };

  // Handle view image
  const handleViewImage = (imageId) => {
    navigate(`/editor/${imageId}`);
  };

  // Filter images based on search term and selected dataset
  const filteredImages = images.filter(image => {
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDataset = selectedDataset === 'all' || image.dataset === datasets.find(d => d.id === parseInt(selectedDataset))?.name;
    return matchesSearch && matchesDataset;
  });

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Images
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Images
                </Typography>
                <Typography variant="h3">
                  {images.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Datasets
                </Typography>
                <Typography variant="h3">
                  {datasets.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Annotated Images
                </Typography>
                <Typography variant="h3">
                  {images.filter(img => img.annotations_count > 0).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Storage Used
                </Typography>
                <Typography variant="h3">
                  {(images.reduce((total, img) => total + parseFloat(img.size), 0) || 0).toFixed(1)} MB
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Search Images"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <TextField
              select
              label="Dataset"
              variant="outlined"
              size="small"
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="all">All Datasets</option>
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.name} ({dataset.image_count})
                </option>
              ))}
            </TextField>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {selectedImages.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleDeleteImages}
              >
                Delete Selected ({selectedImages.length})
              </Button>
            )}
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setUploadOpen(true)}
            >
              Upload Images
            </Button>
          </Box>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Dataset</TableCell>
                <TableCell>Dimensions</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Uploaded</TableCell>
                <TableCell>Annotations</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredImages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No images found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredImages.map((image) => (
                  <TableRow 
                    key={image.id}
                    selected={selectedImages.includes(image.id)}
                    hover
                  >
                    <TableCell padding="checkbox">
                      <IconButton 
                        size="small"
                        onClick={() => handleSelectImage(image.id)}
                        color={selectedImages.includes(image.id) ? "primary" : "default"}
                      >
                        {selectedImages.includes(image.id) ? <Edit /> : <Edit color="disabled" />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{image.name}</TableCell>
                    <TableCell>{image.dataset || 'Uncategorized'}</TableCell>
                    <TableCell>{image.width} × {image.height}</TableCell>
                    <TableCell>{image.size}</TableCell>
                    <TableCell>{image.created_at}</TableCell>
                    <TableCell>{image.annotations_count}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewImage(image.id)}
                        title="View/Edit Annotations"
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      
      {/* Image Upload Dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Images</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              select
              label="Dataset"
              variant="outlined"
              fullWidth
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              SelectProps={{
                native: true,
              }}
              sx={{ mb: 2 }}
            >
              <option value="all">None (Uncategorized)</option>
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.name}
                </option>
              ))}
            </TextField>
          </Box>
          
          <ImageUploader onUpload={handleImageUpload} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ImagesPage;
