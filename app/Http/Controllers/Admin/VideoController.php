<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

/**
 * Video management controller for display.
 * 
 * @method \Illuminate\Filesystem\FilesystemAdapter disk(string $name = null)
 * @see \Illuminate\Support\Facades\Storage
 */
class VideoController extends Controller
{
    /**
     * Get current video.
     */
    public function show(): JsonResponse
    {
        $videoPath = Setting::get('display_video_path');
        $videoName = Setting::get('display_video_name');

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        if ($videoPath && $disk->exists($videoPath)) {
            return response()->json([
                'success' => true,
                'data' => [
                    'url' => $disk->url($videoPath),
                    'name' => $videoName,
                    'exists' => true,
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'url' => null,
                'name' => null,
                'exists' => false,
            ],
        ]);
    }

    /**
     * Upload a new video.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'video' => 'required|file|max:512000', // Max 500MB
        ]);

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        // Delete old video if exists
        $oldVideoPath = Setting::get('display_video_path');
        if ($oldVideoPath && $disk->exists($oldVideoPath)) {
            $disk->delete($oldVideoPath);
        }

        // Store new video
        $file = $request->file('video');
        $fileName = $file->getClientOriginalName();
        $path = $file->storeAs('videos', uniqid() . '_' . $fileName, 'public');

        // Save to settings
        Setting::set('display_video_path', $path);
        Setting::set('display_video_name', $fileName);

        return response()->json([
            'success' => true,
            'message' => 'Video berhasil diupload',
            'data' => [
                'url' => $disk->url($path),
                'name' => $fileName,
                'exists' => true,
            ],
        ]);
    }

    /**
     * Delete current video.
     */
    public function destroy(): JsonResponse
    {
        $videoPath = Setting::get('display_video_path');

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        if ($videoPath && $disk->exists($videoPath)) {
            $disk->delete($videoPath);
        }

        Setting::remove('display_video_path');
        Setting::remove('display_video_name');

        return response()->json([
            'success' => true,
            'message' => 'Video berhasil dihapus',
        ]);
    }
}
