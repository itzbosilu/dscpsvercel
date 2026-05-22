import { useState, DragEvent, ChangeEvent } from 'react';
import { Upload, Link, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  placeholder = 'Select or drag your image here...',
  id
}: ImageUploadFieldProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [dragError, setDragError] = useState('');

  // Handle file reading
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setDragError('Only image files are allowed.');
      return;
    }
    setDragError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        onChange(result);
      }
    };
    reader.onerror = () => {
      setDragError('Error reading file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearImage = () => {
    onChange('');
    setDragError('');
  };

  const isBase64 = value && value.startsWith('data:image/');

  return (
    <div className="space-y-1.5" id={id ? `${id}-field-container` : undefined}>
      <div className="flex items-center justify-between">
        <label className="block text-xs uppercase font-mono tracking-wider text-neutral-400 font-semibold">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs font-mono text-amber-500 hover:text-amber-400 flex items-center gap-1 focus:outline-none transition-colors"
        >
          <Link size={12} />
          <span>{showUrlInput ? 'Switch to Upload' : 'Use Direct URL'}</span>
        </button>
      </div>

      {showUrlInput ? (
        <div className="relative">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            placeholder="Paste direct HTTP/HTTPS image link..."
          />
          {value && (
            <button
              type="button"
              onClick={clearImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {value ? (
            <div className="relative rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 shrink-0">
                  <img
                    referrerPolicy="no-referrer"
                    src={value}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback visual
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/35">
                    <ImageIcon size={14} className="text-white/60" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">Image ready</p>
                  <p className="text-[10px] text-neutral-500 font-mono truncate">
                    {isBase64 ? 'Local Upload Buffer' : 'External Link Attached'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearImage}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-950 hover:text-rose-450 hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400 transition-all flex items-center gap-1 text-[10px] font-mono tracking-wider uppercase border border-neutral-750 hover:border-rose-500/20"
              >
                <X size={12} />
                <span>Clear</span>
              </button>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[90px] ${
                isDragActive
                  ? 'border-amber-500 bg-amber-500/5'
                  : 'border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900/80 hover:border-neutral-700'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id={id ? `file-input-${id}` : undefined}
              />
              <Upload size={18} className={`mb-1.5 ${isDragActive ? 'text-amber-500 animate-pulse' : 'text-neutral-500'}`} />
              <p className="text-xs text-neutral-300 font-medium">{placeholder}</p>
              <p className="text-[10px] text-neutral-500 font-mono mt-0.5">Drag-and-drop or browse</p>
              {dragError && (
                <p className="text-xs text-rose-400 font-mono mt-1.5">{dragError}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
