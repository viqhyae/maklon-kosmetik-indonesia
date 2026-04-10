import React from 'react';
import { createPortal } from 'react-dom';
import {
    AlertCircle,
    CheckCircle2,
    Database,
    Download,
    Eye,
    Filter,
    Hash,
    Info,
    Key,
    Layers,
    Map,
    QrCode,
    Settings,
    Tag,
    Trash2,
    X,
} from 'lucide-react';
import axios from 'axios';
import { jsPDF } from 'jspdf';

export default function createTagGenerator(context) {
    const {
        batches,
        batchSort,
        generatedQR,
        getFirstErrorMessage,
        globalSearch,
        handleGenerateTags,
        handleSortChange,
        isBrandOwnerRole,
        isBatchPendingAction,
        isSameEntityId,
        isSavingBatch,
        isTagModalOpen,
        normalizeBatchRecord,
        PageAlert,
        products,
        setBatches,
        setBatchPendingAction,
        setBatchSort,
        setConfirmObj,
        setIsTagModalOpen,
        selectedBatchDetail,
        setSelectedBatchDetail,
        setTagConfig,
        showToast,
        SortIcon,
        suspendReasonModal,
        setSuspendReasonModal,
        tagConfig,
        Tooltip,
    } = context;
    const TagGenerator = () => {
        const [suspendReasonInput, setSuspendReasonInput] = React.useState('');

        const closeSuspendReasonModal = () => {
            setSuspendReasonInput('');
            setSuspendReasonModal({
                isOpen: false,
                batchId: '',
            });
        };

        const handleDeleteBatch = (batchId) => {
            if (isBatchPendingAction(batchId)) return;

            setConfirmObj({
                isOpen: true,
                title: "Hapus Batch Tag?",
                message: `Semua tag ID yang tergabung di dalam batch ${batchId} akan ikut terhapus dan tidak lagi valid. Lanjutkan?`,
                onConfirm: () => {
                    if (isBatchPendingAction(batchId)) return;

                    const previousBatchesSnapshot = batches;
                    setBatchPendingAction(batchId, true);
                    setBatches((currentBatches) =>
                        currentBatches.filter((batch) => !isSameEntityId(batch.id, batchId))
                    );

                    axios.delete(`/tag-batches/${batchId}`)
                        .then(() => {
                            showToast(`Data batch ${batchId} berhasil dihapus!`);
                        })
                        .catch((error) => {
                            setBatches(previousBatchesSnapshot);
                            const errors = error?.response?.data?.errors || {};
                            showToast(getFirstErrorMessage(errors, "Gagal menghapus batch tag."), "error");
                        })
                        .finally(() => {
                            setBatchPendingAction(batchId, false);
                        });
                }
            });
        };

        const submitBatchStatusChange = (batchId, nextStatus, suspendReason = null) => {
            if (isBatchPendingAction(batchId)) return;

            const previousBatchesSnapshot = batches;
            const normalizedReason = String(suspendReason ?? '').trim();
            const isSuspending = nextStatus === 'Suspended';

            setBatchPendingAction(batchId, true);
            setBatches((currentBatches) =>
                currentBatches.map((batch) =>
                    isSameEntityId(batch.id, batchId)
                        ? {
                            ...batch,
                            status: nextStatus,
                            suspendReason: isSuspending ? normalizedReason : '',
                        }
                        : batch
                )
            );

            axios.post(`/tag-batches/${batchId}/status`, {
                status: nextStatus,
                suspend_reason: isSuspending ? normalizedReason : null,
            })
                .then((response) => {
                    const savedBatch = normalizeBatchRecord(response?.data?.batch || {});
                    setBatches((currentBatches) =>
                        currentBatches.map((batch) =>
                            isSameEntityId(batch.id, batchId) ? savedBatch : batch
                        )
                    );
                    showToast(`Status batch berhasil diubah!`);
                })
                .catch((error) => {
                    setBatches(previousBatchesSnapshot);
                    const errors = error?.response?.data?.errors || {};
                    const fallbackMessage = String(error?.response?.data?.message || '').trim() || "Gagal mengubah status batch.";
                    showToast(getFirstErrorMessage(errors, fallbackMessage), "error");
                })
                .finally(() => {
                    setBatchPendingAction(batchId, false);
                });
        };

        const handleToggleBatchStatus = (batchId, currentStatus) => {
            if (isBatchPendingAction(batchId)) return;

            const isSuspending = currentStatus === 'Generated';
            const nextStatus = isSuspending ? 'Suspended' : 'Generated';
            setConfirmObj({
                isOpen: true,
                title: isSuspending ? "Suspend / Recall Batch?" : "Aktifkan Kembali Batch?",
                message: isSuspending
                    ? `PERINGATAN: Menonaktifkan batch akan membuat SEMUA tag di dalamnya berstatus INVALID/RECALL saat di-scan oleh pelanggan. Lanjutkan?`
                    : `Batch ${batchId} akan diaktifkan kembali dan tag di dalamnya akan kembali berstatus valid saat di-scan. Lanjutkan?`,
                onConfirm: () => {
                    if (isBatchPendingAction(batchId)) return;

                    if (isSuspending) {
                        setSuspendReasonInput('');
                        setSuspendReasonModal({
                            isOpen: true,
                            batchId: String(batchId),
                        });
                        return;
                    }

                    submitBatchStatusChange(batchId, nextStatus);
                }
            });
        };

        const handleConfirmSuspendWithReason = () => {
            const batchId = String(suspendReasonModal.batchId || '').trim();
            if (batchId === '') {
                closeSuspendReasonModal();
                return;
            }

            if (isBatchPendingAction(batchId)) return;

            const normalizedReason = String(suspendReasonInput || '').trim();
            if (normalizedReason === '') {
                showToast("Alasan suspend wajib diisi.", "error");
                return;
            }

            closeSuspendReasonModal();
            submitBatchStatusChange(batchId, 'Suspended', normalizedReason);
        };

        const handleDownloadBatchPdf = async (batchId) => {
            if (isBatchPendingAction(batchId)) return;
            setBatchPendingAction(batchId, true);

            try {
                const response = await axios.get(`/tag-batches/${batchId}/codes`);
                const batchTags = Array.isArray(response?.data?.codes) ? response.data.codes : [];
                if (batchTags.length === 0) {
                    showToast("Data tag untuk batch ini tidak ditemukan.", "error");
                    return;
                }

                const buildBatchPdfBlob = async (withKodeMonoFont) => {
                    const pdf = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: [310, 470], // 31 x 47 cm
                    });

                    let selectedFont = 'courier';
                    if (withKodeMonoFont) {
                        try {
                            const cssResponse = await fetch('https://fonts.googleapis.com/css2?family=Kode+Mono:wght@400&display=swap');
                            const cssText = await cssResponse.text();
                            const urlMatch = cssText.match(/url\((https:[^)]+)\)/i);
                            const fontUrl = urlMatch?.[1];

                            if (fontUrl) {
                                const fontResponse = await fetch(fontUrl);
                                const fontBuffer = await fontResponse.arrayBuffer();
                                const bytes = new Uint8Array(fontBuffer);
                                const chunkSize = 0x8000;
                                let binary = '';

                                for (let i = 0; i < bytes.length; i += chunkSize) {
                                    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
                                }

                                const base64 = btoa(binary);
                                pdf.addFileToVFS('KodeMono-Regular.ttf', base64);
                                pdf.addFont('KodeMono-Regular.ttf', 'KodeMono', 'normal');
                                selectedFont = 'KodeMono';
                            }
                        } catch {
                            selectedFont = 'courier';
                        }
                    }

                    const pageWidth = 310;
                    const pageHeight = 470;
                    const margin = 10;
                    const gap = 2; // gap 2 mm
                    const boxWidth = 22; // 2.2 cm
                    const boxHeight = 8; // 0.8 cm
                    const contentWidth = pageWidth - (margin * 2);
                    const contentHeight = pageHeight - (margin * 2);
                    const columns = Math.max(1, Math.floor((contentWidth + gap) / (boxWidth + gap)));
                    const rows = Math.max(1, Math.floor((contentHeight + gap) / (boxHeight + gap)));
                    const perPage = columns * rows;

                    pdf.setFont(selectedFont, 'normal');
                    pdf.setFontSize(12);
                    pdf.setDrawColor(30, 41, 59);
                    pdf.setTextColor(15, 23, 42);
                    pdf.setLineWidth(0.25);

                    batchTags.forEach((tag, index) => {
                        if (index > 0 && index % perPage === 0) {
                            pdf.addPage([310, 470], 'portrait');
                        }

                        const localIndex = index % perPage;
                        const row = Math.floor(localIndex / columns);
                        const column = localIndex % columns;
                        const x = margin + (column * (boxWidth + gap));
                        const y = margin + (row * (boxHeight + gap));
                        const codeText = String(tag?.code || '').trim();

                        pdf.rect(x, y, boxWidth, boxHeight, 'S'); // border solid
                        pdf.text(codeText, x + (boxWidth / 2), y + (boxHeight / 2) + 1.2, {
                            align: 'center',
                        });
                    });

                    return pdf.output('blob');
                };

                let blob;
                try {
                    blob = await buildBatchPdfBlob(true);
                } catch {
                    blob = await buildBatchPdfBlob(false);
                }

                const filename = `${batchId}.pdf`;
                const blobUrl = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                link.remove();

                window.open(blobUrl, '_blank', 'noopener,noreferrer');
                setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
                showToast(`File PDF ${filename} berhasil dibuat.`);
            } catch (error) {
                console.error('PDF batch generation failed:', error);
                const errors = error?.response?.data?.errors || {};
                showToast(getFirstErrorMessage(errors, "Gagal membuat PDF batch."), "error");
            } finally {
                setBatchPendingAction(batchId, false);
            }
        };

        const filteredBatches = batches.filter(b =>
            b.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
            b.productName.toLowerCase().includes(globalSearch.toLowerCase()) ||
            b.brandName.toLowerCase().includes(globalSearch.toLowerCase())
        ).sort((a, b) => {
            const dir = batchSort.direction === 'asc' ? 1 : -1;
            if (batchSort.key === 'id') return a.id.localeCompare(b.id) * dir;
            if (batchSort.key === 'product') return a.productName.localeCompare(b.productName) * dir;
            if (batchSort.key === 'qty') return (a.qty - b.qty) * dir;
            if (batchSort.key === 'status') {
                if (a.status === b.status) return 0;
                return (a.status === 'Generated' ? -1 : 1) * dir;
            }
            return 0;
        });
        const suspendReasonLength = String(suspendReasonInput || '').length;
        const suspendReasonWarningMessage = suspendReasonModal.batchId
            ? `PERINGATAN: Menonaktifkan batch akan membuat SEMUA tag di dalamnya berstatus INVALID/RECALL saat di-scan oleh pelanggan.`
            : 'PERINGATAN: Menonaktifkan batch akan membuat SEMUA tag di dalamnya berstatus INVALID/RECALL saat di-scan oleh pelanggan.';

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text={isBrandOwnerRole ? "Mode Brand Owner: Anda hanya dapat melihat riwayat batch Tag/QR Code milik brand Anda." : "Gunakan fitur ini untuk membuat batch Tag QR secara massal berbasis database. Saat ini mode yang aktif adalah kode verifikasi tanpa PIN."} />
                {!isBrandOwnerRole && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                            <QrCode size={18} className="text-[#C1986E]" /> Konfigurasi Batch Baru
                        </h3>
                        <form onSubmit={handleGenerateTags} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Pilih Produk (SKU)</label>
                                <select
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-white text-sm"
                                    value={tagConfig.productId}
                                    onChange={(e) => setTagConfig({ ...tagConfig, productId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Pilih Produk Terdaftar --</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.brandName})</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Jumlah Tag (Quantity)</label>
                                <input
                                    type="number"
                                    min="1" max="10000"
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm"
                                    value={tagConfig.quantity}
                                    onChange={(e) => setTagConfig({ ...tagConfig, quantity: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                            <h4 className="text-sm font-semibold text-slate-700 mb-2 border-b border-slate-200 pb-3">Pengaturan Tag & Keamanan</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Panjang PIN Acak</label>
                                    <select
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-white text-sm h-[42px]"
                                        value={tagConfig.randomLength}
                                        onChange={(e) => setTagConfig({ ...tagConfig, randomLength: Number(e.target.value) })}
                                    >
                                        <option value={5}>5 Karakter</option>
                                        <option value={6}>6 Karakter</option>
                                        <option value={7}>7 Karakter</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button type="submit" disabled={isSavingBatch} className="bg-[#C1986E] hover:bg-[#A37E58] text-white px-8 py-2.5 rounded-lg font-medium transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Hash size={18} /> Generate Batch Sekarang
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TABEL RIWAYAT BATCH */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto mt-6">
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 gap-4">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Layers size={18} className="text-[#C1986E]" /> Riwayat Batch Generate
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="batch-total-pill flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                <span className="batch-total-label text-xs font-medium text-slate-500">Total Tag Dibuat:</span>
                                <span className="batch-total-value text-sm font-bold text-[#C1986E]">
                                    {new Intl.NumberFormat('id-ID').format(filteredBatches.reduce((total, batch) => total + batch.qty, 0))}
                                </span>
                            </div>
                            <span className="batch-count-pill text-xs font-medium bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg">{filteredBatches.length} Batch</span>
                        </div>
                    </div>
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('id', batchSort, setBatchSort)}>
                                    <div className="flex items-center gap-2">Batch ID & Info <SortIcon columnKey="id" sortConfig={batchSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('product', batchSort, setBatchSort)}>
                                    <div className="flex items-center gap-2">Produk SKU <SortIcon columnKey="product" sortConfig={batchSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('qty', batchSort, setBatchSort)}>
                                    <div className="flex items-center gap-2">Jumlah & Kode <SortIcon columnKey="qty" sortConfig={batchSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('status', batchSort, setBatchSort)}>
                                    <div className="flex items-center gap-2">Status <SortIcon columnKey="status" sortConfig={batchSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBatches.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-slate-400 text-sm">Tidak ada riwayat batch yang ditemukan.</td></tr>
                            ) : (
                                filteredBatches.map(batch => {
                                    const isPending = isBatchPendingAction(batch.id);
                                    return (
                                    <tr key={batch.id} className={`transition-colors ${batch.status === 'Suspended' ? 'bg-slate-50' : 'hover:bg-slate-50'} ${isPending ? 'opacity-60' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-mono text-sm font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded inline-block">{batch.id}</p>
                                            </div>
                                            <p className="text-xs text-slate-500">{batch.date}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-800 text-sm">{batch.productName}</p>
                                            <p className="text-xs text-[#C1986E] font-medium">{batch.brandName}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-slate-700">{batch.qty} <span className="text-xs font-normal text-slate-500">Tag</span></p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium border border-blue-100">Panjang PIN Acak: {batch.settings.randomLength}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {batch.status === 'Generated' ? (
                                                <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit">
                                                    <CheckCircle2 size={12} /> Aktif
                                                </span>
                                            ) : (
                                                <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit">
                                                    <AlertCircle size={12} /> Suspended
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {isBrandOwnerRole ? (
                                                    <Tooltip text="Preview Batch" position="top">
                                                        <button
                                                            onClick={() => setSelectedBatchDetail(batch)}
                                                            className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all p-1.5 rounded-lg active:scale-95"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    </Tooltip>
                                                ) : (
                                                    <>
                                                        <Tooltip text={batch.status === 'Generated' ? "Suspend / Recall Batch" : "Aktifkan Kembali Batch"} position="top">
                                                            <button
                                                                disabled={isPending}
                                                                onClick={() => handleToggleBatchStatus(batch.id, batch.status)}
                                                                className={`p-1.5 rounded-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${batch.status === 'Generated' ? 'text-slate-400 hover:text-orange-600 hover:bg-orange-50' : 'text-red-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                                            >
                                                                <AlertCircle size={16} />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip text="Download PDF" position="top">
                                                            <button onClick={() => handleDownloadBatchPdf(batch.id)} className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all p-1.5 rounded-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed" disabled={batch.status === 'Suspended' || isPending}>
                                                                <Download size={16} />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip text="Hapus Seluruh Batch" position="top">
                                                            <button disabled={isPending} onClick={() => handleDeleteBatch(batch.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )})
                            )}
                        </tbody>
                    </table>
                </div>

                {typeof document !== 'undefined' && suspendReasonModal.isOpen && createPortal(
                    <div
                        className="fixed inset-0 z-[320] bg-black/50 backdrop-blur-md"
                        onClick={closeSuspendReasonModal}
                    >
                        <div className="h-full w-full overflow-y-auto">
                            <div className="min-h-full flex items-center justify-center p-4">
                                <div
                                    className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[96vh] max-h-[calc(100dvh-2rem)]"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <div className="bg-slate-50 border-b border-slate-100 p-5">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                                            <AlertCircle size={18} /> Alasan Suspend Batch
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Silakan isi alasan suspend agar tampil di preview Brand Owner dan detail aktivitas scan.
                                        </p>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                            <p className="text-sm font-medium text-red-800 leading-relaxed">
                                                {suspendReasonWarningMessage}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase">
                                                Alasan Suspend <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                rows={4}
                                                maxLength={1000}
                                                autoFocus
                                                dir="ltr"
                                                value={suspendReasonInput}
                                                onChange={(event) => {
                                                    setSuspendReasonInput(event.target.value);
                                                }}
                                                style={{ unicodeBidi: 'plaintext' }}
                                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm resize-y min-h-[110px] text-left"
                                                placeholder="Contoh: Ditemukan indikasi penyalahgunaan distribusi pada batch ini."
                                            />
                                            <div className="flex items-center justify-between">
                                                <p className="text-[11px] text-slate-500">
                                                    Alasan ini akan disimpan di data batch dan log scan.
                                                </p>
                                                <p className={`text-[11px] font-medium ${suspendReasonLength > 950 ? 'text-slate-600' : 'text-slate-400'}`}>
                                                    {suspendReasonLength}/1000
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={closeSuspendReasonModal}
                                            className="flex-1 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-all active:scale-95 text-sm"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleConfirmSuspendWithReason}
                                            className="flex-1 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm active:scale-95 text-sm"
                                        >
                                            Ya, Suspend Batch
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {selectedBatchDetail && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setSelectedBatchDetail(null)}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex justify-between items-center z-10 sticky top-0">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Eye size={18} className="text-[#C1986E]" /> Detail Batch Tag
                                </h3>
                                <button onClick={() => setSelectedBatchDetail(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all p-1.5 rounded-lg active:scale-95">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col md:flex-row gap-8 md:items-stretch">
                                    <div className="w-full md:w-1/3 flex flex-col gap-4 shrink-0">
                                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center shadow-inner">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Batch ID</p>
                                            <p className="font-mono text-sm font-bold text-slate-800 break-all">{selectedBatchDetail.id}</p>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1.5">Total Tag Batch</p>
                                            <p className="text-3xl font-extrabold text-blue-700 leading-none">
                                                {new Intl.NumberFormat('id-ID').format(Number(selectedBatchDetail.qty || 0))}
                                            </p>
                                            <p className="text-xs font-medium text-blue-600 mt-1">Tag Keamanan</p>
                                        </div>

                                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm md:flex-1">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Status Batch</p>
                                            {selectedBatchDetail.status === 'Generated' ? (
                                                <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1">
                                                    <CheckCircle2 size={12} /> Aktif
                                                </span>
                                            ) : (
                                                <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1">
                                                    <AlertCircle size={12} /> Suspended
                                                </span>
                                            )}
                                        </div>

                                    </div>

                                    <div className="w-full md:w-2/3 flex flex-col">
                                        <div className="pb-5 border-b border-slate-100 mb-5">
                                            <h4 className="font-extrabold text-2xl text-slate-800 leading-tight mb-3">{selectedBatchDetail.productName}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-[#C1986E] font-bold flex items-center gap-1.5 bg-[#C1986E]/10 w-fit px-3 py-1.5 rounded-lg border border-[#C1986E]/20">
                                                    <Tag size={15} /> {selectedBatchDetail.brandName || '-'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {selectedBatchDetail.status === 'Suspended' && (
                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Alasan Suspend</p>
                                                    <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap break-words leading-relaxed">
                                                        {selectedBatchDetail.suspendReason || '-'}
                                                    </p>
                                                </div>
                                            )}

                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                                    <Key size={14} className="text-slate-400" /> Rentang Kode Batch
                                                </p>
                                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-inner">
                                                    <p className="text-slate-700 font-mono text-xs break-all leading-relaxed">
                                                        {(selectedBatchDetail.firstCode || '-') + ' - ' + (selectedBatchDetail.lastCode || '-')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Tanggal Batch</p>
                                                    <p className="text-sm font-medium text-slate-700">{selectedBatchDetail.date || '-'}</p>
                                                </div>
                                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Panjang PIN Acak</p>
                                                    <p className="text-sm font-medium text-slate-700">{selectedBatchDetail?.settings?.randomLength || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end z-10 sticky bottom-0">
                                <button onClick={() => setSelectedBatchDetail(null)} className="px-8 py-2.5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 transition-all shadow-md active:scale-95 text-sm">
                                    Tutup Preview
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Berhasil Generate */}
                {isTagModalOpen && generatedQR && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setIsTagModalOpen(false)} // Fungsi tutup saat klik background
                    >
                        <div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col text-center"
                            onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
                        >
                            <div className="bg-emerald-50 p-6 flex flex-col items-center border-b border-emerald-100">
                                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/30">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="font-bold text-lg text-emerald-800">Generate Berhasil!</h3>
                                <p className="text-sm text-emerald-600 mt-1">{generatedQR.count} Tag telah dibuat untuk {generatedQR.productName}.</p>
                            </div>
                            <div className="p-6 bg-slate-50">
                                <p className="text-xs text-slate-500 mb-1 uppercase font-semibold">Batch ID</p>
                                <p className="font-mono text-sm bg-white border border-slate-200 py-2 rounded-lg text-slate-800 font-bold tracking-widest">{generatedQR.batchId}</p>
                                <p className="text-xs text-slate-500 mb-1 mt-4 uppercase font-semibold">Contoh Kode Verifikasi</p>
                                <p className="font-mono text-xs bg-white border border-slate-200 py-2 rounded-lg text-slate-800 font-bold tracking-wider">{generatedQR.code || '-'}</p>
                            </div>
                            <div className="p-4 flex gap-3">
                                <button onClick={() => setIsTagModalOpen(false)} className="flex-1 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-sm">Tutup</button>
                                <button onClick={() => { setIsTagModalOpen(false); handleDownloadBatchPdf(generatedQR.batchId); }} className="flex-1 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm active:scale-95 text-sm flex items-center justify-center gap-2">
                                    <Download size={16} /> Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return TagGenerator;
}
