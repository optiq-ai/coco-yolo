import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Komponenty układu
import MainLayout from './components/layout/MainLayout';

// Strony
import DashboardPage from './pages/DashboardPage';
import ImagesPage from './pages/ImagesPage';
import EditorPage from './pages/EditorPage';
import DetectionPage from './pages/DetectionPage';
import TrainingPage from './pages/TrainingPage';
import MetricsPage from './pages/MetricsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Efekt do wczytania preferencji trybu ciemnego z localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(JSON.parse(savedMode));
    }
  }, []);

  // Funkcja do przełączania trybu ciemnego
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  // Tworzenie motywu na podstawie trybu ciemnego
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#3f51b5', // Niebieski kolor z przykładowych zrzutów ekranu
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '4px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            overflow: 'hidden',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/images" element={<ImagesPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/detection" element={<DetectionPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/metrics" element={<MetricsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
