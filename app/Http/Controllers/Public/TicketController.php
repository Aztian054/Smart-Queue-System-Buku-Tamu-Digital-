<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Queue;
use Illuminate\Http\JsonResponse;

class TicketController extends Controller
{
    /**
     * Get ticket details by ID.
     */
    public function show(int $id): JsonResponse
    {
        $queue = Queue::with(['visitor', 'service'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'queue_id' => $queue->id,
                'queue_number' => $queue->formatted_number,
                'ticket_code' => $queue->ticket_code,
                'status' => $queue->status,
                'counter_number' => $queue->counter_number,
                'service' => [
                    'id' => $queue->service->id,
                    'name' => $queue->service->name,
                    'prefix' => $queue->service->prefix,
                ],
                'visitor' => [
                    'name' => $queue->visitor->name,
                    'agency' => $queue->visitor->agency,
                    'alamat' => $queue->visitor->alamat,
                    'phone' => $queue->visitor->phone,
                    'purpose' => $queue->visitor->purpose,
                    'location_lat' => $queue->visitor->location_lat,
                    'location_lng' => $queue->visitor->location_lng,
                ],
                'queue_date' => $queue->queue_date->format('Y-m-d'),
                'created_at' => $queue->created_at->format('H:i'),
            ],
        ]);
    }

    /**
     * Get ticket details by ticket code.
     */
    public function getByCode(string $code): JsonResponse
    {
        $queue = Queue::with(['visitor', 'service'])
            ->where('ticket_code', $code)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'queue_id' => $queue->id,
                'queue_number' => $queue->formatted_number,
                'ticket_code' => $queue->ticket_code,
                'status' => $queue->status,
                'counter_number' => $queue->counter_number,
                'service' => [
                    'id' => $queue->service->id,
                    'name' => $queue->service->name,
                    'prefix' => $queue->service->prefix,
                ],
                'visitor' => [
                    'name' => $queue->visitor->name,
                    'agency' => $queue->visitor->agency,
                    'alamat' => $queue->visitor->alamat,
                    'phone' => $queue->visitor->phone,
                    'purpose' => $queue->visitor->purpose,
                    'location_lat' => $queue->visitor->location_lat,
                    'location_lng' => $queue->visitor->location_lng,
                ],
                'queue_date' => $queue->queue_date->format('Y-m-d'),
                'created_at' => $queue->created_at->format('H:i'),
            ],
        ]);
    }
}