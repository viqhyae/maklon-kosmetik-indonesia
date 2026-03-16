<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Halaman depan: arahkan ke login sebelum dashboard
Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

// Perubahan di sini: Rute dashboard sekarang memanggil fungsi 'index' di BrandController
Route::get('/dashboard', [BrandController::class, 'index'])
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

    // Rute API untuk Users & Roles
    Route::post('/users', [UserManagementController::class, 'store'])->name('users.store');
    Route::post('/users/update/{user}', [UserManagementController::class, 'update'])->name('users.update');
    Route::post('/users/{user}/status', [UserManagementController::class, 'updateStatus'])->name('users.status');
    Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');
    Route::post('/users/{user}/reset-password', [UserManagementController::class, 'resetPassword'])->name('users.reset-password');
});

require __DIR__ . '/auth.php';
