'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createCase } from '@/store/slices/casesSlice';
import { fetchChambers } from '@/store/slices/chambersSlice';

export default function NewCasePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const chamberIdFromUrl = searchParams.get('chamberId') || '';
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.cases);
    const { chambers } = useAppSelector((state) => state.chambers);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        nextDate: '',
        chamberId: chamberIdFromUrl,
    });

    useEffect(() => {
        dispatch(fetchChambers());
    }, [dispatch]);

    useEffect(() => {
        if (chamberIdFromUrl) setFormData((prev) => ({ ...prev, chamberId: chamberIdFromUrl }));
    }, [chamberIdFromUrl]);
    const [files, setFiles] = useState<File[]>([]);
    const [fileNames, setFileNames] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles((prev) => [...prev, ...newFiles]);
            setFileNames((prev) => [...prev, ...newFiles.map((f) => f.name.replace('.pdf', ''))]);
        }
    };

    const handleFileNameChange = (index: number, value: string) => {
        setFileNames((prev) => {
            const newNames = [...prev];
            newNames[index] = value;
            return newNames;
        });
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setFileNames((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('nextDate', formData.nextDate);

        if (formData.chamberId) {
            formDataToSend.append('chamberId', formData.chamberId);
        }

        files.forEach((file) => {
            formDataToSend.append('files', file);
        });

        // Send fileNames as JSON string - FormData repeated keys may not become array on backend
        formDataToSend.append('fileNames', JSON.stringify(fileNames));

        const result = await dispatch(createCase(formDataToSend));

        if (createCase.fulfilled.match(result)) {
            router.push('/dashboard/cases');
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Case</h1>
                <p className="text-slate-600">Add a new case to your practice</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 rounded-lg" style={{ background: 'hsl(0 84% 60% / 0.1)', color: 'hsl(0 84% 60%)' }}>
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-lg border border-slate-200-xl p-6 space-y-6">
                    {/* Title */}
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

                    {/* Description */}
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
                            placeholder="Provide a detailed description of the case..."
                        />
                    </div>

                    {/* Next Date */}
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

                    {/* Chamber Selection */}
                    {chambers.length > 0 && (
                        <div>
                            <label htmlFor="chamberId" className="block text-sm font-medium text-gray-300 mb-2">
                                Chamber (Optional)
                            </label>
                            <select
                                id="chamberId"
                                name="chamberId"
                                value={formData.chamberId}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="">Personal Case (No Chamber)</option>
                                {chambers.filter(c => c.role === 'admin' || c.permissions?.canCreate).map((chamber) => (
                                    <option key={chamber._id} value={chamber._id}>
                                        {chamber.name}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-slate-500">Select a chamber to share this case with chamber members</p>
                        </div>
                    )}
                </div>

                {/* File Upload */}
                <div className="bg-white rounded-lg border border-slate-200-xl p-6">
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Documents (PDF Only)</h3>

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
                        className="w-full py-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-500/5 transition-all"
                    >
                        <div className="flex flex-col items-center">
                            <svg className="w-10 h-10 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-slate-600">Click to upload PDF files</p>
                            <p className="text-xs text-slate-500 mt-1">Maximum 10 files, 10MB each</p>
                        </div>
                    </button>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="mt-4 space-y-3">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-slate-100">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'hsl(0 84% 60% / 0.1)' }}>
                                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M14,2L20,8V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H14M18,20V9H13V4H6V20H18M10.92,12.31C10.68,11.54 10.15,9.08 11.55,9.04C12.95,9 12.03,12.16 12.03,12.16C12.42,13.65 14.05,14.72 14.05,14.72C14.55,14.57 17.4,14.24 17,15.72C16.57,17.2 13.5,15.81 13.5,15.81C11.55,15.95 10.09,16.47 10.09,16.47C8.96,18.58 7.64,19.5 7.1,18.61C6.43,17.5 9.23,16.07 9.23,16.07C10.68,13.72 10.9,12.35 10.92,12.31Z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <input
                                            type="text"
                                            value={fileNames[index]}
                                            onChange={(e) => handleFileNameChange(index, e.target.value)}
                                            className="w-full px-3 py-1.5 rounded border border-slate-300 bg-slate-200/50 text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="Document name"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="p-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-500/10 transition-all"
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

                {/* Submit */}
                <div className="flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                    >
                        Cancel
                    </button>
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
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Creating...
                            </span>
                        ) : (
                            'Create Case'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
