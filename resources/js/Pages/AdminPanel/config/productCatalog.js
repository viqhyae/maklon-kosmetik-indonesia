import { Droplets, FlaskConical, Sparkles } from 'lucide-react';

export const INITIAL_CATEGORY_DATA = [
    {
        id: 1,
        name: "Perawatan & Kecantikan",
        subCategories: [
            {
                id: 11,
                name: "Parfum & Wewangian",
                subSubCategories: [
                    { id: 111, name: "Eau De Parfum (EDP)" },
                    { id: 112, name: "Eau De Toilette (EDT)" },
                    { id: 113, name: "Body Mist / Cologne" },
                    { id: 114, name: "Extrait De Parfum" }
                ]
            },
            {
                id: 12,
                name: "Perawatan Wajah",
                subSubCategories: [
                    { id: 121, name: "Pembersih Wajah" },
                    { id: 122, name: "Toner" },
                    { id: 123, name: "Pelembab Wajah" },
                    { id: 124, name: "Minyak Wajah" },
                    { id: 125, name: "Facial Mist" },
                    { id: 126, name: "Serum & Essence Wajah" },
                    { id: 127, name: "Scrub & Peel Wajah" },
                    { id: 128, name: "Masker Wajah" },
                    { id: 129, name: "Treatment Mata" },
                    { id: 130, name: "Treatment Bibir" }
                ]
            },
            {
                id: 13,
                name: "Perawatan Tubuh",
                subSubCategories: [
                    { id: 131, name: "Sabun Mandi" },
                    { id: 132, name: "Scrub & Peel Tubuh" },
                    { id: 133, name: "Masker Tubuh" },
                    { id: 134, name: "Minyak Tubuh" },
                    { id: 135, name: "Body Cream, Lotion & Butter" },
                    { id: 136, name: "Deodoran" }
                ]
            }
        ]
    }
];

export const PRODUCT_SPEC_SCHEMA = {
    11: {
        title: "Spesifikasi Wewangian",
        icon: Droplets,
        theme: { bg: "bg-purple-50/50 border-purple-100", title: "text-purple-800 border-purple-100", label: "text-purple-700", input: "border-purple-200 focus:ring-purple-500/50" },
        fields: [
            { name: "topNotes", label: "Top Notes (Aroma Awal)", type: "text", placeholder: "Contoh: Bergamot, Mandarin", colSpan: 1 },
            { name: "baseNotes", label: "Base Notes (Aroma Akhir)", type: "text", placeholder: "Contoh: Vanilla, Musk, Cedarwood", colSpan: 1 },
            { name: "longevity", label: "Klaim Ketahanan Aroma", type: "select", options: ["4 - 6 Jam", "6 - 8 Jam", "Hingga 12 Jam", "Lebih dari 12 Jam"], colSpan: 2 }
        ]
    },
    12: {
        title: "Spesifikasi Perawatan Wajah",
        icon: FlaskConical,
        theme: { bg: "bg-blue-50/50 border-blue-100", title: "text-blue-800 border-blue-100", label: "text-blue-700", input: "border-blue-200 focus:ring-blue-500/50" },
        fields: [
            { name: "bpom", label: "Nomor BPOM", type: "text", placeholder: "NA182XXXXXXX", colSpan: 1 },
            { name: "skinType", label: "Direkomendasikan Untuk", type: "select", options: ["Semua Tipe Kulit", "Berminyak & Berjerawat", "Kering & Sensitif", "Kombinasi"], colSpan: 1 },
            { name: "ingredients", label: "Bahan Aktif Utama (Key Ingredients)", type: "text", placeholder: "Contoh: Niacinamide 5%, Salicylic Acid", colSpan: 2 }
        ]
    },
    13: {
        title: "Spesifikasi Perawatan Tubuh",
        icon: Sparkles,
        theme: { bg: "bg-emerald-50/50 border-emerald-100", title: "text-emerald-800 border-emerald-100", label: "text-emerald-700", input: "border-emerald-200 focus:ring-emerald-500/50" },
        fields: [
            { name: "bpom", label: "Nomor BPOM", type: "text", placeholder: "NA182XXXXXXX", colSpan: 1 },
            { name: "skinType", label: "Tipe Kulit", type: "select", options: ["Semua Tipe Kulit", "Kulit Kering", "Kulit Sensitif", "Aman untuk Eksim"], colSpan: 1 },
            { name: "ingredients", label: "Bahan Aktif Utama", type: "text", placeholder: "Contoh: Shea Butter, Ceramide, Vitamin E", colSpan: 1 },
            { name: "fragrance", label: "Aroma Tambahan", type: "text", placeholder: "Contoh: Vanilla, Floral, Non-Perfumed", colSpan: 1 }
        ]
    }
};
