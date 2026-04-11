import React from 'react';
import {
    Check,
    ChevronDown,
    ChevronRight,
    Database,
    FileText,
    Filter,
    Info,
    Key,
    Map,
    Package,
    Plus,
    Search,
    UploadCloud,
    X,
} from 'lucide-react';
import { resolveProductSpecSchema } from '../config/productCatalog';

const SearchableSingleSelect = ({
    actionText,
    creatable = false,
    createInputPlaceholder = 'Ketik nilai baru di sini...',
    disabled = false,
    noResultsText = 'Data tidak ditemukan.',
    onActionClick,
    onChange,
    options = [],
    placeholder = '-- Pilih --',
    required = false,
    searchPlaceholder = 'Cari...',
    value = '',
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchKeyword, setSearchKeyword] = React.useState('');
    const [isCreateMode, setIsCreateMode] = React.useState(false);
    const [newOption, setNewOption] = React.useState('');
    const rootRef = React.useRef(null);

    const selectedOption = options.find((option) => String(option.value) === String(value)) || null;
    const selectedLabel = selectedOption?.label || (String(value || '').trim() !== '' ? String(value) : placeholder);
    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    const normalizedNewOption = newOption.trim();
    const hasExactNewOptionMatch = options.some((option) => (
        option.label.toLowerCase() === normalizedNewOption.toLowerCase()
        || String(option.value).toLowerCase() === normalizedNewOption.toLowerCase()
    ));
    const canCreateOption = creatable && normalizedNewOption !== '' && !hasExactNewOptionMatch;
    const hasFooterActions = creatable || (actionText && onActionClick);

    const resetCreateState = () => {
        setIsCreateMode(false);
        setNewOption('');
    };

    React.useEffect(() => {
        if (!isOpen) return undefined;

        const handleClickOutside = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                setIsOpen(false);
                setSearchKeyword('');
                resetCreateState();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSelect = (nextValue) => {
        onChange(nextValue);
        setIsOpen(false);
        setSearchKeyword('');
        resetCreateState();
    };

    const handleToggle = () => {
        if (disabled) return;
        setIsOpen((prev) => {
            const nextState = !prev;
            if (!nextState) {
                setSearchKeyword('');
                resetCreateState();
            }
            return nextState;
        });
    };

    const handleAddNewConfirm = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!canCreateOption) return;
        handleSelect(normalizedNewOption);
    };

    return (
        <div ref={rootRef} className={`relative ${isOpen ? 'z-[160]' : 'z-0'}`}>
            <button
                type="button"
                onClick={handleToggle}
                disabled={disabled}
                data-required={required ? 'true' : 'false'}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 min-h-[52px] focus:outline-none focus:ring-2 focus:ring-[#C1986E]/50 focus:border-[#C1986E] transition-all text-sm bg-slate-50/50 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-3"
            >
                <span className={String(value || '').trim() !== '' ? 'text-[#B58653] font-semibold' : 'text-slate-400'}>
                    {selectedLabel}
                </span>
                <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-3 left-0 right-0 z-[170] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                    <div className="p-3 border-b border-slate-100">
                        <div className="flex items-center gap-2 border border-slate-200 focus-within:border-[#C1986E] focus-within:ring-2 focus-within:ring-[#C1986E]/20 rounded-xl px-3 py-2.5 transition-all bg-white">
                            <Search size={16} className="text-slate-400 flex-shrink-0" />
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(event) => setSearchKeyword(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Escape') {
                                        setIsOpen(false);
                                        setSearchKeyword('');
                                        resetCreateState();
                                    }
                                }}
                                placeholder={searchPlaceholder}
                                className="w-full bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 focus:ring-0 p-0"
                            />
                        </div>
                    </div>

                    <div className={`overflow-y-auto p-2 custom-scrollbar ${hasFooterActions ? 'max-h-48' : 'max-h-56'}`}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = String(option.value) === String(value);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between gap-3 ${isSelected ? 'bg-[#C1986E]/10 text-[#B58653] font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        <span>{option.label}</span>
                                        {isSelected && <Check size={16} className="text-[#C1986E] flex-shrink-0" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-3 py-4 text-sm text-slate-400 text-center">{noResultsText}</div>
                        )}
                    </div>

                    {creatable && (
                        <div className="border-t border-slate-100 p-3 bg-slate-50/60 space-y-2">
                            {!isCreateMode && (
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setIsCreateMode(true);
                                        setNewOption('');
                                    }}
                                    className="w-full px-4 py-2.5 text-[#C1986E] hover:bg-[#C1986E]/5 transition-colors text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} />
                                    tambah nilai atribut
                                </button>
                            )}

                            {isCreateMode && (
                                <div className="space-y-2" onClick={(event) => event.stopPropagation()}>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder={createInputPlaceholder}
                                            className="flex-1 text-sm border border-[#C1986E]/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C1986E] bg-white shadow-inner"
                                            value={newOption}
                                            onChange={(event) => setNewOption(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    handleAddNewConfirm(event);
                                                }
                                            }}
                                            onClick={(event) => event.stopPropagation()}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddNewConfirm}
                                            disabled={!canCreateOption}
                                            aria-label="Simpan nilai atribut"
                                            title="Simpan nilai atribut"
                                            className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-[#C1986E] text-white hover:bg-[#A37E58] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                resetCreateState();
                                            }}
                                            aria-label="Batal tambah nilai atribut"
                                            title="Batal tambah nilai atribut"
                                            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    {normalizedNewOption !== '' && hasExactNewOptionMatch && (
                                        <p className="text-[11px] text-amber-600 dark:text-amber-400">
                                            Nilai atribut sudah tersedia, pilih dari daftar.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {actionText && onActionClick && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                setSearchKeyword('');
                                resetCreateState();
                                onActionClick();
                            }}
                            className="w-full border-t border-slate-100 px-4 py-3 text-[#C1986E] hover:bg-[#C1986E]/5 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                        >
                            <Plus size={16} />
                            {actionText}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const productFormContextRef = { current: null };

const ProductForm = () => {
    const context = productFormContextRef.current;
    if (!context) return null;

    const {
        activeFormSection,
        brands,
        categories,
        catSearchKeyword,
        handleCancelEditProduct,
        handleSaveProduct,
        isBrandActive,
        isCategoryModalOpen,
        isSavingProduct,
        openCreateBrandModal,
        PRODUCT_SPEC_SCHEMA,
        productInput,
        productImagePreview,
        handleProductImageInputChange,
        setActiveFormSection,
        setCatSearchKeyword,
        setIsCategoryModalOpen,
        setProductInput,
        setTempCategory,
        tempCategory,
        Tooltip,
    } = context;
    // --- SAFEGUARD --- Memastikan dynamicFields selalu berupa objek
    const currentDynamicFields = productInput.dynamicFields || {};
    const [isSpecExpanded, setIsSpecExpanded] = React.useState(false);
    const [extendedSpecMaxHeight, setExtendedSpecMaxHeight] = React.useState(0);
    const extendedSpecFieldsRef = React.useRef(null);
    const hasSelectedCategory = Boolean(productInput.catL1);
    const specInputClassName = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 min-h-[46px] focus:outline-none focus:ring-2 focus:ring-[#C1986E]/50 focus:border-[#C1986E] transition-all text-sm text-slate-700 bg-slate-50/50 hover:bg-white placeholder:text-slate-400';
    const activeBrandOptions = brands
        .filter((brand) => isBrandActive(brand.status))
        .map((brand) => ({
            value: String(brand.id),
            label: brand.name,
        }));
    const normalizeSelectOptions = (options = []) =>
        options
            .map((option) => {
                if (option && typeof option === 'object') {
                    const rawValue = option.value ?? option.id ?? option.label ?? option.name;
                    const rawLabel = option.label ?? option.name ?? option.value ?? option.id;
                    return {
                        value: String(rawValue ?? '').trim(),
                        label: String(rawLabel ?? '').trim(),
                    };
                }

                const value = String(option ?? '').trim();
                return { value, label: value };
            })
            .filter((option) => option.value !== '' && option.label !== '');
    const updateDynamicField = (fieldName, value) => {
        setProductInput({
            ...productInput,
            dynamicFields: {
                ...currentDynamicFields,
                [fieldName]: value,
            },
        });
    };
    const selectedCategoryNodes = React.useMemo(() => {
        const level1 = categories.find((item) => String(item.id) === String(productInput.catL1));
        const level2 = level1?.subCategories?.find((item) => String(item.id) === String(productInput.catL2));
        const level3 = level2?.subSubCategories?.find((item) => String(item.id) === String(productInput.catL3));
        return { level1, level2, level3 };
    }, [categories, productInput.catL1, productInput.catL2, productInput.catL3]);
    const activeSpecSchema = React.useMemo(() => resolveProductSpecSchema(PRODUCT_SPEC_SCHEMA, {
        catL2Id: productInput.catL2,
        catL3Id: productInput.catL3,
        categoryLevel2Name: selectedCategoryNodes.level2?.name || '',
        categoryLevel3Name: selectedCategoryNodes.level3?.name || '-',
    }), [PRODUCT_SPEC_SCHEMA, productInput.catL2, productInput.catL3, selectedCategoryNodes]);
    const getFullWidthIndexes = React.useCallback((fields = []) => {
        const fullWidthIndexes = new Set();
        let pendingSingleIndex = null;
        let rowUsage = 0;

        fields.forEach((field, index) => {
            const span = Number(field.colSpan) === 2 ? 2 : 1;
            if (span === 2) {
                if (rowUsage === 1 && pendingSingleIndex !== null) {
                    fullWidthIndexes.add(pendingSingleIndex);
                }
                rowUsage = 0;
                pendingSingleIndex = null;
                return;
            }

            if (rowUsage === 0) {
                rowUsage = 1;
                pendingSingleIndex = index;
            } else {
                rowUsage = 0;
                pendingSingleIndex = null;
            }
        });

        if (rowUsage === 1 && pendingSingleIndex !== null) {
            fullWidthIndexes.add(pendingSingleIndex);
        }

        return fullWidthIndexes;
    }, []);
    const openNativeDatePicker = (event) => {
        if (typeof event?.target?.showPicker !== 'function') return;
        try {
            event.target.showPicker();
        } catch (_) {
            // ignore: some browsers block showPicker outside strict user gesture contexts
        }
    };
    React.useEffect(() => {
        setIsSpecExpanded(false);
        setExtendedSpecMaxHeight(0);
    }, [productInput.catL2, productInput.catL3]);
    React.useEffect(() => {
        if (!isSpecExpanded || !extendedSpecFieldsRef.current) {
            setExtendedSpecMaxHeight(0);
            return;
        }

        setExtendedSpecMaxHeight(extendedSpecFieldsRef.current.scrollHeight);
    }, [isSpecExpanded, productInput.catL2]);
    React.useEffect(() => {
        if (typeof ResizeObserver === 'undefined' || !extendedSpecFieldsRef.current) {
            return undefined;
        }

        const observer = new ResizeObserver(() => {
            if (isSpecExpanded && extendedSpecFieldsRef.current) {
                setExtendedSpecMaxHeight(extendedSpecFieldsRef.current.scrollHeight);
            }
        });

        observer.observe(extendedSpecFieldsRef.current);
        return () => observer.disconnect();
    }, [isSpecExpanded, productInput.catL2]);
    const renderSpecField = (field, forceFullWidth = false) => {
        const fieldValue = currentDynamicFields[field.name] || '';
        const isRequired = Boolean(field.required);
        const fieldOptions = normalizeSelectOptions(field.options || []);
        const shouldSpanFull = Number(field.colSpan) === 2 || forceFullWidth;

        return (
            <div key={field.name} className={`space-y-1.5 ${shouldSpanFull ? 'md:col-span-2' : ''}`}>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {field.label} {isRequired && <span className="text-red-500">*</span>}
                </label>

                {field.type === 'searchable' ? (
                    <SearchableSingleSelect
                        options={fieldOptions}
                        value={fieldValue}
                        onChange={(nextValue) => updateDynamicField(field.name, nextValue)}
                        placeholder={field.placeholder || '-- Pilih Opsi --'}
                        searchPlaceholder={field.searchPlaceholder || 'Cari opsi...'}
                        disabled={isSavingProduct}
                        noResultsText="Opsi tidak ditemukan."
                    />
                ) : field.type === 'searchable-creatable' ? (
                    <SearchableSingleSelect
                        options={fieldOptions}
                        value={fieldValue}
                        onChange={(nextValue) => updateDynamicField(field.name, nextValue)}
                        placeholder={field.placeholder || '-- Pilih atau ketik nilai --'}
                        searchPlaceholder={field.searchPlaceholder || 'Cari atau tambah nilai...'}
                        createInputPlaceholder={field.createInputPlaceholder || 'Ketik nilai baru di sini...'}
                        disabled={isSavingProduct}
                        creatable
                        noResultsText="Belum ada opsi. Ketik lalu pilih tambah nilai."
                    />
                ) : field.type === 'select' ? (
                    <select
                        className={`${specInputClassName} cursor-pointer ${fieldValue ? 'text-slate-700' : 'text-slate-400'}`}
                        value={fieldValue}
                        onChange={(event) => updateDynamicField(field.name, event.target.value)}
                        required={isRequired}
                    >
                        <option value="">-- Pilih Opsi --</option>
                        {fieldOptions.map((option) => (
                            <option key={`${field.name}-${option.value}`} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                ) : field.type === 'multi-create' ? (
                    <>
                        <input
                            type="text"
                            list={`spec-option-list-${field.name}`}
                            placeholder={field.placeholder || 'Pisahkan beberapa nilai dengan koma'}
                            className={specInputClassName}
                            value={fieldValue}
                            onChange={(event) => updateDynamicField(field.name, event.target.value)}
                            required={isRequired}
                        />
                        {fieldOptions.length > 0 && (
                            <datalist id={`spec-option-list-${field.name}`}>
                                {fieldOptions.map((option) => (
                                    <option key={`${field.name}-suggestion-${option.value}`} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </datalist>
                        )}
                        <p className="text-[10px] text-slate-400">Pisahkan beberapa nilai dengan koma.</p>
                    </>
                ) : field.type === 'date' ? (
                    <input
                        type="date"
                        className={`${specInputClassName} spec-date-input cursor-pointer ${fieldValue ? 'date-has-value text-slate-700' : 'text-slate-400'}`}
                        value={fieldValue}
                        onChange={(event) => updateDynamicField(field.name, event.target.value)}
                        onClick={openNativeDatePicker}
                        onFocus={openNativeDatePicker}
                        required={isRequired}
                    />
                ) : (
                    <input
                        type="text"
                        placeholder={field.placeholder}
                        className={specInputClassName}
                        value={fieldValue}
                        onChange={(event) => updateDynamicField(field.name, event.target.value)}
                        required={isRequired}
                    />
                )}
            </div>
        );
    };

        // --- HELPER SCROLL KE SEKSI FORM ---
        const scrollToSection = (sectionId) => {
            setActiveFormSection(sectionId);
            const element = document.getElementById(`form-${sectionId}`);
            if (element) {
                // Karena wadah utama sekarang adalah overflow-y-auto, kita gunakan scrollIntoView
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };

        // --- LOGIKA UNTUK MODAL KATEGORI ---
        const getFlattenedCategories = () => {
            let paths = [];
            categories.forEach(c1 => {
                c1.subCategories.forEach(c2 => {
                    c2.subSubCategories.forEach(c3 => {
                        if (!catSearchKeyword ||
                            c1.name.toLowerCase().includes(catSearchKeyword.toLowerCase()) ||
                            c2.name.toLowerCase().includes(catSearchKeyword.toLowerCase()) ||
                            c3.name.toLowerCase().includes(catSearchKeyword.toLowerCase())) {
                            paths.push({ l1: c1.id, l2: c2.id, l3: c3.id, path: `${c1.name} > ${c2.name} > ${c3.name}` });
                        }
                    });
                });
            });
            return paths;
        };

        const getSelectedCategoryText = (l1, l2, l3) => {
            if (!l1) return "Pilih Kategori Produk";
            const c1 = categories.find(c => c.id == l1);
            const c2 = c1?.subCategories.find(c => c.id == l2);
            const c3 = c2?.subSubCategories.find(c => c.id == l3);
            if (!c1) return "Kategori Tidak Valid";
            return `${c1.name}${c2 ? ` > ${c2.name}` : ''}${c3 ? ` > ${c3.name}` : ''}`;
        };

        const handleConfirmCategory = () => {
            setProductInput({
                ...productInput,
                catL1: tempCategory.l1,
                catL2: tempCategory.l2,
                catL3: tempCategory.l3,
                // Reset dynamic fields jika kategori berubah
                dynamicFields: (productInput.catL2 != tempCategory.l2) ? {} : productInput.dynamicFields
            });
            setIsCategoryModalOpen(false);
        };

        const openCategoryModal = () => {
            setTempCategory({ l1: productInput.catL1 || '', l2: productInput.catL2 || '', l3: productInput.catL3 || '' });
            setCatSearchKeyword('');
            setIsCategoryModalOpen(true);
        };

        return (
            <div className="mt-0 md:mt-0 pb-20">

                {/* Header Form & Navigasi Sticky - Full Width sejajar dengan Buttons */}
                <div className="sticky top-0 z-[100] bg-white border-b border-slate-200 -mx-4 md:-mx-8 px-4 md:px-8 mb-8 shadow-sm">
                    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 md:py-4">

                        {/* Tab Navigasi */}
                        <div className="flex gap-6 overflow-x-auto hide-scrollbar-mobile w-full sm:w-auto">
                            <button onClick={(e) => { e.preventDefault(); scrollToSection('info'); }} className={`pb-3 pt-1 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeFormSection === 'info' ? 'border-[#C1986E] text-[#C1986E]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Informasi Produk</button>
                            <button onClick={(e) => { e.preventDefault(); scrollToSection('spec'); }} className={`pb-3 pt-1 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeFormSection === 'spec' ? 'border-[#C1986E] text-[#C1986E]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Spesifikasi</button>
                            <button onClick={(e) => { e.preventDefault(); scrollToSection('desc'); }} className={`pb-3 pt-1 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeFormSection === 'desc' ? 'border-[#C1986E] text-[#C1986E]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Deskripsi</button>
                        </div>

                        {/* Buttons Action */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button type="button" onClick={handleCancelEditProduct} disabled={isSavingProduct} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-sm hidden sm:block disabled:opacity-50 disabled:cursor-not-allowed">Batal</button>
                            <button onClick={handleSaveProduct} disabled={isSavingProduct} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-white bg-[#C1986E] hover:bg-[#A37E58] transition-all shadow-md active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                <Package size={16} /> {isSavingProduct ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Pembungkus Max Width untuk Area Form Utama */}
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSaveProduct} className="space-y-8 flex flex-col">

                        {/* BAGIAN 1: INFORMASI PRODUK */}
                        {/* scroll-mt-44 digunakan agar judul form tidak tertutup navbar sticky saat di scroll otomatis */}
                        <div id="form-info" className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 scroll-mt-44">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base border-b border-slate-100 pb-3">
                                <Info size={18} className="text-[#C1986E]" /> Informasi Dasar Produk
                            </h3>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Kiri: Upload Gambar (Rasio 1:1) */}
                                <div className="w-full md:w-56 flex-shrink-0 space-y-2">
                                    <label className="w-full aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-[#C1986E] transition-all group bg-slate-50/50 p-4 text-center relative overflow-hidden">
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            disabled={isSavingProduct}
                                            onChange={handleProductImageInputChange}
                                        />

                                        {productImagePreview ? (
                                            <img src={productImagePreview} alt="Preview produk" className="absolute inset-0 h-full w-full object-cover" />
                                        ) : (
                                            <>
                                                <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                                    <UploadCloud size={28} className="text-slate-400 group-hover:text-[#C1986E]" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-600 mb-1">Pilih / Tarik Foto</span>
                                            </>
                                        )}
                                    </label>
                                    <div className="text-[10px] text-slate-400 text-center leading-relaxed">
                                        Format: JPG, PNG, WEBP<br />Ukuran Maksimal: 1MB<br />Rasio Gambar: 1:1 (Persegi)
                                    </div>
                                </div>

                                {/* Kanan: Form Inputan Utama */}
                                <div className="flex-1 w-full space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nama Produk <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="Contoh: Sabun Cuci Muka Glowing 100ml"
                                            maxLength={255}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1986E]/50 focus:border-[#C1986E] transition-all text-sm bg-slate-50/50 hover:bg-white"
                                            value={productInput.name}
                                            onChange={(e) => setProductInput({ ...productInput, name: e.target.value })}
                                            required
                                        />
                                        <div className="text-right text-[10px] text-slate-400">{productInput.name.length}/255 Karakter</div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                                            <span>Kode SKU <span className="text-red-500">*</span></span>
                                            <Tooltip text="Stock Keeping Unit (Kode Unik Internal Produk)"><Info size={14} className="text-slate-400 cursor-help" /></Tooltip>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Contoh: GLW-FW-100"
                                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1986E]/50 focus:border-[#C1986E] transition-all text-sm font-mono uppercase bg-slate-50/50 hover:bg-white"
                                            value={productInput.skuCode || ''}
                                            onChange={(e) => setProductInput({ ...productInput, skuCode: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5 relative pt-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Kategori Produk <span className="text-red-500">*</span></label>
                                        <div
                                            onClick={openCategoryModal}
                                            className={`w-full border rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer transition-all text-sm group ${hasSelectedCategory ? 'border-[#C1986E] bg-[#C1986E]/5 text-[#C1986E]' : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#C1986E]/50 text-slate-500'}`}
                                        >
                                            <div className="flex flex-col">
                                                {hasSelectedCategory ? (
                                                    <>
                                                        <span className="font-semibold text-slate-800">{getSelectedCategoryText(productInput.catL1, productInput.catL2, productInput.catL3).split(' > ').pop() || getSelectedCategoryText(productInput.catL1, productInput.catL2, productInput.catL3)}</span>
                                                        <span className="text-[10px] text-[#C1986E] mt-0.5">{getSelectedCategoryText(productInput.catL1, productInput.catL2, productInput.catL3)}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400">Klik untuk mengatur kategori...</span>
                                                )}
                                            </div>
                                            <ChevronRight size={18} className={`transition-transform group-hover:translate-x-1 ${hasSelectedCategory ? 'text-[#C1986E]' : 'text-slate-400'}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BAGIAN 2: SPESIFIKASI DINAMIS */}
                        <div id="form-spec" className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 scroll-mt-44">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base border-b border-slate-100 pb-3">
                                <Database size={18} className="text-[#C1986E]" /> Spesifikasi Produk
                            </h3>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                    Brand / Merk <span className="text-red-500">*</span>
                                </label>
                                <SearchableSingleSelect
                                    options={activeBrandOptions}
                                    value={productInput.brandId || ''}
                                    onChange={(selectedBrandId) => setProductInput({ ...productInput, brandId: selectedBrandId })}
                                    placeholder="-- Pilih Brand Terdaftar --"
                                    searchPlaceholder="Cari brand..."
                                    required
                                    disabled={isSavingProduct}
                                    noResultsText="Brand tidak ditemukan."
                                    actionText="belum ada brand / merk ? daftarkan disini"
                                    onActionClick={() => {
                                        openCreateBrandModal({ source: 'product_form' });
                                    }}
                                />
                            </div>

                            {activeSpecSchema ? (() => {
                                const schema = activeSpecSchema;
                                const IconCmp = schema.icon;
                                const primaryFields = schema.primaryFields || schema.fields || [];
                                const extendedFields = schema.extendedFields || [];
                                const primaryFullWidthIndexes = getFullWidthIndexes(primaryFields);
                                const extendedFullWidthIndexes = getFullWidthIndexes(extendedFields);
                                return (
                                    <div className="rounded-xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-300 border border-slate-200 bg-slate-50">
                                        <h4 className="font-bold flex items-center gap-2 text-sm border-b pb-3 text-slate-700 border-slate-200">
                                            <IconCmp size={16} /> {schema.title}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {primaryFields.map((field, index) => renderSpecField(field, primaryFullWidthIndexes.has(index)))}
                                        </div>

                                        {extendedFields.length > 0 && (
                                            <div className="space-y-0">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsSpecExpanded((prev) => !prev)}
                                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#B58653] hover:text-[#A37E58] transition-colors"
                                                >
                                                    <span>{isSpecExpanded ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak'}</span>
                                                    <ChevronDown
                                                        size={16}
                                                        className={`transition-transform duration-300 ${isSpecExpanded ? 'rotate-180' : ''}`}
                                                    />
                                                </button>

                                                <div
                                                    className={`${isSpecExpanded ? 'overflow-visible' : 'overflow-hidden'} transition-[max-height,opacity,margin-top] duration-300 ease-in-out`}
                                                    style={{
                                                        maxHeight: isSpecExpanded ? `${extendedSpecMaxHeight}px` : '0px',
                                                        opacity: isSpecExpanded ? 1 : 0,
                                                        marginTop: isSpecExpanded ? '0.5rem' : '0px',
                                                    }}
                                                    aria-hidden={!isSpecExpanded}
                                                >
                                                        <div ref={extendedSpecFieldsRef} className="pt-1">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                                {extendedFields.map((field, index) => renderSpecField(field, extendedFullWidthIndexes.has(index)))}
                                                            </div>
                                                        </div>
                                                    </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })() : (
                                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                                    <Database size={20} className="text-slate-300" />
                                    <p>Silakan pilih Kategori Produk di atas untuk memunculkan spesifikasi tambahan.</p>
                                </div>
                            )}
                        </div>

                        {/* BAGIAN 3: DESKRIPSI */}
                        <div id="form-desc" className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4 scroll-mt-44">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base border-b border-slate-100 pb-3">
                                <FileText size={18} className="text-[#C1986E]" /> Deskripsi Produk
                            </h3>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                                    <span>Keterangan Detail / Manfaat / Panduan Penggunaan</span>
                                    <span className="text-[10px] text-slate-400 font-normal normal-case bg-slate-100 px-2 py-0.5 rounded">Opsional</span>
                                </label>
                                <textarea
                                    rows="6"
                                    placeholder="Tuliskan keterangan detail, manfaat, komposisi (ingredients), atau cara penggunaan produk yang nantinya dapat dibaca oleh pelanggan saat melakukan verifikasi..."
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1986E]/50 focus:border-[#C1986E] transition-all resize-y text-sm bg-slate-50/50 hover:bg-white leading-relaxed"
                                    value={productInput.description}
                                    onChange={(e) => setProductInput({ ...productInput, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* --- MODAL PICKER KATEGORI --- */}
                {isCategoryModalOpen && (
                    <div
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in"
                        onClick={() => setIsCategoryModalOpen(false)}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh] sm:h-[70vh] animate-in zoom-in-95"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header & Search */}
                            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-2 flex-1 shadow-sm focus-within:border-[#C1986E] focus-within:ring-1 focus-within:ring-[#C1986E] transition-all">
                                    <Search size={18} className="text-slate-400 flex-shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Cari kategori... (Contoh: Parfum, Wajah)"
                                        className="bg-transparent border-none outline-none text-sm w-full focus:ring-0"
                                        value={catSearchKeyword}
                                        onChange={(e) => setCatSearchKeyword(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <button onClick={() => setIsCategoryModalOpen(false)} className="p-2.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-xl transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-hidden bg-white flex flex-col relative">
                                {catSearchKeyword ? (
                                    /* Tampilan Pencarian */
                                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1">
                                        {getFlattenedCategories().length > 0 ? (
                                            getFlattenedCategories().map(item => (
                                                <div
                                                    key={item.path}
                                                    onClick={() => setTempCategory({ l1: item.l1, l2: item.l2, l3: item.l3 })}
                                                    className={`p-3 sm:px-4 rounded-xl cursor-pointer text-sm border transition-all ${tempCategory.l3 === item.l3 ? 'bg-[#C1986E]/10 border-[#C1986E]/30 text-[#C1986E] font-semibold' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200'}`}
                                                >
                                                    {item.path}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-slate-400 p-8 text-sm">Kategori tidak ditemukan.</div>
                                        )}
                                    </div>
                                ) : (
                                    /* Tampilan Cascading 3 Kolom */
                                    <div className="flex-1 flex overflow-hidden">
                                        {/* Kolom 1 */}
                                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar border-r border-slate-100 hide-scrollbar-mobile">
                                            <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-2">1. Induk Kategori</h5>
                                            {categories.map(c1 => (
                                                <div
                                                    key={c1.id}
                                                    onClick={() => setTempCategory({ l1: c1.id, l2: '', l3: '' })}
                                                    className={`p-3 rounded-xl flex justify-between items-center cursor-pointer text-sm mb-1 transition-all ${tempCategory.l1 == c1.id ? 'bg-slate-800 text-white font-medium shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                                                >
                                                    <span>{c1.name}</span>
                                                    <ChevronRight size={14} className={tempCategory.l1 == c1.id ? 'text-slate-400' : 'text-slate-300 opacity-0 group-hover:opacity-100'} />
                                                </div>
                                            ))}
                                        </div>
                                        {/* Kolom 2 */}
                                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar border-r border-slate-100 bg-slate-50/30 hide-scrollbar-mobile">
                                            <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-2">2. Sub Kategori</h5>
                                            {!tempCategory.l1 && <p className="text-xs text-slate-400 px-2 italic">Pilih Induk Kategori dulu</p>}
                                            {tempCategory.l1 && categories.find(c => c.id == tempCategory.l1)?.subCategories.map(c2 => (
                                                <div
                                                    key={c2.id}
                                                    onClick={() => setTempCategory({ ...tempCategory, l2: c2.id, l3: '' })}
                                                    className={`p-3 rounded-xl flex justify-between items-center cursor-pointer text-sm mb-1 transition-all ${tempCategory.l2 == c2.id ? 'bg-white border border-[#C1986E] text-[#C1986E] font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-200/50 border border-transparent'}`}
                                                >
                                                    <span>{c2.name}</span>
                                                    <ChevronRight size={14} className={tempCategory.l2 == c2.id ? 'text-[#C1986E]/50' : 'text-slate-300 opacity-0 group-hover:opacity-100'} />
                                                </div>
                                            ))}
                                        </div>
                                        {/* Kolom 3 */}
                                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar bg-slate-50 hide-scrollbar-mobile">
                                            <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-2">3. Varian Akhir</h5>
                                            {!tempCategory.l2 && <p className="text-xs text-slate-400 px-2 italic">Pilih Sub Kategori dulu</p>}
                                            {tempCategory.l2 && categories.find(c => c.id == tempCategory.l1)?.subCategories.find(s => s.id == tempCategory.l2)?.subSubCategories.map(c3 => (
                                                <div
                                                    key={c3.id}
                                                    onClick={() => setTempCategory({ ...tempCategory, l3: c3.id })}
                                                    className={`p-3 rounded-xl cursor-pointer text-sm mb-1 transition-all ${tempCategory.l3 == c3.id ? 'bg-[#C1986E] text-white font-bold shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-[#C1986E]/50'}`}
                                                >
                                                    {c3.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <div className="text-sm w-full sm:w-auto">
                                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Kategori Terpilih:</span>
                                    <div className="font-semibold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 break-words line-clamp-2">
                                        {getSelectedCategoryText(tempCategory.l1, tempCategory.l2, tempCategory.l3)}
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button onClick={() => setIsCategoryModalOpen(false)} className="flex-1 sm:flex-none px-6 py-3 sm:py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Batal</button>
                                    <button
                                        onClick={handleConfirmCategory}
                                        disabled={!tempCategory.l1}
                                        className="flex-1 sm:flex-none px-6 py-3 sm:py-2.5 rounded-xl text-sm font-bold text-white bg-[#C1986E] hover:bg-[#A37E58] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                    >
                                        Konfirmasi
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    );
};

export default function createProductForm(context) {
    productFormContextRef.current = context;
    return ProductForm;
}
