import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';

const logoColors = ['#FF6B35', '#1976d2'];

export default function Header() {
  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: '#fff', color: '#333', borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: `conic-gradient(from 0deg, ${logoColors[0]} 0deg 180deg, ${logoColors[1]} 180deg 360deg)`,
            }}
          />
          <Typography variant="h6" fontWeight={700} color="inherit">
            SkyGeni
          </Typography>
        </Box>
        <Box>
          <IconButton size="small" sx={{ color: '#666' }} aria-label="Reports">
            <Typography sx={{ fontSize: 20 }}>📄</Typography>
          </IconButton>
          <IconButton size="small" sx={{ color: '#666' }} aria-label="Notifications">
            <Typography sx={{ fontSize: 20 }}>🔔</Typography>
          </IconButton>
          <IconButton size="small" sx={{ color: '#666' }} aria-label="Help">
            <Typography sx={{ fontSize: 20 }}>?</Typography>
          </IconButton>
          <IconButton size="small" sx={{ color: '#666' }} aria-label="Profile">
            <Typography sx={{ fontSize: 20 }}>👤</Typography>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
