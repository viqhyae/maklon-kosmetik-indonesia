import React, { useState, useEffect, useRef, startTransition } from 'react';
import {
    Search,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    CheckCircle2,
    ShieldCheck,
    LogOut,
} from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    DASHBOARD_ITEM,
    MASTER_DATA_ITEMS,
    SYSTEM_ITEMS
} from './AdminPanel/Sidebar';
import createAdminPanelViews from './AdminPanel/Views/createAdminPanelViews';
import { INITIAL_CATEGORY_DATA, PRODUCT_SPEC_SCHEMA } from './AdminPanel/config/productCatalog';
import StatCard from './AdminPanel/components/StatCard';
import PageAlert from './AdminPanel/components/PageAlert';
import ToggleSwitch from './AdminPanel/components/ToggleSwitch';
import Tooltip from './AdminPanel/components/Tooltip';
import LeafletMap from './AdminPanel/components/LeafletMap';
import SortIcon from './AdminPanel/components/SortIcon';

export default function AdminPanel({ databaseBrands, databaseCategories, databaseUsers, databaseTagBatches }) {
    const authUser = usePage().props?.auth?.user || null;
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMasterDataOpen, setIsMasterDataOpen] = useState(true);
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

    // --- STATE ALERT & MODAL KONFIRMASI (GLOBAL) ---
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
    const [confirmObj, setConfirmObj] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const showToast = (message, type = 'success') => {
        setToast({ isOpen: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, isOpen: false })), 3000);
    };

    // --- STATE MODAL UTAMA ---
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedProductDetail, setSelectedProductDetail] = useState(null);
    const [selectedBatchDetail, setSelectedBatchDetail] = useState(null);

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
    const [scanSort, setScanSort] = useState({ key: 'time', direction: 'asc' });

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
            case 'tags': return 'Generate Tag/QR';
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
        settings: {
            randomLength: normalizeBatchRandomLength(batch?.settings),
        },
    });
    const createEmptyUserInput = () => ({ name: '', email: '', role: 'Brand Owner', password: '', status: 1 });
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
    const logoPreviewObjectUrlRef = useRef(null);
    const releaseLogoPreviewObjectUrl = () => {
        if (logoPreviewObjectUrlRef.current) {
            URL.revokeObjectURL(logoPreviewObjectUrlRef.current);
            logoPreviewObjectUrlRef.current = null;
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

    const [brands, setBrands] = useState((databaseBrands || []).map(normalizeBrandRecord));
    useEffect(() => {
        setBrands((databaseBrands || []).map(normalizeBrandRecord));
    }, [databaseBrands]);

    const [categories, setCategories] = useState(
        Array.isArray(databaseCategories) ? databaseCategories : INITIAL_CATEGORY_DATA
    );
    useEffect(() => {
        setCategories(Array.isArray(databaseCategories) ? databaseCategories : INITIAL_CATEGORY_DATA);
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

    const [products, setProducts] = useState([
        {
            id: 101, name: "Luxury Rose EDP 30ml", brandId: 3, brandName: "Luxe Scents",
            description: "Parfum wangi mawar mewah dengan botol kaca. Mengandung ekstrak mawar asli dengan ketahanan hingga 12 jam. Cocok untuk acara formal maupun daily use.",
            categoryPath: "Perawatan & Kecantikan > Parfum & Wewangian > Eau De Parfum (EDP)",
            catL1: 1, catL2: 11, catL3: 111,
            skuCode: "LS-EDP-ROS-30",
            dynamicFields: { topNotes: "Bergamot, Mandarin", baseNotes: "Vanilla, Musk, Cedarwood", longevity: "Hingga 12 Jam" }
        },
        {
            id: 102, name: "Acne Fighter Night Cream", brandId: 2, brandName: "DermaBeauty",
            description: "Krim malam untuk kulit berjerawat. Membantu meredakan kemerahan dan mengempeskan jerawat meradang dalam waktu singkat.",
            categoryPath: "Perawatan & Kecantikan > Perawatan Wajah > Pelembab Wajah",
            catL1: 1, catL2: 12, catL3: 123,
            skuCode: "DB-NC-ACN-15",
            dynamicFields: { bpom: "NA1821010001", skinType: "Berminyak & Berjerawat", ingredients: "Niacinamide 5%, Salicylic Acid, Tea Tree Extract" }
        },
        {
            id: 103, name: "Gentle Facial Wash 100ml", brandId: 1, brandName: "Glow & Co",
            description: "Pembersih wajah lembut tanpa busa untuk kulit sensitif.",
            categoryPath: "Perawatan & Kecantikan > Perawatan Wajah > Pembersih Wajah",
            catL1: 1, catL2: 12, catL3: 121,
            skuCode: "GC-FW-GNT-100",
            dynamicFields: { bpom: "NA1821010002", skinType: "Kering & Sensitif", ingredients: "Aloe Vera, Chamomile Extract" }
        },
        {
            id: 104, name: "Hydrating Toner Mist", brandId: 1, brandName: "Glow & Co",
            description: "Toner spray penyegar wajah dengan aloe vera.",
            categoryPath: "Perawatan & Kecantikan > Perawatan Wajah > Facial Mist",
            catL1: 1, catL2: 12, catL3: 125,
            skuCode: "GC-TM-HYD-60",
            dynamicFields: { bpom: "NA1821010003", skinType: "Semua Tipe Kulit", ingredients: "Hyaluronic Acid, Rose Water" }
        },
        {
            id: 105, name: "Coffee Body Scrub", brandId: 5, brandName: "PureNaturals",
            description: "Scrub mandi eksfoliasi aroma kopi.",
            categoryPath: "Perawatan & Kecantikan > Perawatan Tubuh > Scrub & Peel Tubuh",
            catL1: 1, catL2: 13, catL3: 132,
            skuCode: "PN-BS-COF-250",
            dynamicFields: {}
        },
        {
            id: 106, name: "Hair & Body Perfume Sport", brandId: 6, brandName: "Men's Groom",
            description: "Parfum rambut dan badan untuk pria aktif.",

            categoryPath: "Perawatan & Kecantikan > Parfum & Wewangian > Body Mist / Cologne",
            catL1: 1, catL2: 11, catL3: 113,
            skuCode: "MG-BM-SPT-100",
            dynamicFields: { topNotes: "Citrus, Mint", baseNotes: "Sandalwood, Amber", longevity: "6 - 8 Jam" }
        }
    ]);

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

    const [productInput, setProductInput] = useState({
        name: '', brandId: '', description: '', catL1: '', catL2: '', catL3: '', skuCode: '',
        dynamicFields: {} // State baru untuk menyimpan inputan dinamis
    });
    const [editingProductId, setEditingProductId] = useState(null);

    const [selectedCatL1, setSelectedCatL1] = useState(null);
    const [selectedCatL2, setSelectedCatL2] = useState(null);
    const [newCatL1Name, setNewCatL1Name] = useState('');
    const [newCatL2Name, setNewCatL2Name] = useState('');
    const [newCatL3Name, setNewCatL3Name] = useState('');
    const [isSavingCategory, setIsSavingCategory] = useState(false);

    // --- STATE PENGATURAN ---
    const [requireGps, setRequireGps] = useState(true);
    const [emailNotif, setEmailNotif] = useState(false);

    // --- STATE UNTUK FILTER SCAN ---
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const brandSubmitLockRef = useRef(false);
    const userSubmitLockRef = useRef(false);
    const categorySubmitLockRef = useRef(false);
    const tagSubmitLockRef = useRef(false);

    const transitionSetBrands = (updater) => {
        startTransition(() => {
            setBrands(updater);
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
        setBatches((databaseTagBatches || []).map(normalizeBatchRecord));
    }, [databaseTagBatches]);

    useEffect(() => {
        return () => {
            releaseLogoPreviewObjectUrl();
        };
    }, []);

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
    };

    const openCreateBrandModal = () => {
        brandSubmitLockRef.current = false;
        setIsSavingBrand(false);
        closeBrandModal();
        setIsBrandModalOpen(true);
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
                closeBrandModal();
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
        setConfirmObj({
            isOpen: true,
            title: "Hapus Brand?",
            message: "Data brand ini akan dihapus permanen. Produk yang terkait mungkin akan kehilangan referensi. Lanjutkan?",
            onConfirm: () => {
                axios.delete(`/brands/${id}`)
                    .then((response) => {
                        const deletedId = Number(response?.data?.deleted_id || id);

                        setBrands((currentBrands) =>
                            currentBrands.filter((currentBrand) => Number(currentBrand.id) !== deletedId)
                        );

                        if (editingBrandId === deletedId) {
                            closeBrandModal();
                        }

                        showToast("Brand berhasil dihapus!");
                    })
                    .catch((error) => {
                        const errors = error?.response?.data?.errors || {};
                        showToast(getFirstErrorMessage(errors, "Gagal menghapus brand."), "error");
                    });
            }
        });
    };

    const handleCancelEditBrand = () => {
        if (isSavingBrand) return;
        closeBrandModal();
    };

    // --- LOGIC HANDLERS PRODUCT ---
    const handleSaveProduct = (e) => {
        e.preventDefault();
        if (!productInput.name || !productInput.brandId || !productInput.catL3 || !productInput.skuCode) {
            showToast("Mohon lengkapi data wajib produk (Nama, Brand, Kategori, Kode SKU).", "error");
            return;
        }

        // --- CEK SKU KEMBAR (DUPLIKAT) ---
        const isDuplicateSKU = products.some(
            (p) =>
                p.skuCode.toUpperCase() === productInput.skuCode.toUpperCase() &&
                p.id !== editingProductId // Jangan cek produk itu sendiri jika sedang diedit
        );

        if (isDuplicateSKU) {
            showToast(`Kode SKU "${productInput.skuCode.toUpperCase()}" sudah digunakan oleh produk lain! Harap gunakan kode unik.`, "error");
            return; // Hentikan proses simpan
        }
        // ---------------------------------

        const brandName = brands.find(b => b.id == productInput.brandId)?.name;
        const cat1 = categories.find(c => c.id == productInput.catL1);
        const cat2 = cat1?.subCategories.find(c => c.id == productInput.catL2);
        const cat3 = cat2?.subSubCategories.find(c => c.id == productInput.catL3);
        const categoryPath = `${cat1?.name} > ${cat2?.name} > ${cat3?.name}`;

        if (editingProductId) {
            setProducts(products.map(p => p.id === editingProductId ? {
                ...p,
                name: productInput.name,
                brandId: Number(productInput.brandId),
                brandName,
                description: productInput.description || '-',
                categoryPath,
                catL1: productInput.catL1,
                catL2: productInput.catL2,
                catL3: productInput.catL3,
                skuCode: productInput.skuCode.toUpperCase(),
                dynamicFields: productInput.dynamicFields || {} // Simpan data dinamis
            } : p));
            showToast("SKU Produk berhasil diperbarui!");
        } else {
            const newProduct = {
                ...productInput,
                id: Date.now(),
                brandId: Number(productInput.brandId),
                brandName,
                description: productInput.description || '-',
                categoryPath: categoryPath,
                skuCode: productInput.skuCode.toUpperCase(),
                dynamicFields: productInput.dynamicFields || {} // Simpan data dinamis
            };
            setProducts([...products, newProduct]);
            showToast("SKU Produk baru berhasil ditambahkan!");
        }
        setProductInput({ name: '', brandId: '', description: '', catL1: '', catL2: '', catL3: '', skuCode: '', dynamicFields: {} });
        setEditingProductId(null);
        setActiveTab('product');
    };

    const handleEditProduct = (product) => {
        setProductInput({
            name: product.name,
            brandId: product.brandId,
            description: product.description === "-" ? "" : product.description,
            catL1: product.catL1,
            catL2: product.catL2,
            catL3: product.catL3,
            skuCode: product.skuCode || '',
            dynamicFields: product.dynamicFields || {} // Tarik data dinamis saat edit
        });
        setEditingProductId(product.id);
        setActiveTab('product_form');
    };

    const handleCancelEditProduct = () => {
        setProductInput({ name: '', brandId: '', description: '', catL1: '', catL2: '', catL3: '', skuCode: '', dynamicFields: {} });
        setEditingProductId(null);
        setActiveTab('product');
    };

    const handleDeleteProduct = (id) => {
        setConfirmObj({
            isOpen: true,
            title: "Hapus SKU Produk?",
            message: "Data produk ini akan dihapus dari sistem secara permanen. Lanjutkan?",
            onConfirm: () => {
                setProducts(products.filter(p => p.id !== id));
                showToast("SKU Produk berhasil dihapus!");
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

                setBatches((currentBatches) => [createdBatch, ...currentBatches]);
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
        handleCancelEditProduct,
        handleSaveProduct,
        productInput,
        setProductInput,
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
        setBatches,
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
        markBrandLogoBroken,
        buildBrandLogoSrc,
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
        statusFilter,
        setStatusFilter,
    });

    const SidebarItem = ({ icon: Icon, label, id, isSub = false }) => (
        <Tooltip text={isSidebarMinimized ? label : ""} position="right" wrapperClass={`w-full ${isSidebarMinimized ? 'flex justify-center' : ''}`}>
            <button
                onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 py-2.5 rounded-lg transition-all text-sm w-full
          ${isSidebarMinimized ? 'px-0 justify-center' : (isSub ? 'pl-9 pr-3 justify-start' : 'px-3 justify-start')}
          ${activeTab === id
                        ? 'bg-[#C1986E]/10 text-[#C1986E] font-bold border border-[#C1986E]/20'
                        : 'text-slate-600 hover:bg-slate-100 font-medium border border-transparent'
                    }
        `}
            >
                <Icon size={isSub && !isSidebarMinimized ? 16 : 18} className={`${activeTab === id ? 'text-[#C1986E]' : 'text-slate-400'} flex-shrink-0`} />
                {!isSidebarMinimized && <span className="truncate">{label}</span>}
            </button>
        </Tooltip>
    );

    return (
        <div className="h-screen w-full bg-[#F8F9FA] flex text-slate-800 font-sans overflow-hidden">
            {/* Toast Notification */}
            {toast.isOpen && (
                <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white font-medium animate-in slide-in-from-right-8 fade-in ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    {toast.message}
                </div>
            )}

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen ${isSidebarMinimized ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 shadow-sm transition-all duration-300 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className={`relative p-4 md:p-6 border-b border-slate-100 flex items-center ${isSidebarMinimized ? 'justify-center' : 'justify-between'}`}>
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#C1986E] to-[#8C6D4D] rounded flex items-center justify-center">
                            <ShieldCheck className="text-white" size={20} />
                        </div>
                        {!isSidebarMinimized && <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#C1986E] to-[#604932]">MKI-Auth</span>}
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
                        {MASTER_DATA_ITEMS.map((item) => (
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
                        {SYSTEM_ITEMS.map((item) => (
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
                    <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                        <Search size={16} className="text-slate-400" />
                        <input type="text" placeholder="Cari data..." className="bg-transparent border-none outline-none text-sm w-48 focus:ring-0" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} />
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth" id="main-scroll-container">
                    <div className="max-w-7xl mx-auto">
                        {activeTab === 'dashboard' && Dashboard()}
                        {activeTab === 'brand' && BrandManager()}
                        {activeTab === 'categories' && CategoryManager()}
                        {activeTab === 'product' && ProductManager()}
                        {activeTab === 'product_form' && ProductForm()}
                        {activeTab === 'tags' && TagGenerator()}
                        {activeTab === 'users' && UserManager()}
                        {activeTab === 'scan_history' && ScanHistory()}
                        {activeTab === 'settings' && Settings()}
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
        .animate-bar { transform-origin: bottom; animation: barGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform: scaleY(0); }
        @keyframes barGrow { to { transform: scaleY(1); } }
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
