import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Upload.css'

const Upload = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef()
  const navigate = useNavigate()

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      validateAndSetFile(droppedFile)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const validateAndSetFile = (selectedFile) => {
    setError('')
    
    // Check file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv'
    ]
    
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please select a valid Excel (.xlsx, .xls) or CSV file')
      return
    }
    
    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }
    
    setFile(selectedFile)
    generatePreview(selectedFile)
  }

  const generatePreview = (selectedFile) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview({
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      })
    }
    reader.readAsArrayBuffer(selectedFile)
  }

  const uploadFile = async () => {
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('workoutFile', file)

    try {
      const response = await axios.post('/workouts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      alert('Workout plan uploaded successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Upload error:', error)
      setError(error.response?.data?.message || 'Error uploading file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setPreview(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="upload-container">
      <div className="container">
        <div className="upload-header">
          <h1>Upload Workout Plan</h1>
          <p>Import your Excel or CSV workout chart to get started</p>
        </div>

        <div className="upload-content">
          {/* File Upload Area */}
          <div 
            className={`upload-area ${file ? 'has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {!file ? (
              <div className="upload-prompt">
                <div className="upload-icon">📁</div>
                <h3>Drop your workout file here</h3>
                <p>or click to browse</p>
                <div className="file-types">
                  Supports: .xlsx, .xls, .csv
                </div>
              </div>
            ) : (
              <div className="file-preview">
                <div className="file-info">
                  <div className="file-icon">📄</div>
                  <div className="file-details">
                    <h4>{preview.name}</h4>
                    <p>{formatFileSize(preview.size)}</p>
                  </div>
                </div>
                <button 
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile()
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Upload Instructions */}
          <div className="upload-instructions">
            <h3>File Format Requirements</h3>
            <div className="instructions-grid">
              <div className="instruction-item">
                <div className="instruction-icon">📊</div>
                <div>
                  <h4>Column Headers</h4>
                  <p>Day, Exercise, Sets, Reps, Start Weight, Progression</p>
                </div>
              </div>
              
              <div className="instruction-item">
                <div className="instruction-icon">📅</div>
                <div>
                  <h4>Day Format</h4>
                  <p>Monday, Tuesday, Wednesday, etc.</p>
                </div>
              </div>
              
              <div className="instruction-item">
                <div className="instruction-icon">⚖️</div>
                <div>
                  <h4>Weight Format</h4>
                  <p>Numbers only (e.g., 12, 15.5)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Button */}
          {file && (
            <div className="upload-actions">
              <button 
                className="btn upload-btn"
                onClick={uploadFile}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="loading"></div>
                    Uploading...
                  </>
                ) : (
                  'Upload Workout Plan'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Upload
