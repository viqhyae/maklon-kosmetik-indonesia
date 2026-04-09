<?php

use App\Http\Controllers\AccountSettingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\LegacyFrontController;
use App\Http\Controllers\ProductVerificationController;
use App\Http\Controllers\ProductSkuController;
use App\Http\Controllers\ScanActivityController;
use App\Http\Controllers\SecuritySettingController;
use App\Http\Controllers\TagBatchController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

// Halaman depan website publik (frontend lama)
Route::get('/', [LegacyFrontController::class, 'index'])->name('home');
Route::post('/kode', [LegacyFrontController::class, 'kode'])->name('kode');

// Endpoint publik untuk cek keaslian kode produk
Route::get('/verify-product-code', [ProductVerificationController::class, 'check'])
    ->name('public.verify-code');

// Perubahan di sini: Rute dashboard sekarang memanggil fungsi 'index' di BrandController
Route::get('/adminmki', [BrandController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    // Rute Profil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Rute API untuk menyimpan Brand baru
    Route::post('/brands', [BrandController::class, 'store'])->name('brands.store');
    Route::post('/brands/update/{brand}', [BrandController::class, 'update'])->name('brands.update'); // Pakai POST untuk update gambar
    Route::post('/brands/{brand}/status', [BrandController::class, 'updateStatus'])->name('brands.status');
    Route::delete('/brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy');

    // Rute API untuk Kategori Produk (3 level)
    Route::post('/product-categories', [CategoryController::class, 'store'])->name('product-categories.store');
    Route::delete('/product-categories/{productCategory}', [CategoryController::class, 'destroy'])->name('product-categories.destroy');

    // Rute API untuk SKU Produk
    Route::post('/products', [ProductSkuController::class, 'store'])->name('products.store');
    Route::post('/products/update/{productSku}', [ProductSkuController::class, 'update'])->name('products.update');
    Route::delete('/products/{productSku}', [ProductSkuController::class, 'destroy'])->name('products.destroy');

    // Rute API untuk Users & Roles
    Route::post('/users', [UserManagementController::class, 'store'])->name('users.store');
    Route::post('/users/update/{user}', [UserManagementController::class, 'update'])->name('users.update');
    Route::post('/users/{user}/status', [UserManagementController::class, 'updateStatus'])->name('users.status');
    Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');
    Route::post('/users/{user}/reset-password', [UserManagementController::class, 'resetPassword'])->name('users.reset-password');

    // Rute API untuk Generate Tag / QR
    Route::post('/tag-batches', [TagBatchController::class, 'store'])->name('tag-batches.store');
    Route::post('/tag-batches/{tagBatch}/status', [TagBatchController::class, 'updateStatus'])->name('tag-batches.status');
    Route::delete('/tag-batches/{tagBatch}', [TagBatchController::class, 'destroy'])->name('tag-batches.destroy');
    Route::get('/tag-batches/{tagBatch}/codes', [TagBatchController::class, 'codes'])->name('tag-batches.codes');

    // Rute API untuk aktivitas scan
    Route::get('/scan-activities', [ScanActivityController::class, 'index'])->name('scan-activities.index');

    // Rute API untuk pengaturan keamanan
    Route::post('/settings/security', [SecuritySettingController::class, 'update'])->name('settings.security.update');

    // Rute API untuk pengaturan akun pribadi
    Route::post('/settings/account/email', [AccountSettingController::class, 'updateEmail'])->name('settings.account.email');
    Route::post('/settings/account/password', [AccountSettingController::class, 'updatePassword'])->name('settings.account.password');
});

require __DIR__ . '/auth.php';
