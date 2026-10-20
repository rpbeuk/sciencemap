import React, { useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { uploadPublications } from '../utils/supabaseClient';
import * as XLSX from 'xlsx';

interface FileUploadProps {
  onFilesSelected: (publicationFile: File, accountsFile: File) => Promise<void>;
  loading: boolean;
  error: string | null;
  useSupabase: boolean;
  onSupabaseUpload?: (success: boolean, message: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  loading,
  error,
  useSupabase,
  onSupabaseUpload,
}) => {
  const pubFileRef = useRef<HTMLInputElement>(null);
  const accFileRef = useRef<HTMLInputElement>(null);
  const [pubFile, setPubFile] = React.useState<File | null>(null);
  const [accFile, setAccFile] = React.useState<File | null>(null);
  const [uploadMode, setUploadMode] = React.useState<'local' | 'supabase'>('local');

  const handleLocalSubmit = async () => {
    if (!pubFile || !accFile) {
      alert('Please select both files');
      return;
    }
    await onFilesSelected(pubFile, accFile);
  };

  const handleSupabaseSubmit = async () => {
    if (!pubFile) {
      alert('Please select a publications file');
      return;
    }

    try {
      const arrayBuffer = await pubFile.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);

      const publications = data.map((row: any) => ({
        pmid: row.pmid,
        doi: row.doi || '',
        title: row.title || '',
        authors: row.authors || '',
        year: row.year,
        journal: row.journal || '',
        summary: row.summary || '',
        summarymandm: row.summaryMandM || '',
        samplespecies: row['sample species'] || '',
        sampletype: row['sample type'] || '',
        instrument: row.instrument || '',
        enzymes: row.enzymes || '',
        lastauthorcity: row['Last author city'] || '',
        lastauthorcountry: row['Last author country'] || '',
        beneluxflag: row['Benelux Flag'] === 1,
        status: row.Status || '',
      }));

      const result = await uploadPublications(
        publications,
        `Upload - ${new Date().toLocaleDateString()}`
      );

      if (result.success) {
        onSupabaseUpload?.(true, `Successfully uploaded ${result.count} publications`);
        setPubFile(null);
      } else {
        onSupabaseUpload?.(false, result.error || 'Upload failed');
      }
    } catch (err) {
      onSupabaseUpload?.(false, err instanceof Error ? err.message : 'Upload error');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
      <h2 className="text-2xl font-bold mb-4">ScienceMap Benelux</h2>
      <p className="text-gray-600 text-sm mb-6">
        Upload Excel files to visualize scientific publications across the Benelux region.
      </p>

      {useSupabase && (
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setUploadMode('local')}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
              uploadMode === 'local'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Local
          </button>
          <button
            onClick={() => setUploadMode('supabase')}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
              uploadMode === 'supabase'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Supabase
          </button>
        </div>
      )}

      <div className="space-y-4">
        {uploadMode === 'local' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publications File
              </label>
              <input
                ref={pubFileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setPubFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                onClick={() => pubFileRef.current?.click()}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
              >
                <Upload size={20} className="mx-auto mb-2 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {pubFile ? pubFile.name : 'Select publications file'}
                </span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accounts/Institutions File
              </label>
              <input
                ref={accFileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setAccFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                onClick={() => accFileRef.current?.click()}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
              >
                <Upload size={20} className="mx-auto mb-2 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {accFile ? accFile.name : 'Select accounts file'}
                </span>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handleLocalSubmit}
              disabled={!pubFile || !accFile || loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Load Data'}
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publications File
              </label>
              <input
                ref={pubFileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setPubFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                onClick={() => pubFileRef.current?.click()}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
              >
                <Upload size={20} className="mx-auto mb-2 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {pubFile ? pubFile.name : 'Select publications file'}
                </span>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handleSupabaseSubmit}
              disabled={!pubFile || loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Uploading to Supabase...' : 'Upload to Database'}
            </button>

            <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
              Upload enriches the Supabase database. Existing publications (by PMID) will not be duplicated.
            </p>
          </>
        )}
      </div>

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-gray-700">
        <p>
          <strong>How it works:</strong>
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            {uploadMode === 'local'
              ? 'Upload your files for local browsing'
              : 'Upload to Supabase database'}
          </li>
          <li>Click on institutions on the map to view publications</li>
          <li>Click keywords to filter publications</li>
          <li>Expand publications to see detailed information</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
