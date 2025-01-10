'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';

export default function VideoUploadForm() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title for the video');
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);
    
    try {
      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      // Get the presigned URL
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          title: title.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get upload URL');
      }
      
      const { url } = data;
      console.log('Got presigned URL:', url);

      // Upload to S3 with progress tracking
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.withCredentials = false; // Important for CORS
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          console.log('Upload completed successfully');
          router.push('/chat/video');
        } else {
          console.error('Upload failed with status:', xhr.status, xhr.statusText);
          setError(`Upload failed with status: ${xhr.status} - ${xhr.statusText}`);
          setUploading(false);
          setUploadProgress(0);
        }
      };

      xhr.onerror = (e) => {
        console.error('XHR error occurred during upload:', e);
        setError('Network error during upload. Please check your connection and try again.');
        setUploading(false);
        setUploadProgress(0);
      };

      // Add timeout handling
      xhr.timeout = 300000; // 5 minutes timeout
      xhr.ontimeout = () => {
        console.error('Upload timed out');
        setError('Upload timed out. Please try again.');
        setUploading(false);
        setUploadProgress(0);
      };

      try {
        xhr.send(file);
      } catch (error) {
        console.error('Error sending file:', error);
        setError('Failed to send file. Please try again.');
        setUploading(false);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload video');
      setUploading(false);
      setUploadProgress(0);
    }
  }, [title, description, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-500">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-[#333] border border-[#444] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white transition-all"
            placeholder="Enter video title"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-[#333] border border-[#444] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white transition-all h-24"
            placeholder="Enter video description (optional)"
          />
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-[#444] hover:border-blue-500/50'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          {isDragActive ? (
            <p className="text-blue-400 font-medium">
              Drop the video here
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-300">Drag and drop your video here, or click to select</p>
              <p className="text-sm text-gray-500">Supports MP4, MOV, AVI, MKV</p>
            </div>
          )}
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="h-2 bg-[#333] rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  );
} 