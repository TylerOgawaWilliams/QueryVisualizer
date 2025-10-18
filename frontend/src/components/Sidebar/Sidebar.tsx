import React, { useState, useRef } from "react";
import "./sidebar.css";

export function Sidebar() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setSelectedFile(file);
        setUploadStatus(''); // Clear any previous status
    };

    const uploadDatabase = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setUploadStatus('Uploading...');

        try {
            // Extract database name from filename (without extension)
            const fileName = selectedFile.name;
            const databaseName = fileName.replace(/\.(sql|tar)$/i, '');

            const formData = new FormData();
            formData.append('database', selectedFile);
            formData.append('databaseName', databaseName);

            const response = await fetch('http://localhost:3001/api/upload-database', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setUploadStatus('✅ Upload successful!');
                setSelectedFile(null); // Clear file after success
                // Clear status after 3 seconds
                setTimeout(() => setUploadStatus(''), 3000);
            } else {
                setUploadStatus(`❌ ${result.error || 'Upload failed'}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            setUploadStatus(`❌ ${errorMessage}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <aside className="app-sidebar">
          <div className="sidebar-content">
            <div className="database-info">
              <div className="db-header">Database</div>
              <div className="db-tables">
                <div className="table-item">Tables</div>
                <div className="table-item">Views</div>
                <div className="table-item" onClick={handleUploadClick}>
                  Upload Database
                </div>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".sql,.tar"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              {selectedFile && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  backgroundColor: 'rgba(149, 181, 185, 0.1)', 
                  borderRadius: '8px',
                  color: '#95b5b9',
                  fontSize: '12px'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    Selected: {selectedFile.name}
                  </div>
                  
                  <button
                    onClick={uploadDatabase}
                    disabled={uploading}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: uploading ? '#95b5b9' : '#78b281',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Upload Now'}
                  </button>
                </div>
              )}
              
              {uploadStatus && (
                <div style={{ 
                  marginTop: '8px', 
                  padding: '8px', 
                  backgroundColor: uploadStatus.includes('✅') ? 'rgba(120, 178, 129, 0.2)' : 'rgba(220, 53, 69, 0.2)',
                  borderRadius: '4px',
                  fontSize: '11px',
                  textAlign: 'center',
                  color: uploadStatus.includes('✅') ? '#78b281' : '#dc3545'
                }}>
                  {uploadStatus}
                </div>
              )}
            </div>
          </div>
        </aside>
    )
}
