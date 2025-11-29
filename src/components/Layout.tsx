import React from 'react'
import { AppBar, Toolbar, Typography, Container, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Button, Box } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import DnsIcon from '@mui/icons-material/Dns'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import Link from 'next/link'
import { useRouter } from 'next/router'
import BreadcrumbNav from './BreadcrumbNav'
import { useApiKey } from '../contexts/ApiKeyContext'

const drawerWidth = 240

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  const { isAuthenticated, logout } = useApiKey()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Don't show navigation on login page
  const isLoginPage = router.pathname === '/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Cloudflare DNS Bulk Manager
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>Beta</Typography>
          {isAuthenticated && (
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              size="small"
            >
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <div style={{ width: drawerWidth }}>
          <List>
            <ListItem component={Link} href={'/'} onClick={() => setOpen(false)} sx={{ cursor: 'pointer' }}>
              <ListItemIcon>
                <CloudOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary={'Dashboard'} />
            </ListItem>
            <ListItem component={Link} href={'/domains'} onClick={() => setOpen(false)} sx={{ cursor: 'pointer' }}>
              <ListItemIcon>
                <DnsIcon />
              </ListItemIcon>
              <ListItemText primary={'Domains'} />
            </ListItem>
            <ListItem component={Link} href={'/settings'} onClick={() => setOpen(false)} sx={{ cursor: 'pointer' }}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary={'Settings'} />
            </ListItem>
          </List>
        </div>
      </Drawer>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <BreadcrumbNav />
        {children}
      </Container>
    </div>
  )
}

export default Layout
