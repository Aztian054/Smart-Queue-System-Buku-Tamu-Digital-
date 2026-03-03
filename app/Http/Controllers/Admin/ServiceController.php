<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Counter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ServiceController extends Controller
{
    /**
     * Get all services.
     */
    public function index(): JsonResponse
    {
        $services = Service::withCount('queues')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }

    /**
     * Store a new service.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'prefix' => 'required|string|max:5|unique:services,prefix',
            'description' => 'nullable|string',
            'active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $service = Service::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Layanan berhasil dibuat',
            'data' => $service,
        ], 201);
    }

    /**
     * Update a service.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'prefix' => 'sometimes|required|string|max:5|unique:services,prefix,' . $id,
            'description' => 'nullable|string',
            'active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $service->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Layanan berhasil diperbarui',
            'data' => $service->fresh(),
        ]);
    }

    /**
     * Delete a service.
     */
    public function destroy(int $id): JsonResponse
    {
        $service = Service::findOrFail($id);

        // Check if service has queues
        if ($service->queues()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Layanan tidak dapat dihapus karena memiliki data antrian',
            ], 400);
        }

        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Layanan berhasil dihapus',
        ]);
    }

    /**
     * Get counters for a service.
     */
    public function counters(int $serviceId): JsonResponse
    {
        $counters = Counter::where('service_id', $serviceId)
            ->orderBy('number')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $counters,
        ]);
    }

    /**
     * Store a new counter.
     */
    public function storeCounter(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'number' => 'required|integer|min:1',
            'service_id' => 'nullable|exists:services,id',
            'active' => 'boolean',
        ]);

        $counter = Counter::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Loket berhasil dibuat',
            'data' => $counter,
        ], 201);
    }

    /**
     * Update a counter.
     */
    public function updateCounter(Request $request, int $id): JsonResponse
    {
        $counter = Counter::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'number' => 'sometimes|required|integer|min:1',
            'service_id' => 'nullable|exists:services,id',
            'active' => 'boolean',
        ]);

        $counter->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Loket berhasil diperbarui',
            'data' => $counter->fresh(),
        ]);
    }

    /**
     * Delete a counter.
     */
    public function destroyCounter(int $id): JsonResponse
    {
        $counter = Counter::findOrFail($id);
        $counter->delete();

        return response()->json([
            'success' => true,
            'message' => 'Loket berhasil dihapus',
        ]);
    }

    /**
     * Get all counters.
     */
    public function allCounters(): JsonResponse
    {
        $counters = Counter::with('service')
            ->orderBy('number')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $counters,
        ]);
    }
}