import React, { useState, useEffect, useRef, startTransition } from 'react';
import { flushSync } from 'react-dom';
import {
    Building2,
    Search,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    CheckCircle2,
    Edit,
    LogOut,
    Moon,
    Sun,
    UploadCloud,
    X,
} from 'lucide-react';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    DASHBOARD_ITEM,
    MASTER_DATA_ITEMS,
    SYSTEM_ITEMS
} from './AdminPanel/Sidebar';
import createAdminPanelViews from './AdminPanel/Views/createAdminPanelViews';
import { PRODUCT_SPEC_SCHEMA, resolveProductSpecSchema } from './AdminPanel/config/productCatalog';
import StatCard from './AdminPanel/components/StatCard';
import PageAlert from './AdminPanel/components/PageAlert';
import ToggleSwitch from './AdminPanel/components/ToggleSwitch';
import Tooltip from './AdminPanel/components/Tooltip';
import LeafletMap from './AdminPanel/components/LeafletMap';
import SortIcon from './AdminPanel/components/SortIcon';

export default function AdminPanel({
    databaseBrands,
    databaseCategories,
    databaseUsers,
    databaseTagBatches,
    databaseProducts,
    databaseScanLogs,
    databaseScanActivitiesCount,
    securitySettings,
}) {
    const authUser = usePage().props?.auth?.user || null;
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMasterDataOpen, setIsMasterDataOpen] = useState(true);
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem('mki-admin-theme') === 'dark';
    });

    // --- STATE ALERT & MODAL KONFIRMASI (GLOBAL) ---
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
    const [confirmObj, setConfirmObj] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const toastTimeoutRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem('mki-admin-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const showToast = (message, type = 'success') => {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
            toastTimeoutRef.current = null;
        }

        flushSync(() => {
            setToast({ isOpen: true, message, type });
        });

        toastTimeoutRef.current = setTimeout(() => {
            setToast((prev) => ({ ...prev, isOpen: false }));
            toastTimeoutRef.current = null;
        }, 3000);
    };
    const MAX_IMAGE_UPLOAD_SIZE_BYTES = 1024 * 1024;
    const validateImageUploadSize = (file, label = 'File gambar') => {
        if (!file) return false;
        if (Number(file.size || 0) <= MAX_IMAGE_UPLOAD_SIZE_BYTES) {
            return true;
        }

        showToast(`${label} maksimal 1 MB.`, 'error');
        return false;
    };

    // --- STATE MODAL UTAMA ---
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedProductDetail, setSelectedProductDetail] = useState(null);
    const [selectedBatchDetail, setSelectedBatchDetail] = useState(null);
    const [suspendReasonModal, setSuspendReasonModal] = useState({
        isOpen: false,
        batchId: '',
    });

    // --- STATE MODAL PICKER KATEGORI (BARU) ---
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [catSearchKeyword, setCatSearchKeyword] = useState('');
    const [tempCategory, setTempCategory] = useState({ l1: '', l2: '', l3: '' });
    const [activeFormSection, setActiveFormSection] = useState('info'); // Untuk active state sticky menu

    // --- STATE PENCARIAN & SORTING ---
    const [globalSearch, setGlobalSearch] = useState('');
    const [brandSort, setBrandSort] = useState({ key: 'id', direction: 'desc' });
    const [productSort, setProductSort] = useState({ key: 'id', direction: 'desc' });
    const [userSort, setUserSort] = useState({ key: 'id', direction: 'desc' });
    const [batchSort, setBatchSort] = useState({ key: 'id', direction: 'desc' });
    const [scanSort, setScanSort] = useState({ key: 'time', direction: 'desc' });

    // Helper handler untuk klik header tabel
    const handleSortChange = (key, sortConfig, setSortConfig) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const handleLogout = () => {
        setConfirmObj({
            isOpen: true,
            title: "Keluar Sistem?",
            message: "Sesi Anda akan diakhiri dan harus login kembali untuk mengakses halaman ini. Lanjutkan?",
            onConfirm: () => {
                router.post('/logout', {}, {
                    onError: () => {
                        showToast("Gagal logout. Silakan coba lagi.", "error");
                    }
                });
            }
        });
    };

    // --- HELPER UNTUK JUDUL HALAMAN (HEADER) ---
    const getPageTitle = (tab) => {
        switch (tab) {
            case 'dashboard': return 'Dashboard';
            case 'scan_history': return 'Aktivitas Scan';
            case 'brand': return 'Brand';
            case 'categories': return 'Kategori Produk';
            case 'product': return 'SKU Produk';
            case 'product_form': return editingProductId ? 'Edit SKU Produk' : 'Tambah SKU Baru';
            case 'tags': return 'Tag/QR Code';
            case 'users': return 'Users & Roles';
            case 'settings': return 'Pengaturan';
            default: return 'Dashboard';
        }
    };

    // --- STATE DATA ---
    const normalizeBrandStatus = (status) => (
        status === 1 || status === '1' || status === true || status === 'Aktif' ? 1 : 0
    );
    const normalizeUserStatus = (status) => (
        status === 1 || status === '1' || status === true || status === 'Aktif' ? 1 : 0
    );
    const isUserActive = (status) => normalizeUserStatus(status) === 1;
    const normalizeUserRole = (role) => role === 'Super Admin' ? 'Super Admin' : 'Brand Owner';
    const normalizeUserRecord = (user) => ({
        ...user,
        name: user?.name || '',
        email: user?.email || '',
        role: normalizeUserRole(user?.role),
        status: normalizeUserStatus(user?.status),
    });
    const normalizeBatchRandomLength = (settings) => {
        const value = settings?.randomLength ?? settings?.idLength;
        if (typeof value === 'number') return `${value} Karakter`;
        const safeValue = String(value || '').trim();
        return safeValue !== '' ? safeValue : '5 Karakter';
    };
    const normalizeBatchRecord = (batch) => ({
        id: String(batch?.id || ''),
        date: batch?.date || '',
        productName: batch?.productName || '',
        brandName: batch?.brandName || '-',
        qty: Number(batch?.qty || 0),
        firstCode: batch?.firstCode || '',
        lastCode: batch?.lastCode || '',
        status: batch?.status === 'Suspended' ? 'Suspended' : 'Generated',
        suspendReason: String(batch?.suspendReason || batch?.suspend_reason || '').trim(),
        settings: {
            randomLength: normalizeBatchRandomLength(batch?.settings),
        },
    });
    const normalizeProductRecord = (product) => ({
        id: Number(product?.id || 0),
        name: String(product?.name || '').trim(),
        brandId: Number(product?.brandId || 0),
        brandName: String(product?.brandName || '-').trim() || '-',
        description: String(product?.description || '').trim() || '-',
        image_url: String(product?.image_url || product?.image_public_url || '').trim(),
        categoryPath: String(product?.categoryPath || '-').trim() || '-',
        catL1: Number(product?.catL1 || 0),
        catL2: Number(product?.catL2 || 0),
        catL3: Number(product?.catL3 || 0),
        skuCode: String(product?.skuCode || '').trim().toUpperCase(),
        dynamicFields: (product?.dynamicFields && typeof product.dynamicFields === 'object' && !Array.isArray(product.dynamicFields))
            ? product.dynamicFields
            : {},
        updated_at: product?.updated_at || null,
    });
    const normalizeScanLogRecord = (log) => ({
        id: Number(log?.id || 0),
        time: String(log?.time || '').trim(),
        scannedAt: log?.scannedAt || null,
        tagCode: String(log?.tagCode || '').trim(),
        productName: String(log?.productName || 'Unknown / Invalid').trim() || 'Unknown / Invalid',
        brand: String(log?.brand || 'N/A').trim() || 'N/A',
        location: String(log?.location || 'Tidak Diketahui').trim() || 'Tidak Diketahui',
        ip: String(log?.ip || '-').trim() || '-',
        scanCount: Number(log?.scanCount || 0),
        status: String(log?.status || 'Invalid').trim() || 'Invalid',
        tagStatus: String(log?.tagStatus || '-').trim() || '-',
        suspendReason: String(log?.suspendReason || log?.suspend_reason || '').trim(),
        userAgent: String(log?.userAgent || '-').trim() || '-',
        latitude: log?.latitude ?? null,
        longitude: log?.longitude ?? null,
    });
    const isSameScanLogRecord = (left, right) => (
        Number(left?.id || 0) === Number(right?.id || 0) &&
        String(left?.scannedAt || '') === String(right?.scannedAt || '') &&
        String(left?.time || '') === String(right?.time || '') &&
        String(left?.tagCode || '') === String(right?.tagCode || '') &&
        String(left?.productName || '') === String(right?.productName || '') &&
        String(left?.brand || '') === String(right?.brand || '') &&
        String(left?.location || '') === String(right?.location || '') &&
        String(left?.ip || '') === String(right?.ip || '') &&
        Number(left?.scanCount || 0) === Number(right?.scanCount || 0) &&
        String(left?.status || '') === String(right?.status || '') &&
        String(left?.tagStatus || '') === String(right?.tagStatus || '') &&
        String(left?.suspendReason || '') === String(right?.suspendReason || '') &&
        String(left?.userAgent || '') === String(right?.userAgent || '') &&
        Number(left?.latitude ?? NaN) === Number(right?.latitude ?? NaN) &&
        Number(left?.longitude ?? NaN) === Number(right?.longitude ?? NaN)
    );
    const areScanLogCollectionsEqual = (currentLogs, nextLogs) => {
        if (currentLogs === nextLogs) return true;
        if (!Array.isArray(currentLogs) || !Array.isArray(nextLogs)) return false;
        if (currentLogs.length !== nextLogs.length) return false;

        for (let index = 0; index < currentLogs.length; index += 1) {
            if (!isSameScanLogRecord(currentLogs[index], nextLogs[index])) {
                return false;
            }
        }

        return true;
    };
    const SCAN_LOG_CACHE_LIMIT = 500;
    const sanitizeScanActivitiesTotal = (value, fallback = 0) => {
        const numericValue = Number(value);
        return Number.isFinite(numericValue) && numericValue >= 0
            ? numericValue
            : fallback;
    };
    const mergeDeltaScanLogs = (currentLogs, incomingLogs) => {
        if (!Array.isArray(incomingLogs) || incomingLogs.length === 0) {
            return currentLogs;
        }

        const knownIds = new Set((currentLogs || []).map((log) => Number(log?.id || 0)));
        const deltaLogs = [];

        incomingLogs.forEach((log) => {
            const logId = Number(log?.id || 0);
            if (logId <= 0 || knownIds.has(logId)) {
                return;
            }

            knownIds.add(logId);
            deltaLogs.push(log);
        });

        if (deltaLogs.length === 0) {
            return currentLogs;
        }

        return [...deltaLogs, ...(currentLogs || [])].slice(0, SCAN_LOG_CACHE_LIMIT);
    };
    const createEmptyUserInput = () => ({ name: '', email: '', role: 'Brand Owner', password: '', status: 1 });
    const createEmptyProductInput = () => ({
        name: '',
        brandId: '',
        description: '',
        catL1: '',
        catL2: '',
        catL3: '',
        skuCode: '',
        dynamicFields: {},
    });
    const normalizeComparableId = (value) => String(value ?? '');
    const isSameEntityId = (left, right) => normalizeComparableId(left) === normalizeComparableId(right);
    const generateTempNumericId = () => (Date.now() * 1000) + Math.floor(Math.random() * 1000);
    const getUserInitials = (fullName) => {
        const words = String(fullName || '').trim().split(/\s+/).filter(Boolean);
        if (words.length === 0) return 'U';
        if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
        return (words[0][0] + words[1][0]).toUpperCase();
    };

    const syncBrandsFromUserMutation = (currentBrands, oldName, newName, oldRole, newRole) => {
        const safeOldName = (oldName || '').trim();
        const safeNewName = (newName || '').trim();
        const wasBrandOwner = normalizeUserRole(oldRole) === 'Brand Owner';
        const isBrandOwner = normalizeUserRole(newRole) === 'Brand Owner';

        let nextBrands = currentBrands;

        if (safeOldName !== '' && safeOldName !== safeNewName) {
            nextBrands = nextBrands.map((brand) =>
                (brand.owner_name || '').trim() === safeOldName
                    ? { ...brand, owner_name: safeNewName }
                    : brand
            );
        }

        if (wasBrandOwner && !isBrandOwner && safeNewName !== '') {
            nextBrands = nextBrands.map((brand) =>
                (brand.owner_name || '').trim() === safeNewName
                    ? { ...brand, owner_name: '' }
                    : brand
            );
        }

        return nextBrands;
    };

    const detachBrandsFromDeletedOwner = (currentBrands, ownerName, ownerRole) => {
        const safeOwnerName = (ownerName || '').trim();
        if (safeOwnerName === '' || normalizeUserRole(ownerRole) !== 'Brand Owner') {
            return currentBrands;
        }

        return currentBrands.map((brand) =>
            (brand.owner_name || '').trim() === safeOwnerName
                ? { ...brand, owner_name: '' }
                : brand
        );
    };

    const insertCategoryNode = (currentCategories, level, parentId, categoryNode) => {
        if (level === 1) {
            return [
                ...currentCategories,
                {
                    id: categoryNode.id,
                    name: categoryNode.name,
                    subCategories: [],
                },
            ];
        }

        if (level === 2) {
            return currentCategories.map((catL1) => {
                if (!isSameEntityId(catL1.id, parentId)) return catL1;

                return {
                    ...catL1,
                    subCategories: [
                        ...(catL1.subCategories || []),
                        {
                            id: categoryNode.id,
                            name: categoryNode.name,
                            subSubCategories: [],
                        },
                    ],
                };
            });
        }

        return currentCategories.map((catL1) => ({
            ...catL1,
            subCategories: (catL1.subCategories || []).map((catL2) => {
                if (!isSameEntityId(catL2.id, parentId)) return catL2;

                return {
                    ...catL2,
                    subSubCategories: [
                        ...(catL2.subSubCategories || []),
                        {
                            id: categoryNode.id,
                            name: categoryNode.name,
                        },
                    ],
                };
            }),
        }));
    };

    const replaceCategoryNodeId = (currentCategories, level, tempId, savedCategory) => {
        const savedId = Number(savedCategory.id);
        const savedName = savedCategory.name;

        if (level === 1) {
            return currentCategories.map((catL1) =>
                isSameEntityId(catL1.id, tempId)
                    ? { ...catL1, id: savedId, name: savedName }
                    : catL1
            );
        }

        if (level === 2) {
            return currentCategories.map((catL1) => ({
                ...catL1,
                subCategories: (catL1.subCategories || []).map((catL2) =>
                    isSameEntityId(catL2.id, tempId)
                        ? { ...catL2, id: savedId, name: savedName }
                        : catL2
                ),
            }));
        }

        return currentCategories.map((catL1) => ({
            ...catL1,
            subCategories: (catL1.subCategories || []).map((catL2) => ({
                ...catL2,
                subSubCategories: (catL2.subSubCategories || []).map((catL3) =>
                    isSameEntityId(catL3.id, tempId)
                        ? { ...catL3, id: savedId, name: savedName }
                        : catL3
                ),
            })),
        }));
    };

    const removeCategoryNode = (currentCategories, level, categoryId) => {
        if (level === 1) {
            return currentCategories.filter((catL1) => !isSameEntityId(catL1.id, categoryId));
        }

        if (level === 2) {
            return currentCategories.map((catL1) => ({
                ...catL1,
                subCategories: (catL1.subCategories || []).filter((catL2) => !isSameEntityId(catL2.id, categoryId)),
            }));
        }

        return currentCategories.map((catL1) => ({
            ...catL1,
            subCategories: (catL1.subCategories || []).map((catL2) => ({
                ...catL2,
                subSubCategories: (catL2.subSubCategories || []).filter((catL3) => !isSameEntityId(catL3.id, categoryId)),
            })),
        }));
    };

    const getBrandStatusLabel = (status) => normalizeBrandStatus(status) === 1 ? 'Aktif' : 'Non-aktif';
    const isBrandActive = (status) => normalizeBrandStatus(status) === 1;
    const createEmptyBrandInput = () => ({ name: '', description: '', owner_name: '', status: 1 });
    const getFirstErrorMessage = (errors, fallbackMessage) => {
        const firstError = Object.values(errors || {})[0];
        if (Array.isArray(firstError)) return firstError[0] || fallbackMessage;
        return firstError || fallbackMessage;
    };
    const normalizeBrandRecord = (brand) => ({
        ...brand,
        owner_name: brand.owner_name || '',
        description: brand.description || '',
        logo_url: brand.logo_url || brand.logo_public_url || '',
        status: normalizeBrandStatus(brand.status),
        brand_code: brand.brand_code || brand.code || `ID-${brand.id}`,
        updated_at: brand.updated_at || null,
    });
    const buildBrandLogoUrl = (logoUrl) => {
        if (!logoUrl || typeof logoUrl !== 'string') return null;

        const trimmed = logoUrl.trim();
        if (!trimmed) return null;
        if (['0', 'null', 'undefined', 'false'].includes(trimmed.toLowerCase())) {
            return null;
        }

        if (trimmed.startsWith('blob:') || trimmed.startsWith('data:image/')) {
            return trimmed;
        }

        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            try {
                const parsed = new URL(trimmed);
                if (parsed.pathname.startsWith('/storage/')) {
                    return `${parsed.pathname}${parsed.search}`;
                }

                const storageIdx = parsed.pathname.indexOf('/storage/');
                if (storageIdx >= 0) {
                    return `${parsed.pathname.slice(storageIdx)}${parsed.search}`;
                }
            } catch {
                return trimmed;
            }

            return trimmed;
        }

        let normalized = trimmed.replaceAll('\\', '/').replace(/^\/+/, '');
        if (normalized.startsWith('public/')) {
            normalized = normalized.slice('public/'.length);
        }
        if (normalized.startsWith('storage/')) {
            return `/${normalized}`;
        }

        return `/storage/${normalized}`;
    };
    const buildBrandLogoSrc = (brand) => buildBrandLogoUrl(brand?.logo_url || brand?.logo_public_url);
    const buildProductImageUrl = (imageUrl) => {
        if (!imageUrl || typeof imageUrl !== 'string') return null;

        const trimmed = imageUrl.trim();
        if (!trimmed) return null;
        if (['0', 'null', 'undefined', 'false'].includes(trimmed.toLowerCase())) {
            return null;
        }

        if (trimmed.startsWith('blob:') || trimmed.startsWith('data:image/')) {
            return trimmed;
        }

        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            try {
                const parsed = new URL(trimmed);
                if (parsed.pathname.startsWith('/storage/')) {
                    return `${parsed.pathname}${parsed.search}`;
                }

                const storageIdx = parsed.pathname.indexOf('/storage/');
                if (storageIdx >= 0) {
                    return `${parsed.pathname.slice(storageIdx)}${parsed.search}`;
                }
            } catch {
                return trimmed;
            }

            return trimmed;
        }

        let normalized = trimmed.replaceAll('\\', '/').replace(/^\/+/, '');
        if (normalized.startsWith('public/')) {
            normalized = normalized.slice('public/'.length);
        }
        if (normalized.startsWith('storage/')) {
            return `/${normalized}`;
        }

        return `/storage/${normalized}`;
    };
    const logoPreviewObjectUrlRef = useRef(null);
    const productImagePreviewObjectUrlRef = useRef(null);
    const releaseLogoPreviewObjectUrl = () => {
        if (logoPreviewObjectUrlRef.current) {
            URL.revokeObjectURL(logoPreviewObjectUrlRef.current);
            logoPreviewObjectUrlRef.current = null;
        }
    };
    const releaseProductImagePreviewObjectUrl = () => {
        if (productImagePreviewObjectUrlRef.current) {
            URL.revokeObjectURL(productImagePreviewObjectUrlRef.current);
            productImagePreviewObjectUrlRef.current = null;
        }
    };
    const setLogoPreviewFromServer = (logoUrl) => {
        releaseLogoPreviewObjectUrl();
        setLogoPreview(buildBrandLogoUrl(logoUrl));
    };
    const setLogoPreviewFromFile = (file) => {
        releaseLogoPreviewObjectUrl();
        const objectUrl = URL.createObjectURL(file);
        logoPreviewObjectUrlRef.current = objectUrl;
        setLogoPreview(objectUrl);
    };
    const setProductImagePreviewFromServer = (imageUrl) => {
        releaseProductImagePreviewObjectUrl();
        setProductImagePreview(buildProductImageUrl(imageUrl));
    };
    const setProductImagePreviewFromFile = (file) => {
        releaseProductImagePreviewObjectUrl();
        const objectUrl = URL.createObjectURL(file);
        productImagePreviewObjectUrlRef.current = objectUrl;
        setProductImagePreview(objectUrl);
    };

    const [brands, setBrands] = useState((databaseBrands || []).map(normalizeBrandRecord));
    useEffect(() => {
        setBrands((databaseBrands || []).map(normalizeBrandRecord));
    }, [databaseBrands]);

    const [categories, setCategories] = useState(
        Array.isArray(databaseCategories) ? databaseCategories : []
    );
    useEffect(() => {
        setCategories(Array.isArray(databaseCategories) ? databaseCategories : []);
    }, [databaseCategories]);

    const [systemUsers, setSystemUsers] = useState((databaseUsers || []).map(normalizeUserRecord));
    useEffect(() => {
        setSystemUsers((databaseUsers || []).map(normalizeUserRecord));
    }, [databaseUsers]);

    const authUserId = authUser?.id;
    const authUserEmail = String(authUser?.email || '').trim().toLowerCase();
    const matchedSystemUser = systemUsers.find((user) =>
        (authUserId != null && isSameEntityId(user.id, authUserId)) ||
        (authUserEmail !== '' && String(user.email || '').trim().toLowerCase() === authUserEmail)
    );
    const sidebarUserName = (matchedSystemUser?.name || authUser?.name || 'Pengguna').trim() || 'Pengguna';
    const sidebarUserRole = normalizeUserRole(matchedSystemUser?.role || authUser?.role);
    const sidebarUserInitials = getUserInitials(sidebarUserName);
    const isBrandOwnerRole = sidebarUserRole === 'Brand Owner';
    const isSuperAdminRole = sidebarUserRole === 'Super Admin';
    const isActiveSuperAdminUser = (user) => (
        normalizeUserRole(user?.role) === 'Super Admin' &&
        normalizeUserStatus(user?.status) === 1
    );
    const wouldLeaveNoActiveSuperAdmin = (targetUser, nextRole, nextStatus) => {
        if (!targetUser) return false;

        const currentlyActiveSuperAdmin = isActiveSuperAdminUser(targetUser);
        const willRemainActiveSuperAdmin = (
            normalizeUserRole(nextRole ?? targetUser.role) === 'Super Admin' &&
            normalizeUserStatus(nextStatus ?? targetUser.status) === 1
        );

        if (!currentlyActiveSuperAdmin || willRemainActiveSuperAdmin) {
            return false;
        }

        const activeSuperAdminCount = systemUsers.filter(isActiveSuperAdminUser).length;
        return activeSuperAdminCount <= 1;
    };

    const [products, setProducts] = useState((databaseProducts || []).map(normalizeProductRecord));
    const [scanLogs, setScanLogs] = useState((databaseScanLogs || []).map(normalizeScanLogRecord));
    const [scanActivitiesCount, setScanActivitiesCount] = useState(
        sanitizeScanActivitiesTotal(databaseScanActivitiesCount, 0)
    );
    const [isRefreshingScanLogs, setIsRefreshingScanLogs] = useState(false);
    const [selectedScanLogDetail, setSelectedScanLogDetail] = useState(null);
    const latestScanLogIdRef = useRef(Number((databaseScanLogs || [])[0]?.id || 0));
    const isScanRefreshInFlightRef = useRef(false);

    const [batches, setBatches] = useState((databaseTagBatches || []).map(normalizeBatchRecord));
    const [isSavingBatch, setIsSavingBatch] = useState(false);
    const [pendingBatchActionIds, setPendingBatchActionIds] = useState([]);
    const totalGeneratedTagCount = batches.reduce((total, batch) => total + Number(batch.qty || 0), 0);

    // --- STATE FORM ---
    const [brandInput, setBrandInput] = useState(createEmptyBrandInput());
    const [savingBrandStatusId, setSavingBrandStatusId] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [editingBrandId, setEditingBrandId] = useState(null);
    const [brokenBrandLogoIds, setBrokenBrandLogoIds] = useState([]);

    const [userInput, setUserInput] = useState(createEmptyUserInput());
    const [editingUserId, setEditingUserId] = useState(null);
    const [isSavingUser, setIsSavingUser] = useState(false);
    const [pendingUserActionIds, setPendingUserActionIds] = useState([]);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({ userId: null, userName: '', newPassword: '', confirmPassword: '' });

    const [tagConfig, setTagConfig] = useState({
        productId: '', quantity: 100, randomLength: 5
    });
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [generatedQR, setGeneratedQR] = useState(null);

    const [productInput, setProductInput] = useState(createEmptyProductInput());
    const [productImageFile, setProductImageFile] = useState(null);
    const [productImagePreview, setProductImagePreview] = useState(null);
    const [editingProductId, setEditingProductId] = useState(null);
    const [isSavingProduct, setIsSavingProduct] = useState(false);
    const [pendingBrandActionIds, setPendingBrandActionIds] = useState([]);
    const [pendingProductActionIds, setPendingProductActionIds] = useState([]);

    const [selectedCatL1, setSelectedCatL1] = useState(null);
    const [selectedCatL2, setSelectedCatL2] = useState(null);
    const [newCatL1Name, setNewCatL1Name] = useState('');
    const [newCatL2Name, setNewCatL2Name] = useState('');
    const [newCatL3Name, setNewCatL3Name] = useState('');
    const [isSavingCategory, setIsSavingCategory] = useState(false);

    // --- STATE PENGATURAN ---
    const normalizeBooleanSetting = (value, fallback) => {
        if (value === undefined || value === null) return fallback;
        if (typeof value === 'boolean') return value;
        const normalized = String(value).trim().toLowerCase();
        return ['1', 'true', 'yes', 'on'].includes(normalized);
    };
    const normalizeScanLimitSetting = (value, fallback = 5) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
        return Math.floor(parsed);
    };

    const [scanValidLimit, setScanValidLimit] = useState(
        normalizeScanLimitSetting(securitySettings?.maxValidScanLimit, 5)
    );
    const [requireGps, setRequireGps] = useState(
        normalizeBooleanSetting(securitySettings?.requireGps, true)
    );
    const [emailNotif, setEmailNotif] = useState(
        normalizeBooleanSetting(securitySettings?.emailNotif, false)
    );
    const [isSavingSecuritySettings, setIsSavingSecuritySettings] = useState(false);
    const [accountEmailInput, setAccountEmailInput] = useState(String(authUser?.email || ''));
    const [isSavingAccountEmail, setIsSavingAccountEmail] = useState(false);
    const [accountPasswordInput, setAccountPasswordInput] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [isSavingAccountPassword, setIsSavingAccountPassword] = useState(false);

    // --- STATE UNTUK FILTER SCAN ---
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const brandSubmitLockRef = useRef(false);
    const productSubmitLockRef = useRef(false);
    const userSubmitLockRef = useRef(false);
    const categorySubmitLockRef = useRef(false);
    const tagSubmitLockRef = useRef(false);
    const brandModalSourceRef = useRef('brand');
    const handleBrandLogoInputChange = (event) => {
        const file = event?.target?.files?.[0];
        if (!file) return;

        if (!validateImageUploadSize(file, 'Logo brand')) {
            if (event?.target) event.target.value = '';
            return;
        }

        setLogoFile(file);
        setLogoPreviewFromFile(file);
    };
    const handleProductImageInputChange = (event) => {
        const file = event?.target?.files?.[0];
        if (!file) return;

        if (!validateImageUploadSize(file, 'Gambar produk')) {
            if (event?.target) event.target.value = '';
            return;
        }

        setProductImageFile(file);
        setProductImagePreviewFromFile(file);
    };

    const transitionSetBrands = (updater) => {
        startTransition(() => {
            setBrands(updater);
        });
    };
    const transitionSetProducts = (updater) => {
        startTransition(() => {
            setProducts(updater);
        });
    };
    const transitionSetBatches = (updater) => {
        startTransition(() => {
            setBatches(updater);
        });
    };
    const transitionSetUsers = (updater) => {
        startTransition(() => {
            setSystemUsers(updater);
        });
    };
    const transitionSetCategories = (updater) => {
        startTransition(() => {
            setCategories(updater);
        });
    };
    const markBrandLogoBroken = (brandId) => {
        setBrokenBrandLogoIds((currentIds) => (
            currentIds.includes(brandId) ? currentIds : [...currentIds, brandId]
        ));
    };
    const clearBrokenBrandLogo = (brandId) => {
        setBrokenBrandLogoIds((currentIds) => currentIds.filter((id) => id !== brandId));
    };

    const setUserPendingAction = (userId, isPending) => {
        const key = normalizeComparableId(userId);

        setPendingUserActionIds((currentIds) => {
            const alreadyPending = currentIds.includes(key);
            if (isPending) {
                return alreadyPending ? currentIds : [...currentIds, key];
            }

            if (!alreadyPending) {
                return currentIds;
            }

            return currentIds.filter((id) => id !== key);
        });
    };

    const isUserPendingAction = (userId) => pendingUserActionIds.includes(normalizeComparableId(userId));
    const setBrandPendingAction = (brandId, isPending) => {
        const key = normalizeComparableId(brandId);

        setPendingBrandActionIds((currentIds) => {
            const alreadyPending = currentIds.includes(key);
            if (isPending) {
                return alreadyPending ? currentIds : [...currentIds, key];
            }

            if (!alreadyPending) {
                return currentIds;
            }

            return currentIds.filter((id) => id !== key);
        });
    };
    const isBrandPendingAction = (brandId) => pendingBrandActionIds.includes(normalizeComparableId(brandId));
    const setProductPendingAction = (productId, isPending) => {
        const key = normalizeComparableId(productId);

        setPendingProductActionIds((currentIds) => {
            const alreadyPending = currentIds.includes(key);
            if (isPending) {
                return alreadyPending ? currentIds : [...currentIds, key];
            }

            if (!alreadyPending) {
                return currentIds;
            }

            return currentIds.filter((id) => id !== key);
        });
    };
    const isProductPendingAction = (productId) => pendingProductActionIds.includes(normalizeComparableId(productId));
    const setBatchPendingAction = (batchId, isPending) => {
        const key = normalizeComparableId(batchId);

        setPendingBatchActionIds((currentIds) => {
            const alreadyPending = currentIds.includes(key);
            if (isPending) {
                return alreadyPending ? currentIds : [...currentIds, key];
            }

            if (!alreadyPending) {
                return currentIds;
            }

            return currentIds.filter((id) => id !== key);
        });
    };
    const isBatchPendingAction = (batchId) => pendingBatchActionIds.includes(normalizeComparableId(batchId));

    useEffect(() => {
        transitionSetBatches((databaseTagBatches || []).map(normalizeBatchRecord));
    }, [databaseTagBatches]);

    useEffect(() => {
        transitionSetProducts((databaseProducts || []).map(normalizeProductRecord));
    }, [databaseProducts]);

    useEffect(() => {
        const incomingLogs = (databaseScanLogs || []).map(normalizeScanLogRecord);
        setScanLogs((currentLogs) => {
            const resolvedLogs = areScanLogCollectionsEqual(currentLogs, incomingLogs)
                ? currentLogs
                : incomingLogs;

            latestScanLogIdRef.current = Number(resolvedLogs?.[0]?.id || 0);
            return resolvedLogs;
        });
    }, [databaseScanLogs]);

    useEffect(() => {
        setScanActivitiesCount(sanitizeScanActivitiesTotal(databaseScanActivitiesCount, 0));
    }, [databaseScanActivitiesCount]);

    useEffect(() => {
        latestScanLogIdRef.current = Number(scanLogs?.[0]?.id || 0);
    }, [scanLogs]);

    useEffect(() => {
        setScanValidLimit(normalizeScanLimitSetting(securitySettings?.maxValidScanLimit, 5));
        setRequireGps(normalizeBooleanSetting(securitySettings?.requireGps, true));
        setEmailNotif(normalizeBooleanSetting(securitySettings?.emailNotif, false));
    }, [securitySettings]);

    useEffect(() => {
        setAccountEmailInput(String(authUser?.email || ''));
    }, [authUser?.email]);

    useEffect(() => {
        if (!isBrandOwnerRole) {
            return;
        }

        if (activeTab === 'users') {
            setActiveTab('dashboard');
        }
    }, [activeTab, isBrandOwnerRole]);

    useEffect(() => {
        if (activeTab === 'scan_history') {
            return;
        }
        setSelectedScanLogDetail(null);
    }, [activeTab]);

    useEffect(() => {
        const shouldLiveSyncScanLogs = activeTab === 'scan_history' || activeTab === 'dashboard';
        const shouldShowRefreshIndicator = activeTab === 'scan_history';
        if (!shouldLiveSyncScanLogs) {
            return;
        }
        if (activeTab === 'scan_history' && selectedScanLogDetail) {
            return;
        }

        let isActive = true;

        const fetchScanActivities = () => {
            if (isScanRefreshInFlightRef.current) {
                return;
            }

            isScanRefreshInFlightRef.current = true;
            if (shouldShowRefreshIndicator) {
                setIsRefreshingScanLogs(true);
            }

            const latestKnownId = Number(latestScanLogIdRef.current || 0);
            const requestParams = latestKnownId > 0
                ? { after_id: latestKnownId }
                : undefined;

            axios.get('/scan-activities', { params: requestParams })
                .then((response) => {
                    if (!isActive) return;

                    const logs = Array.isArray(response?.data?.logs) ? response.data.logs : [];
                    const normalizedLogs = logs.map(normalizeScanLogRecord);
                    const responseMode = String(response?.data?.mode || 'snapshot');
                    const requiresResync = Boolean(response?.data?.requires_resync);

                    if (responseMode === 'delta' && !requiresResync && latestKnownId > 0) {
                        if (normalizedLogs.length > 0) {
                            const newestDeltaId = Number(normalizedLogs?.[0]?.id || 0);
                            if (newestDeltaId > latestScanLogIdRef.current) {
                                latestScanLogIdRef.current = newestDeltaId;
                            }

                            setScanLogs((currentLogs) => mergeDeltaScanLogs(currentLogs, normalizedLogs));
                            setScanActivitiesCount((currentTotal) => (
                                sanitizeScanActivitiesTotal(currentTotal, 0) + normalizedLogs.length
                            ));
                        }
                        return;
                    }

                    setScanLogs((currentLogs) => (
                        areScanLogCollectionsEqual(currentLogs, normalizedLogs) ? currentLogs : normalizedLogs
                    ));
                    setScanActivitiesCount(
                        sanitizeScanActivitiesTotal(response?.data?.total, normalizedLogs.length)
                    );
                })
                .catch(() => {
                    // Silent by design: keep existing logs if refresh fails.
                })
                .finally(() => {
                    if (isActive && shouldShowRefreshIndicator) {
                        setIsRefreshingScanLogs(false);
                    }
                    isScanRefreshInFlightRef.current = false;
                });
        };

        fetchScanActivities();
        const intervalId = setInterval(fetchScanActivities, 3000);

        return () => {
            isActive = false;
            clearInterval(intervalId);
            if (shouldShowRefreshIndicator) {
                setIsRefreshingScanLogs(false);
            }
            isScanRefreshInFlightRef.current = false;
        };
    }, [activeTab, selectedScanLogDetail]);

    useEffect(() => {
        return () => {
            releaseLogoPreviewObjectUrl();
            releaseProductImagePreviewObjectUrl();
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
                toastTimeoutRef.current = null;
            }
        };
    }, []);

    const handleSaveSecuritySettings = () => {
        const normalizedLimit = normalizeScanLimitSetting(scanValidLimit, 5);
        setIsSavingSecuritySettings(true);

        axios.post('/settings/security', {
            max_valid_scan_limit: normalizedLimit,
            require_gps: Boolean(requireGps),
            email_notif: Boolean(emailNotif),
        })
            .then((response) => {
                const savedSettings = response?.data?.settings || {};
                setScanValidLimit(normalizeScanLimitSetting(savedSettings.maxValidScanLimit, normalizedLimit));
                setRequireGps(normalizeBooleanSetting(savedSettings.requireGps, Boolean(requireGps)));
                setEmailNotif(normalizeBooleanSetting(savedSettings.emailNotif, Boolean(emailNotif)));
                showToast('Pengaturan keamanan berhasil disimpan.');
            })
            .catch((error) => {
                const errors = error?.response?.data?.errors || {};
                showToast(getFirstErrorMessage(errors, 'Gagal menyimpan pengaturan keamanan.'), 'error');
            })
            .finally(() => {
                setIsSavingSecuritySettings(false);
            });
    };

    const handleSaveAccountEmail = () => {
        const cleanedEmail = String(accountEmailInput || '').trim().toLowerCase();
        if (cleanedEmail === '') {
            showToast('Email wajib diisi.', 'error');
            return;
        }

        setIsSavingAccountEmail(true);
        axios.post('/settings/account/email', {
            email: cleanedEmail,
        })
            .then(() => {
                setAccountEmailInput(cleanedEmail);
                showToast('Email akun berhasil diperbarui.');
            })
            .catch((error) => {
                const errors = error?.response?.data?.errors || {};
                showToast(getFirstErrorMessage(errors, 'Gagal memperbarui email akun.'), 'error');
            })
            .finally(() => {
                setIsSavingAccountEmail(false);
            });
    };

    const handleSaveAccountPassword = () => {
        if (isSavingAccountPassword) return;

        setIsSavingAccountPassword(true);
        axios.post('/settings/account/password', {
            current_password: accountPasswordInput.currentPassword,
            password: accountPasswordInput.newPassword,
            password_confirmation: accountPasswordInput.confirmPassword,
        })
            .then(() => {
                setAccountPasswordInput({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
                showToast('Password akun berhasil diperbarui.');
            })
            .catch((error) => {
                const errors = error?.response?.data?.errors || {};
                showToast(getFirstErrorMessage(errors, 'Gagal memperbarui password akun.'), 'error');
            })
            .finally(() => {
                setIsSavingAccountPassword(false);
            });
    };

    // --- LOGIC HANDLERS BRAND ---
    const [isSavingBrand, setIsSavingBrand] = useState(false);
    const closeBrandModal = () => {
        brandSubmitLockRef.current = false;
        setIsSavingBrand(false);
        releaseLogoPreviewObjectUrl();
        setBrandInput(createEmptyBrandInput());
        setLogoFile(null);
        setLogoPreview(null);
        setEditingBrandId(null);
        setIsBrandModalOpen(false);
        brandModalSourceRef.current = 'brand';
    };

    const openCreateBrandModal = (options = {}) => {
        const source = String(options?.source || 'brand');
        brandModalSourceRef.current = source === 'product_form' ? 'product_form' : 'brand';
        brandSubmitLockRef.current = false;
        setIsSavingBrand(false);
        closeBrandModal();
        setIsBrandModalOpen(true);
        brandModalSourceRef.current = source === 'product_form' ? 'product_form' : 'brand';
    };

    const toggleBrandStatusAutoSave = (brand) => {
        const previousStatus = normalizeBrandStatus(brand.status);
        const newStatus = previousStatus === 1 ? 0 : 1;

        setSavingBrandStatusId(brand.id);
        setBrands((currentBrands) =>
            currentBrands.map((currentBrand) =>
                currentBrand.id === brand.id ? { ...currentBrand, status: newStatus } : currentBrand
            )
        );

        if (editingBrandId === brand.id) {
            setBrandInput((currentInput) => ({ ...currentInput, status: newStatus }));
        }

                showToast(`Memperbarui status brand ${brand.name}...`, 'info');
                axios.post(`/brands/${brand.id}/status`, { status: newStatus })
            .then((response) => {
                const savedBrand = normalizeBrandRecord(response?.data?.brand || { ...brand, status: newStatus });

                setBrands((currentBrands) =>
                    currentBrands.map((currentBrand) =>
                        currentBrand.id === brand.id ? savedBrand : currentBrand
                    )
                );

                if (editingBrandId === brand.id) {
                    setBrandInput((currentInput) => ({
                        ...currentInput,
                        name: savedBrand.name || currentInput.name,
                        owner_name: savedBrand.owner_name || '',
                        description: savedBrand.description || '',
                        status: normalizeBrandStatus(savedBrand.status),
                    }));
                }

                showToast(`Status Brand diubah menjadi ${getBrandStatusLabel(savedBrand.status)}`);
            })
            .catch((error) => {
                const errors = error?.response?.data?.errors || {};

                setBrands((currentBrands) =>
                    currentBrands.map((currentBrand) =>
                        currentBrand.id === brand.id ? { ...currentBrand, status: previousStatus } : currentBrand
                    )
                );
                if (editingBrandId === brand.id) {
                    setBrandInput((currentInput) => ({ ...currentInput, status: previousStatus }));
                }
                showToast(getFirstErrorMessage(errors, `Gagal mengubah status ${brand.name}.`), "error");
            })
            .finally(() => {
                setSavingBrandStatusId(null);
            });
    };

    const handleSaveBrand = (e) => {
        e.preventDefault();
        if (brandSubmitLockRef.current || isSavingBrand) return;

        const brandName = brandInput.name.trim();

        if (!brandName) {
            showToast("Nama brand wajib diisi.", "error");
            return;
        }

        brandSubmitLockRef.current = true;
        setIsSavingBrand(true);

        const isEditing = Boolean(editingBrandId);
        const normalizedStatus = normalizeBrandStatus(brandInput.status);
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const createBrandCode = `CL-${randomCode}`;
        const basePayload = {
            name: brandName,
            owner_name: brandInput.owner_name.trim(),
            description: brandInput.description.trim(),
            status: normalizedStatus,
        };
        const targetUrl = isEditing ? `/brands/update/${editingBrandId}` : '/brands';
        const payload = logoFile
            ? (() => {
                const formData = new FormData();
                formData.append('name', basePayload.name);
                formData.append('owner_name', basePayload.owner_name);
                formData.append('description', basePayload.description);
                formData.append('status', String(basePayload.status));
                formData.append('logo', logoFile);
                formData.append('logo_upload_expected', '1');
                if (!isEditing) {
                    formData.append('brand_code', createBrandCode);
                }
                return formData;
            })()
            : {
                ...basePayload,
                ...(isEditing ? {} : { brand_code: createBrandCode }),
            };
        axios.post(targetUrl, payload)
            .then((response) => {
                const savedBrand = normalizeBrandRecord(response?.data?.brand || {});
                const shouldReturnToProductForm = !isEditing
                    && brandModalSourceRef.current === 'product_form'
                    && Boolean(savedBrand.id);

                if (savedBrand.id) {
                    if (isEditing) {
                        transitionSetBrands((currentBrands) =>
                            currentBrands.map((currentBrand) =>
                                currentBrand.id === savedBrand.id ? savedBrand : currentBrand
                            )
                        );
                    } else {
                        transitionSetBrands((currentBrands) => [savedBrand, ...currentBrands]);
                    }

                    clearBrokenBrandLogo(savedBrand.id);
                }

                showToast(isEditing ? "Data brand berhasil diperbarui!" : "Brand baru berhasil ditambahkan!");
                if (shouldReturnToProductForm) {
                    setProductInput((currentInput) => ({
                        ...currentInput,
                        brandId: String(savedBrand.id),
                    }));
                }
                closeBrandModal();
                if (shouldReturnToProductForm) {
                    setActiveTab('product_form');
                }
            })
            .catch((error) => {
                const errors = error?.response?.data?.errors || {};
                if (errors?.logo?.[0]) {
                    showToast(errors.logo[0], "error");
                    return;
                }
                showToast(
                    getFirstErrorMessage(errors, isEditing ? "Gagal memperbarui data brand." : "Gagal menambahkan brand baru."),
                    "error"
                );
            })
            .finally(() => {
                brandSubmitLockRef.current = false;
                setIsSavingBrand(false);
            });
    };

    const handleEditBrand = (brand) => {
        brandSubmitLockRef.current = false;
        setIsSavingBrand(false);
        setBrandInput({
            name: brand.name || '',
            description: brand.description === "-" ? "" : (brand.description || ''),
            owner_name: brand.owner_name || '',
            status: normalizeBrandStatus(brand.status),
        });
        setEditingBrandId(brand.id);
        setLogoFile(null);
        setLogoPreviewFromServer(brand.logo_url);
        setIsBrandModalOpen(true);
    };

    const handleDeleteBrand = (id) => {
        if (isBrandPendingAction(id)) {
            return;
        }

        setConfirmObj({
            isOpen: true,
            title: "Hapus Brand?",
            message: "Data brand ini akan dihapus permanen. Produk yang terkait mungkin akan kehilangan referensi. Lanjutkan?",
            onConfirm: () => {
                if (isBrandPendingAction(id)) {
                    return;
                }

                const previousBrandsSnapshot = brands;
                const shouldOptimisticRemove = Number(editingBrandId || 0) !== Number(id);

                setBrandPendingAction(id, true);
                if (shouldOptimisticRemove) {
                    transitionSetBrands((currentBrands) =>
                        currentBrands.filter((currentBrand) => Number(currentBrand.id) !== Number(id))
                    );
                }

                showToast("Menghapus brand...", 'info');
                axios.delete(`/brands/${id}`)
                    .then((response) => {
                        const deletedId = Number(response?.data?.deleted_id || id);

                        transitionSetBrands((currentBrands) =>
                            currentBrands.filter((currentBrand) => Number(currentBrand.id) !== deletedId)
                        );

                        if (editingBrandId === deletedId) {
                            closeBrandModal();
                        }

                        showToast("Brand berhasil dihapus!");
                    })
                    .catch((error) => {
                        if (shouldOptimisticRemove) {
                            transitionSetBrands(previousBrandsSnapshot);
                        }

                        const errors = error?.response?.data?.errors || {};
                        showToast(getFirstErrorMessage(errors, "Gagal menghapus brand."), "error");
                    })
                    .finally(() => {
                        setBrandPendingAction(id, false);
                    });
            }
        });
    };

    const handleCancelEditBrand = () => {
        if (isSavingBrand) return;
        closeBrandModal();
    };

    // --- LOGIC HANDLERS PRODUCT ---
    const clearProductImageDraft = () => {
        releaseProductImagePreviewObjectUrl();
        setProductImageFile(null);
        setProductImagePreview(null);
    };

    const resetProductDraft = () => {
        productSubmitLockRef.current = false;
        setIsSavingProduct(false);
        setProductInput(createEmptyProductInput());
        clearProductImageDraft();
        setEditingProductId(null);
    };

    const openCreateProductForm = () => {
        resetProductDraft();
        setActiveTab('product_form');
    };

    const handleSaveProduct = (e) => {
        e.preventDefault();
        if (productSubmitLockRef.current || isSavingProduct) return;

        const parseRequiredId = (value) => {
            const numericValue = Number(value || 0);
            return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : 0;
        };
        const parseOptionalId = (value) => {
            const numericValue = Number(value || 0);
            return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : null;
        };

        const trimmedName = String(productInput.name || '').trim();
        const normalizedSku = String(productInput.skuCode || '').trim().toUpperCase();
        const brandId = parseRequiredId(productInput.brandId);
        const catL1 = parseRequiredId(productInput.catL1);
        const catL2 = parseOptionalId(productInput.catL2);
        const catL3 = parseOptionalId(productInput.catL3);

        if (!trimmedName || !brandId || !catL1 || !normalizedSku) {
            showToast("Mohon lengkapi data wajib produk (Nama, Brand, Kategori, Kode SKU).", "error");
            return;
        }
        if (catL3 && !catL2) {
            showToast("Struktur kategori tidak valid. Pilih Sub Kategori sebelum memilih Varian Akhir.", "error");
            return;
        }

        const selectedCategoryLevel1 = categories.find((cat) => String(cat.id) === String(catL1));
        const selectedCategoryLevel2 = selectedCategoryLevel1?.subCategories?.find((cat) => String(cat.id) === String(catL2));
        const selectedCategoryLevel3 = selectedCategoryLevel2?.subSubCategories?.find((cat) => String(cat.id) === String(catL3));
        const activeSpecSchema = resolveProductSpecSchema(PRODUCT_SPEC_SCHEMA, {
            catL2Id: catL2 || '',
            catL3Id: catL3 || '',
            categoryLevel2Name: selectedCategoryLevel2?.name || '',
            categoryLevel3Name: selectedCategoryLevel3?.name || '-',
        });
        const requiredSpecFields = [
            ...(activeSpecSchema?.primaryFields || activeSpecSchema?.fields || []),
            ...(activeSpecSchema?.extendedFields || []),
        ].filter((field) => Boolean(field?.required));
        const missingRequiredSpecLabels = requiredSpecFields
            .filter((field) => String(productInput.dynamicFields?.[field.name] ?? '').trim() === '')
            .map((field) => field.label)
            .filter(Boolean);

        if (missingRequiredSpecLabels.length > 0) {
            showToast(`Mohon lengkapi spesifikasi wajib: ${missingRequiredSpecLabels.join(', ')}.`, "error");
            setActiveFormSection('spec');
            const specSection = typeof document !== 'undefined' ? document.getElementById('form-spec') : null;
            specSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        const isDuplicateSKU = products.some(
            (p) =>
                String(p.skuCode || '').toUpperCase() === normalizedSku &&
                Number(p.id) !== Number(editingProductId || 0)
        );
        if (isDuplicateSKU) {
            showToast(`Kode SKU "${normalizedSku}" sudah digunakan oleh produk lain! Harap gunakan kode unik.`, "error");
            return;
        }

        const normalizedDynamicFields = Object.entries(productInput.dynamicFields || {}).reduce((acc, [key, value]) => {
            const safeKey = String(key || '').trim();
            if (!safeKey) return acc;
            const safeValue = String(value ?? '').trim();
            if (!safeValue) return acc;
            acc[safeKey] = safeValue;
            return acc;
        }, {});

        const basePayload = {
            name: trimmedName,
            sku_code: normalizedSku,
            brand_id: brandId,
            cat_l1_id: catL1,
            cat_l2_id: catL2,
            cat_l3_id: catL3,
            description: String(productInput.description || '').trim(),
            dynamic_fields: normalizedDynamicFields,
        };

        const isEditing = Boolean(editingProductId);
        const targetUrl = isEditing ? `/products/update/${editingProductId}` : '/products';
        const payload = productImageFile
            ? (() => {
                const formData = new FormData();
                formData.append('name', basePayload.name);
                formData.append('sku_code', basePayload.sku_code);
                formData.append('brand_id', String(basePayload.brand_id));
                formData.append('cat_l1_id', String(basePayload.cat_l1_id));
                formData.append('cat_l2_id', basePayload.cat_l2_id === null ? '' : String(basePayload.cat_l2_id));
                formData.append('cat_l3_id', basePayload.cat_l3_id === null ? '' : String(basePayload.cat_l3_id));
                formData.append('description', basePayload.description);
                formData.append('image', productImageFile);
                formData.append('image_upload_expected', '1');

                Object.entries(normalizedDynamicFields).forEach(([key, value]) => {
                    formData.append(`dynamic_fields[${key}]`, String(value));
                });

                return formData;
            })()
            : basePayload;

        productSubmitLockRef.current = true;
        setIsSavingProduct(true);

        axios.post(targetUrl, payload)
            .then((response) => {
                const savedProduct = normalizeProductRecord(response?.data?.product || {});
                if (!savedProduct.id) {
                    throw new Error('PRODUCT_RESPONSE_MISSING_ID');
                }

                if (isEditing) {
                    transitionSetProducts((currentProducts) =>
                        currentProducts.map((currentProduct) =>
                            Number(currentProduct.id) === savedProduct.id ? savedProduct : currentProduct
                        )
                    );

                    setSelectedProductDetail((currentDetail) =>
                        currentDetail && Number(currentDetail.id) === savedProduct.id ? savedProduct : currentDetail
                    );
                } else {
                    transitionSetProducts((currentProducts) => [savedProduct, ...currentProducts]);
                }

                showToast(isEditing ? "SKU Produk berhasil diperbarui!" : "SKU Produk baru berhasil ditambahkan!");
                resetProductDraft();
                setActiveTab('product');
            })
            .catch((error) => {
                if (error?.message === 'PRODUCT_RESPONSE_MISSING_ID') {
                    showToast("Respons server SKU produk tidak lengkap. Silakan coba lagi.", "error");
                    return;
                }

                const errors = error?.response?.data?.errors || {};
                showToast(getFirstErrorMessage(errors, "Gagal menyimpan SKU produk."), "error");
            })
            .finally(() => {
                productSubmitLockRef.current = false;
                setIsSavingProduct(false);
            });
    };

    const handleEditProduct = (product) => {
        setProductInput({
            ...createEmptyProductInput(),
            name: product.name,
            brandId: String(product.brandId || ''),
            description: product.description === "-" ? "" : product.description,
            catL1: String(product.catL1 || ''),
            catL2: String(product.catL2 || ''),
            catL3: String(product.catL3 || ''),
            skuCode: product.skuCode || '',
            dynamicFields: product.dynamicFields || {},
        });
        setProductImageFile(null);
        setProductImagePreviewFromServer(product.image_url);
        setEditingProductId(Number(product.id));
        setActiveTab('product_form');
    };

    const handleCancelEditProduct = () => {
        if (isSavingProduct) return;
        resetProductDraft();
        setActiveTab('product');
    };

    const handleDeleteProduct = (id) => {
        if (isProductPendingAction(id)) {
            return;
        }

        setConfirmObj({
            isOpen: true,
            title: "Hapus SKU Produk?",
            message: "Data produk ini akan dihapus dari sistem secara permanen. Lanjutkan?",
            onConfirm: () => {
                if (isProductPendingAction(id)) {
                    return;
                }

                const previousProductsSnapshot = products;
                const previousSelectedProductDetail = selectedProductDetail;
                const shouldOptimisticRemove = Number(editingProductId || 0) !== Number(id);

                setProductPendingAction(id, true);
                if (shouldOptimisticRemove) {
                    transitionSetProducts((currentProducts) =>
                        currentProducts.filter((currentProduct) => Number(currentProduct.id) !== Number(id))
                    );
                    setSelectedProductDetail((currentDetail) =>
                        currentDetail && Number(currentDetail.id) === Number(id) ? null : currentDetail
                    );
                }

                showToast("Menghapus SKU produk...", 'info');
                axios.delete(`/products/${id}`)
                    .then((response) => {
                        const deletedId = Number(response?.data?.deleted_id || id);

                        transitionSetProducts((currentProducts) =>
                            currentProducts.filter((currentProduct) => Number(currentProduct.id) !== deletedId)
                        );

                        if (Number(editingProductId || 0) === deletedId) {
                            resetProductDraft();
                            setActiveTab('product');
                        }

                        setSelectedProductDetail((currentDetail) =>
                            currentDetail && Number(currentDetail.id) === deletedId ? null : currentDetail
                        );

                        showToast("SKU Produk berhasil dihapus!");
                    })
                    .catch((error) => {
                        if (shouldOptimisticRemove) {
                            transitionSetProducts(previousProductsSnapshot);
                            setSelectedProductDetail(previousSelectedProductDetail);
                        }

                        const errors = error?.response?.data?.errors || {};
                        showToast(getFirstErrorMessage(errors, "Gagal menghapus SKU produk."), "error");
                    })
                    .finally(() => {
                        setProductPendingAction(id, false);
                    });
            }
        });
    };

    // --- LOGIC HANDLERS USER ---
    const handleSaveUser = (e) => {
        e.preventDefault();
        if (userSubmitLockRef.current || isSavingUser) return;

        const trimmedName = userInput.name.trim();
        const trimmedEmail = userInput.email.trim().toLowerCase();
        const normalizedRole = normalizeUserRole(userInput.role);

        if (!trimmedName || !trimmedEmail) {
            showToast("Nama dan email wajib diisi.", "error");
            return;
        }

        const isEditing = Boolean(editingUserId);
        const previousUser = isEditing
            ? systemUsers.find((user) => Number(user.id) === Number(editingUserId))
            : null;

        if (!isEditing && !userInput.password) {
            showToast("Sandi wajib diisi untuk pengguna baru!", "error");
            return;
        }

        userSubmitLockRef.current = true;
        setIsSavingUser(true);

        const payload = {
            name: trimmedName,
            email: trimmedEmail,
            role: normalizedRole,
            status: normalizeUserStatus(userInput.status),
        };

        if (isEditing && previousUser && wouldLeaveNoActiveSuperAdmin(previousUser, payload.role, payload.status)) {
            userSubmitLockRef.current = false;
            setIsSavingUser(false);
            showToast("Minimal harus ada 1 akun Super Admin aktif. Ubah akun lain menjadi Super Admin terlebih dahulu.", "error");
            return;
        }

        const draftInputSnapshot = { ...userInput };
        const previousUsersSnapshot = systemUsers;
        const previousBrandsSnapshot = brands;
        const previousEditingUserId = editingUserId;
        const previousIsUserModalOpen = isUserModalOpen;
        const optimisticId = isEditing
            ? previousUser?.id
            : generateTempNumericId();

        if (optimisticId === undefined || optimisticId === null) {
            userSubmitLockRef.current = false;
            setIsSavingUser(false);
            showToast("Gagal memproses data pengguna. Silakan coba lagi.", "error");
            return;
        }

        const optimisticUser = normalizeUserRecord({
            ...(previousUser || {}),
            id: optimisticId,
            ...payload,
        });

        setUserPendingAction(optimisticId, true);
        if (isEditing) {
            transitionSetUsers((currentUsers) =>
                currentUsers.map((currentUser) =>
                    isSameEntityId(currentUser.id, optimisticId) ? optimisticUser : currentUser
                )
            );

            if (previousUser) {
                transitionSetBrands((currentBrands) =>
                    syncBrandsFromUserMutation(
                        currentBrands,
                        previousUser.name,
                        optimisticUser.name,
                        previousUser.role,
                        optimisticUser.role
                    )
                );
            }
        } else {
            transitionSetUsers((currentUsers) => [optimisticUser, ...currentUsers]);
        }

        setUserInput(createEmptyUserInput());
        setEditingUserId(null);
        setIsUserModalOpen(false);

        const request = isEditing
            ? axios.post(`/users/update/${editingUserId}`, payload)
            : axios.post('/users', { ...payload, password: userInput.password });

        request
            .then((response) => {
                const savedUser = normalizeUserRecord(response?.data?.user || {});
                if (!savedUser.id) {
                    throw new Error('USER_RESPONSE_MISSING_ID');
                }

                transitionSetUsers((currentUsers) =>
                    currentUsers.map((currentUser) =>
                        isSameEntityId(currentUser.id, optimisticId) ? savedUser : currentUser
                    )
                );

                if (isEditing && previousUser) {
                    transitionSetBrands((currentBrands) =>
                        syncBrandsFromUserMutation(
                            currentBrands,
                            previousUser.name,
                            savedUser.name,
                            previousUser.role,
                            savedUser.role
                        )
                    );
                }

                showToast(isEditing ? "Data pengguna berhasil diperbarui!" : "Akun pengguna baru berhasil dibuat!");
            })
            .catch((error) => {
                transitionSetUsers(previousUsersSnapshot);
                transitionSetBrands(previousBrandsSnapshot);
                setUserInput(draftInputSnapshot);
                setEditingUserId(previousEditingUserId);
                setIsUserModalOpen(previousIsUserModalOpen);

                if (error?.message === 'USER_RESPONSE_MISSING_ID') {
                    showToast("Respons server tidak lengkap. Data pengguna dikembalikan seperti semula.", "error");
                    return;
                }

                const errors = error?.response?.data?.errors || {};
                showToast(
                    getFirstErrorMessage(errors, isEditing ? "Gagal memperbarui data pengguna." : "Gagal menambahkan pengguna baru."),
                    "error"
                );
            })
            .finally(() => {
                setUserPendingAction(optimisticId, false);
                userSubmitLockRef.current = false;
                setIsSavingUser(false);
            });
    };

    const handleEditUser = (user) => {
        if (isUserPendingAction(user.id)) return;

        userSubmitLockRef.current = false;
        setIsSavingUser(false);
        setUserInput({
            name: user.name || '',
            email: user.email || '',
            role: normalizeUserRole(user.role),
            password: '',
            status: normalizeUserStatus(user.status),
        });
        setEditingUserId(user.id);
        setIsUserModalOpen(true);
    };

    const handleCancelEditUser = () => {
        if (isSavingUser) return;

        userSubmitLockRef.current = false;
        setIsSavingUser(false);
        setUserInput(createEmptyUserInput());
        setEditingUserId(null);
        setIsUserModalOpen(false);
    };

    const handleDeleteUser = (id) => {
        if (isUserPendingAction(id)) {
            return;
        }

        const targetUser = systemUsers.find((user) => isSameEntityId(user.id, id));
        if (!targetUser) {
            return;
        }

        if (wouldLeaveNoActiveSuperAdmin(targetUser, 'Brand Owner', 0)) {
            showToast("Minimal harus ada 1 akun Super Admin aktif. Akun ini tidak bisa dihapus.", "error");
            return;
        }

        setConfirmObj({
            isOpen: true,
            title: "Hapus Akun Pengguna?",
            message: "Pengguna ini tidak akan bisa lagi login ke dalam sistem. Lanjutkan?",
            onConfirm: () => {
                if (isUserPendingAction(id)) {
                    return;
                }

                const previousUsersSnapshot = systemUsers;
                const previousBrandsSnapshot = brands;
                const previousUserInput = { ...userInput };
                const previousEditingUserId = editingUserId;
                const previousIsUserModalOpen = isUserModalOpen;

                setUserPendingAction(id, true);
                transitionSetUsers((currentUsers) =>
                    currentUsers.filter((currentUser) => !isSameEntityId(currentUser.id, id))
                );
                transitionSetBrands((currentBrands) =>
                    detachBrandsFromDeletedOwner(currentBrands, targetUser.name, targetUser.role)
                );

                if (isSameEntityId(editingUserId, id)) {
                    setUserInput(createEmptyUserInput());
                    setEditingUserId(null);
                    setIsUserModalOpen(false);
                }

                showToast("Menghapus akun pengguna...", 'info');
                axios.delete(`/users/${id}`)
                    .then((response) => {
                        const deletedId = Number(response?.data?.deleted_id || id);

                        transitionSetUsers((currentUsers) =>
                            currentUsers.filter((currentUser) => Number(currentUser.id) !== deletedId)
                        );

                        showToast("Akun pengguna berhasil dihapus!");
                    })
                    .catch((error) => {
                        transitionSetUsers(previousUsersSnapshot);
                        transitionSetBrands(previousBrandsSnapshot);
                        setUserInput(previousUserInput);
                        setEditingUserId(previousEditingUserId);
                        setIsUserModalOpen(previousIsUserModalOpen);

                        const errors = error?.response?.data?.errors || {};
                        showToast(getFirstErrorMessage(errors, "Gagal menghapus akun pengguna."), "error");
                    })
                    .finally(() => {
                        setUserPendingAction(id, false);
                    });
            }
        });
    };

    const handleToggleUserStatus = (user) => {
        if (isUserPendingAction(user.id)) {
            return;
        }

        const previousStatus = normalizeUserStatus(user.status);
        const newStatus = previousStatus === 1 ? 0 : 1;
        if (wouldLeaveNoActiveSuperAdmin(user, user.role, newStatus)) {
            showToast("Minimal harus ada 1 akun Super Admin aktif. Akun ini tidak bisa dinonaktifkan.", "error");
            return;
        }

        setUserPendingAction(user.id, true);
        transitionSetUsers((currentUsers) =>
            currentUsers.map((currentUser) =>
                isSameEntityId(currentUser.id, user.id) ? { ...currentUser, status: newStatus } : currentUser
            )
        );

        if (isSameEntityId(editingUserId, user.id)) {
            setUserInput((currentInput) => ({ ...currentInput, status: newStatus }));
        }

        showToast(`Memperbarui status pengguna ${user.name}...`, 'info');
        axios.post(`/users/${user.id}/status`, { status: newStatus })
            .then((response) => {
                const savedUser = normalizeUserRecord(response?.data?.user || { ...user, status: newStatus });

                transitionSetUsers((currentUsers) =>
                    currentUsers.map((currentUser) =>
                        isSameEntityId(currentUser.id, user.id) ? savedUser : currentUser
                    )
                );

                if (isSameEntityId(editingUserId, user.id)) {
                    setUserInput((currentInput) => ({
                        ...currentInput,
                        status: normalizeUserStatus(savedUser.status),
                    }));
                }

                showToast(`Akses pengguna berhasil di${isUserActive(savedUser.status) ? 'aktifkan' : 'nonaktifkan'}.`);
            })
            .catch((error) => {
                const errors = error?.response?.data?.errors || {};

                transitionSetUsers((currentUsers) =>
                    currentUsers.map((currentUser) =>
                        isSameEntityId(currentUser.id, user.id) ? { ...currentUser, status: previousStatus } : currentUser
                    )
                );

                if (isSameEntityId(editingUserId, user.id)) {
                    setUserInput((currentInput) => ({ ...currentInput, status: previousStatus }));
                }

                showToast(getFirstErrorMessage(errors, "Gagal mengubah status pengguna."), "error");
            })
            .finally(() => {
                setUserPendingAction(user.id, false);
            });
    };

    const handleOpenPasswordModal = (user) => {
        setIsSavingPassword(false);
        setPasswordData({ userId: user.id, userName: user.name, newPassword: '', confirmPassword: '' });
        setIsPasswordModalOpen(true);
    };

    const handleSavePassword = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast("Sandi tidak cocok! Silakan periksa kembali.", "error");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            showToast("Sandi minimal 8 karakter.", "error");
            return;
        }

        setIsSavingPassword(true);
        axios.post(`/users/${passwordData.userId}/reset-password`, {
            password: passwordData.newPassword,
            password_confirmation: passwordData.confirmPassword,
        })
            .then(() => {
                showToast(`Sandi untuk pengguna ${passwordData.userName} berhasil diperbarui!`);
                setIsPasswordModalOpen(false);
            })
            .catch((error) => {
                const errors = error?.response?.data?.errors || {};
                showToast(getFirstErrorMessage(errors, "Gagal memperbarui sandi pengguna."), "error");
            })
            .finally(() => {
                setIsSavingPassword(false);
            });
    };

    // --- LOGIC CATEGORY & TAGS ---
    const handleGenerateTags = (e) => {
        e.preventDefault();
        if (tagSubmitLockRef.current || isSavingBatch) return;
        if (!tagConfig.productId) {
            showToast("Pilih produk terlebih dahulu!", "error");
            return;
        }

        const qty = Number(tagConfig.quantity) || 0;
        if (qty < 1) {
            showToast("Jumlah tag minimal 1.", "error");
            return;
        }

        const product = products.find((item) => String(item.id) === String(tagConfig.productId));
        if (!product) {
            showToast("Produk tidak ditemukan. Silakan pilih ulang produk.", "error");
            return;
        }

        const relatedBrand = brands.find((brand) =>
            Number(brand.id) === Number(product.brandId) ||
            String(brand.name || '').trim() === String(product.brandName || '').trim()
        );

        tagSubmitLockRef.current = true;
        setIsSavingBatch(true);

        showToast("Membuat batch tag...", 'info');
        axios.post('/tag-batches', {
            product_name: product.name,
            brand_name: product.brandName || relatedBrand?.name || '',
            brand_code: relatedBrand?.brand_code || '',
            quantity: qty,
            random_length: Number(tagConfig.randomLength) || 5,
        })
            .then((response) => {
                const createdBatch = normalizeBatchRecord(response?.data?.batch || {});
                if (!createdBatch.id) {
                    throw new Error('TAG_BATCH_RESPONSE_MISSING_ID');
                }

                transitionSetBatches((currentBatches) => [createdBatch, ...currentBatches]);
                setGeneratedQR({
                    code: createdBatch.firstCode,
                    productName: createdBatch.productName,
                    count: createdBatch.qty,
                    batchId: createdBatch.id,
                    randomLength: Number(tagConfig.randomLength) || 5,
                });
                setIsTagModalOpen(true);
                showToast(`Batch ${createdBatch.id} berhasil dibuat!`);
            })
            .catch((error) => {
                const errors = error?.response?.data?.errors || {};

                if (error?.message === 'TAG_BATCH_RESPONSE_MISSING_ID') {
                    showToast("Respons server generate batch tidak lengkap. Silakan coba lagi.", "error");
                    return;
                }

                showToast(getFirstErrorMessage(errors, "Gagal membuat batch tag."), "error");
            })
            .finally(() => {
                tagSubmitLockRef.current = false;
                setIsSavingBatch(false);
            });
    };

    const addCategory = (level) => {
        if (categorySubmitLockRef.current || isSavingCategory) {
            return;
        }

        let name = '';
        let parentId = null;

        if (level === 1) {
            name = newCatL1Name.trim();
        } else if (level === 2 && selectedCatL1) {
            name = newCatL2Name.trim();
            parentId = selectedCatL1;
        } else if (level === 3 && selectedCatL2) {
            name = newCatL3Name.trim();
            parentId = selectedCatL2;
        }

        if (!name) {
            showToast("Nama kategori tidak boleh kosong.", "error");
            return;
        }

        const tempId = generateTempNumericId();
        const previousCategoriesSnapshot = categories;
        const previousSelectedCatL1 = selectedCatL1;
        const previousSelectedCatL2 = selectedCatL2;

        categorySubmitLockRef.current = true;
        setIsSavingCategory(true);

        transitionSetCategories((currentCategories) =>
            insertCategoryNode(currentCategories, level, parentId, {
                id: tempId,
                name,
            })
        );

        if (level === 1) {
            setSelectedCatL1(tempId);
            setSelectedCatL2(null);
            setNewCatL1Name('');
        }
        if (level === 2) {
            setSelectedCatL2(tempId);
            setNewCatL2Name('');
        }
        if (level === 3) {
            setNewCatL3Name('');
        }

        showToast("Menambahkan kategori...", 'info');
        axios.post('/product-categories', {
            name,
            parent_id: parentId,
        })
            .then((response) => {
                const createdCategory = response?.data?.category;
                if (!createdCategory?.id) {
                    throw new Error('CATEGORY_RESPONSE_MISSING_ID');
                }

                transitionSetCategories((currentCategories) => {
                    const createdLevel = Number(createdCategory.level || level);
                    return replaceCategoryNodeId(currentCategories, createdLevel, tempId, createdCategory);
                });

                const createdCategoryId = Number(createdCategory.id);
                const createdLevel = Number(createdCategory.level || level);
                if (createdLevel === 1) {
                    setSelectedCatL1((currentSelected) =>
                        isSameEntityId(currentSelected, tempId) ? createdCategoryId : currentSelected
                    );
                }
                if (createdLevel === 2) {
                    setSelectedCatL2((currentSelected) =>
                        isSameEntityId(currentSelected, tempId) ? createdCategoryId : currentSelected
                    );
                }

                showToast("Kategori baru berhasil ditambahkan!");
            })
            .catch((error) => {
                transitionSetCategories(previousCategoriesSnapshot);
                setSelectedCatL1(previousSelectedCatL1);
                setSelectedCatL2(previousSelectedCatL2);
                if (level === 1) setNewCatL1Name(name);
                if (level === 2) setNewCatL2Name(name);
                if (level === 3) setNewCatL3Name(name);

                if (error?.message === 'CATEGORY_RESPONSE_MISSING_ID') {
                    showToast("Respons server kategori tidak lengkap. Data dikembalikan seperti semula.", "error");
                    return;
                }

                const errors = error?.response?.data?.errors || {};
                showToast(getFirstErrorMessage(errors, "Gagal menambahkan kategori."), "error");
            })
            .finally(() => {
                categorySubmitLockRef.current = false;
                setIsSavingCategory(false);
            });
    };

    const deleteCategory = (level, id) => {
        if (categorySubmitLockRef.current || isSavingCategory) {
            return;
        }

        let title = "";
        let msg = "";
        if (level === 1) { title = "Hapus Kategori Utama?"; msg = "Semua sub-kategori di dalamnya akan ikut terhapus permanen."; }
        if (level === 2) { title = "Hapus Sub Kategori?"; msg = "Semua varian di dalamnya akan ikut terhapus permanen."; }
        if (level === 3) { title = "Hapus Varian?"; msg = "Varian kategori ini akan dihapus secara permanen."; }

        setConfirmObj({
            isOpen: true,
            title: title,
            message: msg,
            onConfirm: () => {
                const previousCategoriesSnapshot = categories;
                const previousSelectedCatL1 = selectedCatL1;
                const previousSelectedCatL2 = selectedCatL2;

                categorySubmitLockRef.current = true;
                setIsSavingCategory(true);

                transitionSetCategories((currentCategories) =>
                    removeCategoryNode(currentCategories, level, id)
                );
                if (level === 1 && isSameEntityId(selectedCatL1, id)) {
                    setSelectedCatL1(null);
                    setSelectedCatL2(null);
                } else if (level === 2 && isSameEntityId(selectedCatL2, id)) {
                    setSelectedCatL2(null);
                }

                showToast("Menghapus kategori...", 'info');
                axios.delete(`/product-categories/${id}`)
                    .then((response) => {
                        const deletedId = Number(response?.data?.deleted_id || id);
                        transitionSetCategories((currentCategories) =>
                            removeCategoryNode(currentCategories, level, deletedId)
                        );

                        showToast("Kategori berhasil dihapus!");
                    })
                    .catch((error) => {
                        transitionSetCategories(previousCategoriesSnapshot);
                        setSelectedCatL1(previousSelectedCatL1);
                        setSelectedCatL2(previousSelectedCatL2);

                        const errors = error?.response?.data?.errors || {};
                        showToast(getFirstErrorMessage(errors, "Gagal menghapus kategori."), "error");
                    })
                    .finally(() => {
                        categorySubmitLockRef.current = false;
                        setIsSavingCategory(false);
                    });
            }
        });
    };

    // --- UI COMPONENTS ---
    const {
        Dashboard,
        BrandManager,
        CategoryManager,
        ProductForm,
        ProductManager,
        TagGenerator,
        UserManager,
        ScanHistory,
        Settings,
    } = createAdminPanelViews({
        PRODUCT_SPEC_SCHEMA,
        PageAlert,
        StatCard,
        ToggleSwitch,
        Tooltip,
        LeafletMap,
        SortIcon,
        showToast,
        handleSortChange,
        openCreateBrandModal,
        handleCancelEditBrand,
        handleSaveBrand,
        setLogoFile,
        setLogoPreviewFromFile,
        brandInput,
        setBrandInput,
        systemUsers,
        normalizeBrandStatus,
        normalizeUserRole,
        normalizeUserStatus,
        isUserActive,
        isSavingBrand,
        editingBrandId,
        handleEditBrand,
        handleDeleteBrand,
        isBrandActive,
        toggleBrandStatusAutoSave,
        savingBrandStatusId,
        isBrandModalOpen,
        setActiveTab,
        openCreateProductForm,
        createEmptyProductInput,
        handleCancelEditProduct,
        handleSaveProduct,
        isSavingProduct,
        productInput,
        setProductInput,
        productImagePreview,
        handleProductImageInputChange,
        activeFormSection,
        setActiveFormSection,
        categories,
        catSearchKeyword,
        setCatSearchKeyword,
        tempCategory,
        setTempCategory,
        isCategoryModalOpen,
        setIsCategoryModalOpen,
        setEditingProductId,
        handleEditProduct,
        handleDeleteProduct,
        selectedProductDetail,
        setSelectedProductDetail,
        tagConfig,
        setTagConfig,
        handleGenerateTags,
        isSavingBatch,
        batches,
        batchSort,
        setBatchSort,
        generatedQR,
        isTagModalOpen,
        setIsTagModalOpen,
        normalizeBatchRecord,
        setBatches: transitionSetBatches,
        setIsSavingBatch,
        setBatchPendingAction,
        isBatchPendingAction,
        isSameEntityId,
        setConfirmObj,
        getFirstErrorMessage,
        userInput,
        setUserInput,
        createEmptyUserInput,
        handleSaveUser,
        isSavingUser,
        editingUserId,
        setEditingUserId,
        isUserModalOpen,
        setIsUserModalOpen,
        handleCancelEditUser,
        handleEditUser,
        handleDeleteUser,
        handleToggleUserStatus,
        isUserPendingAction,
        userSubmitLockRef,
        wouldLeaveNoActiveSuperAdmin,
        handleOpenPasswordModal,
        isPasswordModalOpen,
        setIsPasswordModalOpen,
        passwordData,
        setPasswordData,
        handleSavePassword,
        isSavingPassword,
        globalSearch,
        brands,
        products,
        totalGeneratedTagCount,
        brandSort,
        setBrandSort,
        productSort,
        setProductSort,
        userSort,
        setUserSort,
        scanSort,
        setScanSort,
        selectedBatchDetail,
        setSelectedBatchDetail,
        suspendReasonModal,
        setSuspendReasonModal,
        markBrandLogoBroken,
        buildBrandLogoSrc,
        buildProductImageUrl,
        brokenBrandLogoIds,
        logoPreview,
        selectedCatL1,
        setSelectedCatL1,
        selectedCatL2,
        setSelectedCatL2,
        newCatL1Name,
        setNewCatL1Name,
        newCatL2Name,
        setNewCatL2Name,
        newCatL3Name,
        setNewCatL3Name,
        addCategory,
        isSavingCategory,
        deleteCategory,
        requireGps,
        setRequireGps,
        emailNotif,
        setEmailNotif,
        scanValidLimit,
        setScanValidLimit,
        isSavingSecuritySettings,
        handleSaveSecuritySettings,
        scanLogs,
        scanActivitiesCount,
        selectedScanLogDetail,
        statusFilter,
        setStatusFilter,
        setSelectedScanLogDetail,
        isRefreshingScanLogs,
        isBrandOwnerRole,
        isSuperAdminRole,
        authUser,
        accountEmailInput,
        setAccountEmailInput,
        isSavingAccountEmail,
        handleSaveAccountEmail,
        accountPasswordInput,
        setAccountPasswordInput,
        isSavingAccountPassword,
        handleSaveAccountPassword,
    });

    const masterDataItems = MASTER_DATA_ITEMS.map((item) =>
        item.id === 'tags' ? { ...item, label: 'Tag/QR Code' } : item
    );
    const systemItems = SYSTEM_ITEMS.filter((item) => !(isBrandOwnerRole && item.id === 'users'));
    const isSidebarItemActive = (id) => (
        id === 'product'
            ? (activeTab === 'product' || activeTab === 'product_form')
            : activeTab === id
    );

    const SidebarItem = ({ icon: Icon, label, id, isSub = false }) => (
        <Tooltip text={isSidebarMinimized ? label : ""} position="right" wrapperClass={`w-full ${isSidebarMinimized ? 'flex justify-center' : ''}`}>
            <button
                onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 py-2.5 rounded-lg transition-all text-sm w-full
          ${isSidebarMinimized ? 'px-0 justify-center' : (isSub ? 'pl-9 pr-3 justify-start' : 'px-3 justify-start')}
          ${isSidebarItemActive(id)
                        ? 'bg-[#C1986E]/10 text-[#C1986E] font-bold border border-[#C1986E]/20'
                        : 'text-slate-600 hover:bg-slate-100 font-medium border border-transparent'
                    }
        `}
            >
                <Icon size={isSub && !isSidebarMinimized ? 16 : 18} className={`${isSidebarItemActive(id) ? 'text-[#C1986E]' : 'text-slate-400'} flex-shrink-0`} />
                {!isSidebarMinimized && <span className="truncate">{label}</span>}
            </button>
        </Tooltip>
    );

    return (
        <div className={`h-screen w-full flex font-sans overflow-hidden ${isDarkMode ? 'admin-theme-dark bg-slate-950 text-slate-100' : 'bg-[#F8F9FA] text-slate-800'}`}>
            <Head title="Dashboard Admin MKI" />
            {/* Toast Notification */}
            {toast.isOpen && (
                <div className={`fixed top-6 right-6 z-[500] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white font-medium animate-in slide-in-from-right-8 fade-in ${toast.type === 'success' ? 'bg-emerald-600' : (toast.type === 'info' ? 'bg-sky-600' : 'bg-red-500')}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    {toast.message}
                </div>
            )}

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen ${isSidebarMinimized ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 shadow-sm transition-all duration-300 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className={`relative p-4 md:p-6 border-b border-slate-100 flex items-center ${isSidebarMinimized ? 'justify-center' : 'justify-between'}`}>
                    <div className="flex items-center gap-2 overflow-hidden">
                        <img
                            src="/img/LOGO_TOP.png"
                            alt="MKI Site Logo"
                            className={isSidebarMinimized ? 'w-8 h-8 object-contain rounded-sm' : 'h-8 w-auto object-contain'}
                        />
                    </div>
                    <button className="hidden md:flex items-center justify-center absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 text-slate-400 rounded-full shadow-sm z-50 hover:text-[#C1986E]" onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}>
                        {isSidebarMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                {/* Tambahkan overflow-x-hidden pada baris di bawah ini */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1 custom-scrollbar">
                    <SidebarItem
                        icon={DASHBOARD_ITEM.icon}
                        label={DASHBOARD_ITEM.label}
                        id={DASHBOARD_ITEM.id}
                        isSub={DASHBOARD_ITEM.isSub}
                    />
                    <div className="pt-2">
                        {!isSidebarMinimized && <p className="px-3 text-xs font-bold uppercase text-slate-400 mb-2">Master Data</p>}
                        {masterDataItems.map((item) => (
                            <SidebarItem
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                id={item.id}
                                isSub={item.isSub}
                            />
                        ))}
                    </div>
                    <div className="pt-2">
                        {systemItems.map((item) => (
                            <SidebarItem
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                id={item.id}
                                isSub={item.isSub}
                            />
                        ))}
                    </div>
                </div>

                {/* User Profile & Logout - Bottom of Sidebar */}
                <div className={`p-4 border-t border-slate-200 flex items-center ${isSidebarMinimized ? 'justify-center cursor-pointer hover:bg-red-50 transition-colors group' : 'justify-between'} bg-slate-50`} onClick={isSidebarMinimized ? handleLogout : undefined}>
                    {isSidebarMinimized ? (
                        <Tooltip text="Logout" position="right">
                            <LogOut size={20} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                        </Tooltip>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C1986E] to-[#A37E58] text-white flex items-center justify-center font-bold flex-shrink-0 text-sm shadow-sm">
                                    {sidebarUserInitials}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-bold text-slate-800 truncate">{sidebarUserName}</span>
                                    <span className="text-[10px] text-slate-500 truncate">{sidebarUserRole}</span>
                                </div>
                            </div>
                            <Tooltip text="Keluar Sistem" position="top">
                                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95 flex-shrink-0">
                                    <LogOut size={16} />
                                </button>
                            </Tooltip>
                        </>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between flex-shrink-0 z-30 relative shadow-sm">
                    <h1 className="text-lg md:text-xl font-bold text-slate-800">{getPageTitle(activeTab)}</h1>
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsDarkMode((prev) => !prev)}
                            className={`inline-flex items-center h-10 gap-2 px-3 rounded-lg border text-sm font-semibold transition-all shadow-sm active:scale-95 ${
                                isDarkMode
                                    ? 'bg-slate-800 text-amber-200 border-slate-600 hover:bg-slate-700'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
                            <span className="hidden lg:inline">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                        <div className="admin-global-search-shell flex items-center h-10 gap-2 bg-slate-100 px-3 rounded-lg border border-slate-200">
                            <Search size={16} className="text-slate-400" />
                            <input type="text" placeholder="Cari data..." className="admin-global-search-input h-full bg-transparent border-none outline-none text-sm w-48 focus:ring-0" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} />
                        </div>
                    </div>
                </header>
                <div
                    className={`flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth ${activeTab === 'product_form' ? 'pt-0 md:pt-0' : ''}`}
                    id="main-scroll-container"
                >
                    <div className="max-w-7xl mx-auto">
                        {activeTab === 'dashboard' && <Dashboard />}
                        {activeTab === 'brand' && <BrandManager />}
                        {activeTab === 'categories' && <CategoryManager />}
                        {activeTab === 'product' && <ProductManager />}
                        {activeTab === 'product_form' && <ProductForm />}
                        {activeTab === 'tags' && <TagGenerator />}
                        {activeTab === 'users' && <UserManager />}
                        {activeTab === 'scan_history' && <ScanHistory />}
                        {activeTab === 'settings' && <Settings />}
                    </div>
                </div>
            </main>

            {isBrandModalOpen && (
                <div
                    className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => { if (!isSavingBrand) handleCancelEditBrand(); }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2 text-slate-800">
                                {editingBrandId ? <Edit size={18} className="text-[#C1986E]" /> : <Building2 size={18} className="text-[#C1986E]" />}
                                {editingBrandId ? "Edit Data Brand" : "Registrasi Brand Baru"}
                            </h3>
                            <button
                                disabled={isSavingBrand}
                                onClick={handleCancelEditBrand}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all p-1.5 rounded-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveBrand} className="flex flex-col overflow-hidden">
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    <label className="w-full sm:w-40 aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-[#C1986E] transition-all group bg-slate-50/50 p-4 flex-shrink-0 relative overflow-hidden">
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleBrandLogoInputChange}
                                        />

                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                                        ) : (
                                            <>
                                                <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                                    <UploadCloud className="group-hover:text-[#C1986E]" size={20} />
                                                </div>
                                                <span className="text-[11px] font-medium text-center px-2">Logo Brand</span>
                                                <span className="text-[9px] text-slate-300 mt-1">(1:1 Ratio)</span>
                                            </>
                                        )}
                                    </label>

                                    <div className="flex-1 w-full space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nama Brand</label>
                                            <input
                                                type="text"
                                                placeholder="Contoh: BeautyCare ID"
                                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] transition-shadow text-sm"
                                                value={brandInput.name}
                                                onChange={(event) => setBrandInput({ ...brandInput, name: event.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pemilik Brand (Brand Owner)</label>
                                            <select
                                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-white text-sm"
                                                value={brandInput.owner_name}
                                                onChange={(event) => setBrandInput({ ...brandInput, owner_name: event.target.value })}
                                            >
                                                <option value="">-- Pilih Pemilik (Opsional) --</option>
                                                {systemUsers
                                                    .filter((user) => normalizeUserRole(user.role) === "Brand Owner" && isUserActive(user.status))
                                                    .map((user) => (
                                                        <option key={user.id} value={user.name}>{user.name}</option>
                                                    ))}
                                            </select>
                                            <p className="text-[10px] text-slate-400">Pilih pengguna yang akan memiliki akses ke data analitik brand ini.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Deskripsi / Catatan</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Deskripsi singkat brand atau catatan khusus..."
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] transition-shadow resize-none text-sm"
                                        value={brandInput.description}
                                        onChange={(event) => setBrandInput({ ...brandInput, description: event.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    disabled={isSavingBrand}
                                    onClick={handleCancelEditBrand}
                                    className="px-6 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingBrand}
                                    className="px-6 py-2.5 rounded-lg font-medium text-white bg-[#C1986E] hover:bg-[#A37E58] transition-all shadow-sm active:scale-95 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSavingBrand ? "Menyimpan..." : (editingBrandId ? "Simpan Perubahan" : "Simpan Brand")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
        .animate-bar { transform-origin: bottom; animation: barGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform: scaleY(0); }
        @keyframes barGrow { to { transform: scaleY(1); } }
        .admin-theme-dark { background-color: #020617; color: #e2e8f0; }
        .admin-theme-dark .bg-white { background-color: #0f172a !important; }
        .admin-theme-dark .bg-white\\/90 { background-color: rgba(15, 23, 42, 0.9) !important; }
        .admin-theme-dark .bg-white\\/80 { background-color: rgba(15, 23, 42, 0.8) !important; }
        .admin-theme-dark .bg-slate-50 { background-color: #111827 !important; }
        .admin-theme-dark .bg-slate-50\\/50 { background-color: rgba(17, 24, 39, 0.78) !important; }
        .admin-theme-dark .bg-slate-50\\/30 { background-color: rgba(17, 24, 39, 0.58) !important; }
        .admin-theme-dark .bg-slate-100 { background-color: #1f2937 !important; }
        .admin-theme-dark .bg-slate-100\\/50 { background-color: rgba(30, 41, 59, 0.62) !important; }
        .admin-theme-dark .border-slate-100,
        .admin-theme-dark .border-slate-200 { border-color: #334155 !important; }
        .admin-theme-dark .border-blue-100 { border-color: rgba(59, 130, 246, 0.4) !important; }
        .admin-theme-dark .bg-blue-50 { background-color: rgba(30, 58, 138, 0.25) !important; }
        .admin-theme-dark .text-slate-800 { color: #e2e8f0 !important; }
        .admin-theme-dark .text-slate-700 { color: #cbd5e1 !important; }
        .admin-theme-dark .text-slate-600 { color: #cbd5e1 !important; }
        .admin-theme-dark .text-slate-500,
        .admin-theme-dark .text-slate-400 { color: #94a3b8 !important; }
        .admin-theme-dark .shadow-sm,
        .admin-theme-dark .shadow-md,
        .admin-theme-dark .shadow-xl { box-shadow: 0 10px 30px rgba(2, 6, 23, 0.35) !important; }
        .admin-theme-dark input,
        .admin-theme-dark select,
        .admin-theme-dark textarea { background-color: #0b1220 !important; color: #e2e8f0 !important; border-color: #334155 !important; }
        .admin-global-search-input,
        .admin-theme-dark .admin-global-search-input {
          background-color: transparent !important;
          box-shadow: none !important;
        }
        .admin-theme-dark .admin-global-search-input { color: #e2e8f0 !important; }
        .admin-theme-dark .admin-global-search-shell {
          background-color: #111827 !important;
          border-color: #334155 !important;
        }
        .admin-theme-dark .batch-total-pill {
          background-color: #1f2937 !important;
          border-color: #334155 !important;
        }
        .admin-theme-dark .batch-total-label { color: #cbd5e1 !important; }
        .admin-theme-dark .batch-total-value { color: #f5d0a8 !important; }
        .admin-theme-dark .batch-count-pill {
          background-color: #1e293b !important;
          color: #e2e8f0 !important;
        }
        .admin-theme-dark input::placeholder,
        .admin-theme-dark textarea::placeholder { color: #64748b !important; }
        .admin-theme-dark .hover\\:bg-slate-50:hover,
        .admin-theme-dark .hover\\:bg-slate-100:hover { background-color: #1e293b !important; }
        .admin-theme-dark .hover\\:bg-slate-50\\/50:hover { background-color: rgba(30, 41, 59, 0.72) !important; }
        .admin-theme-dark .group:hover .group-hover\\:bg-slate-100\\/50 { background-color: rgba(30, 41, 59, 0.62) !important; }
        .admin-theme-dark .bg-slate-50\\/60 { background-color: rgba(15, 23, 42, 0.86) !important; }
        .admin-theme-dark .grayscale-\\[20\\%\\] { filter: none !important; }
        .admin-theme-dark .bg-black\\/50 { background-color: rgba(2, 6, 23, 0.75) !important; }
      `}} />

            {/* Global Confirm Modal */}
            {confirmObj.isOpen && (
                <div
                    className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setConfirmObj({ ...confirmObj, isOpen: false })} // Fungsi tutup saat klik background
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col text-center"
                        onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
                    >
                        <div className="p-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">{confirmObj.title}</h3>
                            <p className="text-sm text-slate-500 mt-2">{confirmObj.message}</p>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button onClick={() => setConfirmObj({ ...confirmObj, isOpen: false })} className="flex-1 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-all active:scale-95 text-sm">Batal</button>
                            <button onClick={() => { confirmObj.onConfirm?.(); setConfirmObj({ ...confirmObj, isOpen: false }); }} className="flex-1 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm active:scale-95 text-sm">Ya, Lanjutkan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
