import React from 'react'
import { AppBar, Toolbar, Typography, Container, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import DnsIcon from '@mui/icons-material/Dns'
import SettingsIcon from '@mui/icons-material/Settings'
import Link from 'next/link'
import BreadcrumbNav from './BreadcrumbNav'

const drawerWidth = 240

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false)

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
          <Typography variant="body2">Beta</Typography>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <div style={{ width: drawerWidth }}>
          <List>
            <ListItem button component={Link} href={'/'} onClick={() => setOpen(false)}>
              <ListItemIcon>
                <CloudOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary={'Dashboard'} />
            </ListItem>
            <ListItem button component={Link} href={'/domains'} onClick={() => setOpen(false)}>
              <ListItemIcon>
                <DnsIcon />
              </ListItemIcon>
              <ListItemText primary={'Domains'} />
            </ListItem>
            <ListItem button component={Link} href={'/settings'} onClick={() => setOpen(false)}>
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
