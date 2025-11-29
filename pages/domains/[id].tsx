import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Typography, Box, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Chip, Alert, CircularProgress } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import axios from 'axios'
import { useApiKey } from '../../src/contexts/ApiKeyContext'
import RecordEditorModal from '../../src/components/RecordEditorModal'

const DomainDetails: React.FC = () => {
  const router = useRouter()
  const { id } = router.query
  const [records, setRecords] = useState<any[]>([])
  const { apiKey } = useApiKey()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add')
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  const fetchRecords = async () => {
    if (!id) return
    const headers = apiKey ? { 'x-cf-api-key': apiKey } : {}
    const res = await axios.get(`/api/domains/${id}/records`, { headers })
    setRecords(res.data.records)
  }

  useEffect(() => {
    fetchRecords()
  }, [id, apiKey])

  const handleAddRecord = () => {
    setEditorMode('add')
    setSelectedRecord(null)
    setEditorOpen(true)
  }

  const handleEditRecord = (record: any) => {
    setEditorMode('edit')
    setSelectedRecord(record)
    setEditorOpen(true)
  }

  const handleDeleteClick = (record: any) => {
    setRecordToDelete(record)
    setDeleteSuccess(false)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return
    setDeleting(true)
    try {
      const headers = apiKey ? { 'x-cf-api-key': apiKey } : {}
      await axios.delete(`/api/domains/${id}/records?recordId=${recordToDelete.id}`, { headers })
      setDeleteSuccess(true)
      setDeleting(false)
      fetchRecords()
      // Auto-close after 2 seconds
      setTimeout(() => {
        setDeleteDialogOpen(false)
        setRecordToDelete(null)
        setDeleteSuccess(false)
      }, 2000)
    } catch (err) {
      console.error('Delete failed', err)
      setDeleting(false)
    }
  }

  const handleEditorSuccess = () => {
    fetchRecords()
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        DNS Records
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button variant="contained" onClick={handleAddRecord}>Add Record</Button>
        <Chip label={`${records.length} records`} sx={{ ml: 2 }} />
      </Box>

      <RecordEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSuccess={handleEditorSuccess}
        zoneId={id as string}
        record={selectedRecord}
        mode={editorMode}
      />

      <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)}>
        <DialogTitle>
          {deleteSuccess ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
              <CheckCircleIcon />
              Record Deleted Successfully
            </Box>
          ) : (
            'Delete DNS Record'
          )}
        </DialogTitle>
        <DialogContent>
          {deleteSuccess ? (
            <Alert severity="success">
              The DNS record has been deleted successfully.
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Type:</strong> {recordToDelete?.type}<br />
                  <strong>Name:</strong> {recordToDelete?.name}<br />
                  <strong>Content:</strong> {recordToDelete?.content}
                </Typography>
              </Box>
            </Alert>
          ) : (
            <DialogContentText>
              Are you sure you want to delete this DNS record?
              <br />
              <strong>Type:</strong> {recordToDelete?.type}
              <br />
              <strong>Name:</strong> {recordToDelete?.name}
              <br />
              <strong>Content:</strong> {recordToDelete?.content}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          {deleteSuccess ? (
            <Button onClick={() => setDeleteDialogOpen(false)} variant="contained">
              Close
            </Button>
          ) : (
            <>
              <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting}>
                {deleting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Deleting...</span>
                  </Box>
                ) : (
                  'Delete'
                )}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Content</TableCell>
                <TableCell>TTL</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No DNS records found. Click "Add Record" to create one.
                  </TableCell>
                </TableRow>
              )}
              {records.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <Chip label={r.type} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.content}
                  </TableCell>
                  <TableCell>{r.ttl === 1 ? 'Auto' : r.ttl}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEditRecord(r)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteClick(r)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  )
}

export default DomainDetails
