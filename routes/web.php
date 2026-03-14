<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Halaman depan (Welcome)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
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
    Route::delete('/brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy');

    // Rute API untuk Kategori Produk (3 level)
    Route::post('/product-categories', [CategoryController::class, 'store'])->name('product-categories.store');
    Route::delete('/product-categories/{productCategory}', [CategoryController::class, 'destroy'])->name('product-categories.destroy');
});

require __DIR__ . '/auth.php';
