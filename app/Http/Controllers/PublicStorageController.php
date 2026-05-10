<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class PublicStorageController extends Controller
{
    public function show(string $path): Response
    {
        $normalizedPath = trim(str_replace('\\', '/', $path), '/');
        $filename = basename($normalizedPath);

        abort_if(
            $normalizedPath === ''
            || str_contains($normalizedPath, '..')
            || str_starts_with($filename, '.')
            || (! str_starts_with($normalizedPath, 'logos/') && ! str_starts_with($normalizedPath, 'products/')),
            404
        );

        $disk = Storage::disk('public');
        abort_unless($disk->exists($normalizedPath), 404);

        $mimeType = $disk->mimeType($normalizedPath) ?: 'application/octet-stream';
        abort_unless(str_starts_with($mimeType, 'image/'), 404);

        return response()->file($disk->path($normalizedPath), [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=604800, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
