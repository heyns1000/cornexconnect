import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface FileUploadProps {
  onUpload: (file: File) => Promise<any>;
  title: string;
  description: string;
  acceptedTypes?: string;
}

export const FileUpload = ({
  onUpload,
  title,
  description,
  acceptedTypes = '.csv,.xlsx,.xls',
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploading(true);
      setResult(null);

      try {
        const response = await onUpload(file);
        setResult(response.data);
      } catch (error) {
        setResult({ error: 'Upload failed' });
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  });

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="gradient-text">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            {uploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Upload className="w-12 h-12 text-primary" />
              </motion.div>
            ) : (
              <FileSpreadsheet className="w-12 h-12 text-muted-foreground" />
            )}
            <div>
              {isDragActive ? (
                <p className="text-lg font-medium">Drop the file here...</p>
              ) : (
                <>
                  <p className="text-lg font-medium">Drag & drop your file here</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    or click to select a file ({acceptedTypes})
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-lg bg-muted"
          >
            {result.error ? (
              <div className="flex items-center space-x-2 text-destructive">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">{result.error}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-primary">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Upload Complete!</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="text-lg font-semibold">{result.total}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Successful</p>
                    <p className="text-lg font-semibold text-green-600">{result.successful}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Failed</p>
                    <p className="text-lg font-semibold text-red-600">{result.failed}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
