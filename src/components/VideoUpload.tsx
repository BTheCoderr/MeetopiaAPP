import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

interface VideoUploadProps {
  onUploadComplete?: (videoId: string) => void;
}

export default function VideoUpload({ onUploadComplete }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file');
      return;
    }

    if (!title) {
      alert('Please enter a title');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Get pre-signed URL
      const { data: { uploadUrl, videoId } } = await axios.post('/api/videos/upload', {
        title,
        description,
        fileName: file.name,
        fileType: file.type,
      });

      // Upload to S3
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          setProgress(percentage);
        },
      });

      onUploadComplete?.(videoId);
      setTitle('');
      setDescription('');
      setProgress(0);
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error uploading video. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [title, description, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
    },
    disabled: uploading,
    multiple: false,
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          disabled={uploading}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={uploading}
        />
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div>
            <p className="mb-2">Uploading... {progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : isDragActive ? (
          <p>Drop the video file here</p>
        ) : (
          <p>Drag and drop a video file here, or click to select</p>
        )}
      </div>
    </div>
  );
} 