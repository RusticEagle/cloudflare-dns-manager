import React from 'react'
import { Breadcrumbs, Link as MuiLink, Typography } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import HomeIcon from '@mui/icons-material/Home'
import Link from 'next/link'
import { useRouter } from 'next/router'

const BreadcrumbNav: React.FC = () => {
  const router = useRouter()
  const pathSegments = router.asPath.split('/').filter(segment => segment && segment !== '#')

  // Map route segments to readable names
  const getSegmentName = (segment: string, index: number, allSegments: string[]): string => {
    // If it's a domain ID (looks like a hash), show "Domain Details"
    if (index === 1 && allSegments[0] === 'domains' && segment.length > 10) {
      return 'Domain Details'
    }
    
    // Map specific routes
    const routeMap: { [key: string]: string } = {
      'domains': 'Domains',
      'settings': 'Settings',
      'api': 'API',
    }
    
    return routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  // Build breadcrumb items
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/')
    const isLast = index === pathSegments.length - 1
    const name = getSegmentName(segment, index, pathSegments)

    return { path, name, isLast }
  })

  // Don't show breadcrumbs on home page
  if (pathSegments.length === 0) {
    return null
  }

  return (
    <Breadcrumbs 
      separator={<NavigateNextIcon fontSize="small" />} 
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      <MuiLink
        component={Link}
        href="/"
        underline="hover"
        sx={{ display: 'flex', alignItems: 'center', color: 'inherit' }}
      >
        <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
        Dashboard
      </MuiLink>
      
      {breadcrumbItems.map((item, index) => {
        if (item.isLast) {
          return (
            <Typography key={index} color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              {item.name}
            </Typography>
          )
        }
        
        return (
          <MuiLink
            key={index}
            component={Link}
            href={item.path}
            underline="hover"
            color="inherit"
          >
            {item.name}
          </MuiLink>
        )
      })}
    </Breadcrumbs>
  )
}

export default BreadcrumbNav
