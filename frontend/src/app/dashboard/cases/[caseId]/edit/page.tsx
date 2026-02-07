'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCaseById, updateCase, clearCurrentCase, clearError } from '@/store/slices/casesSlice';

export default function EditCasePage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { currentCase, userPermissions, loading, error } = useAppSelector((state) => state.cases);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    nextDate: '',
    status: 'open' as 'open' | 'closed' | 'dismissed',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  const canUpdate = userPermissions?.canUpdate ?? true; // personal cases: owner can update

  useEffect(() => {
    if (caseId) {
      dispatch(fetchCaseById(caseId));
    }
    return () => {
      dispatch(clearCurrentCase());
    };
  }, [dispatch, caseId]);

  useEffect(() => {
    if (currentCase) {
      setFormData({
        title: currentCase.title,
        description: currentCase.description,
        nextDate: currentCase.nextDate ? new Date(currentCase.nextDate).toISOString().split('T')[0] : '',
        status: currentCase.status,
      });
    }
  }, [currentCase]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter((f) => f.type === 'application/pdf');
      setFiles((prev) => [...prev, ...newFiles]);
      setFileNames((prev) => [...prev, ...newFiles.map((f) => f.name.replace(/\.pdf$/i, '') || 'Document')]);
    }
  };

  const handleFileNameChange = (index: number, value: string) => {
    setFileNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const removeNewFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('nextDate', formData.nextDate);
    formDataToSend.append('status', formData.status);

    files.forEach((file) => formDataToSend.append('files', file));
    formDataToSend.append('fileNames', JSON.stringify(fileNames));

    const result = await dispatch(updateCase({ caseId, formData: formDataToSend }));

    if (updateCase.fulfilled.match(result)) {
      router.push(`/dashboard/cases/${caseId}`);
    } else if (updateCase.rejected.match(result)) {
      setLocalError(result.payload as string);
    }
  };

  if (loading && !currentCase) {
    return (
      <div className="max-w-3xl mx-auto animate-fadeIn">
        <div className="bg-white rounded-lg border border-slate-200-xl p-8 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-slate-200 rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (!currentCase && !loading) {
    return (
      <div className="max-w-3xl mx-auto animate-fadeIn">
        <div className="bg-white rounded-lg border border-slate-200-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Case not found</h2>
          <Link href="/dashboard/cases" className="text-indigo-600 hover:text-blue-300">
            Back to Cases
          </Link>
        </div>
      </div>
    );
  }

  if (!canUpdate) {
    return (
      <div className="max-w-3xl mx-auto animate-fadeIn">
        <div className="bg-white rounded-lg border border-slate-200-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">You don&apos;t have permission to edit this case.</p>
          <Link href={`/dashboard/cases/${caseId}`} className="text-indigo-600 hover:text-blue-300">
            Back to Case
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Case
        </button>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Case</h1>
        <p className="text-slate-600">Update case details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {localError && (
          <div className="p-4 rounded-lg" style={{ background: 'hsl(0 84% 60% / 0.1)', color: 'hsl(0 84% 60%)' }}>
            {localError}
          </div>
        )}

        <div className="bg-white rounded-lg border border-slate-200-xl p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Case Title <span className="text-red-600">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-100 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., Smith vs. Johnson Property Dispute"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-100 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Provide a detailed description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nextDate" className="block text-sm font-medium text-gray-300 mb-2">
                Next Hearing Date <span className="text-red-600">*</span>
              </label>
              <input
                id="nextDate"
                name="nextDate"
                type="date"
                value={formData.nextDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-100 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Existing files (read-only) */}
        {currentCase.files && currentCase.files.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200-xl p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Existing Documents</h3>
            <div className="space-y-2">
              {currentCase.files.map((file: { fileName: string; fileUrl: string }, idx: number) => (
                <a
                  key={idx}
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 hover:bg-slate-100"
                >
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2L20,8V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H14M18,20V9H13V4H6V20H18" />
                  </svg>
                  <span className="text-slate-900 truncate">{file.fileName}</span>
                  <span className="text-xs text-slate-500">PDF</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Add new files */}
        <div className="bg-white rounded-lg border border-slate-200-xl p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Add New Documents (PDF Only)</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-500/5 transition-all"
          >
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-slate-600">Click to add PDF files</p>
            </div>
          </button>

          {files.length > 0 && (
            <div className="mt-4 space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-slate-100">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'hsl(0 84% 60% / 0.1)' }}>
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2L20,8V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H14" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={fileNames[index]}
                      onChange={(e) => handleFileNameChange(index, e.target.value)}
                      placeholder="Document name"
                      required
                      className="w-full px-3 py-1.5 rounded border border-slate-300 bg-slate-200/50 text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewFile(index)}
                    className="p-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link
            href={`/dashboard/cases/${caseId}`}
            className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg font-medium text-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(262 83% 58%) 100%)' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
