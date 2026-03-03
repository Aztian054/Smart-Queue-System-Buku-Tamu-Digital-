<?php

namespace App\Services;

use App\Models\Visitor;
use App\Models\Queue;
use App\Models\Service;
use App\Models\DailyCounter;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QueueService
{
    /**
     * Register a new visitor and generate queue number.
     */
    public function registerVisitor(array $data): Queue
    {
        return DB::transaction(function () use ($data) {
            // Create visitor
            $visitor = Visitor::create([
                'name' => $data['name'],
                'phone' => $data['phone'] ?? null,
                'agency' => $data['agency'] ?? null,
                'alamat' => $data['alamat'] ?? null,
                'purpose' => $data['purpose'],
                'notes' => $data['notes'] ?? null,
                'photo' => $data['photo'] ?? null,
                'identity_photo' => $data['identity_photo'] ?? null,
                'signature' => $data['signature'] ?? null,
                'location_lat' => $data['location_lat'] ?? null,
                'location_lng' => $data['location_lng'] ?? null,
                'visit_date' => today(),
            ]);

            // Get service
            $service = Service::findOrFail($data['service_id']);

            // Generate queue number
            $queueNumber = $this->generateQueueNumber($service->id);

            // Generate unique ticket code
            $ticketCode = $this->generateTicketCode($service->prefix);

            // Create queue
            $queue = Queue::create([
                'visitor_id' => $visitor->id,
                'service_id' => $service->id,
                'queue_number' => $queueNumber,
                'queue_date' => today(),
                'status' => 'waiting',
                'ticket_code' => $ticketCode,
            ]);

            return $queue->load(['visitor', 'service']);
        });
    }

    /**
     * Generate next queue number for a service.
     */
    public function generateQueueNumber(int $serviceId): int
    {
        $counter = DailyCounter::getTodayCounter($serviceId);
        return $counter->incrementNumber();
    }

    /**
     * Generate unique ticket code.
     */
    public function generateTicketCode(string $prefix): string
    {
        do {
            $code = $prefix . '-' . strtoupper(Str::random(6));
        } while (Queue::where('ticket_code', $code)->exists());

        return $code;
    }

    /**
     * Call a queue (update status to called).
     */
    public function callQueue(int $queueId, int $counterNumber): Queue
    {
        $queue = Queue::findOrFail($queueId);
        
        // Update any currently called queue to done (if any)
        // This is optional - you might want to handle this differently
        
        $queue->update([
            'status' => 'called',
            'counter_number' => $counterNumber,
            'called_at' => now(),
        ]);

        return $queue->load(['visitor', 'service']);
    }

    /**
     * Mark queue as done.
     */
    public function doneQueue(int $queueId): Queue
    {
        $queue = Queue::findOrFail($queueId);
        
        $queue->update([
            'status' => 'done',
            'finished_at' => now(),
        ]);

        return $queue->load(['visitor', 'service']);
    }

    /**
     * Skip a queue.
     */
    public function skipQueue(int $queueId): Queue
    {
        $queue = Queue::findOrFail($queueId);
        
        $queue->update([
            'status' => 'skipped',
        ]);

        return $queue->load(['visitor', 'service']);
    }

    /**
     * Recall a queue (set back to waiting).
     */
    public function recallQueue(int $queueId): Queue
    {
        $queue = Queue::findOrFail($queueId);
        
        $queue->update([
            'status' => 'waiting',
            'counter_number' => null,
            'called_at' => null,
        ]);

        return $queue->load(['visitor', 'service']);
    }

    /**
     * Get current called queue for display.
     */
    public function getCurrentCalled(): ?Queue
    {
        return Queue::with(['visitor', 'service', 'counter'])
            ->today()
            ->called()
            ->latest('called_at')
            ->first();
    }

    /**
     * Get waiting queues count.
     */
    public function getWaitingCount(?int $serviceId = null): int
    {
        $query = Queue::today()->waiting();
        
        if ($serviceId) {
            $query->where('service_id', $serviceId);
        }
        
        return $query->count();
    }

    /**
     * Get next waiting queues.
     */
    public function getNextWaiting(int $limit = 5): array
    {
        return Queue::with(['visitor', 'service'])
            ->today()
            ->waiting()
            ->orderBy('queue_number')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get today's statistics.
     */
    public function getTodayStats(): array
    {
        $total = Queue::today()->count();
        $waiting = Queue::today()->waiting()->count();
        $called = Queue::today()->called()->count();
        $done = Queue::today()->done()->count();
        $skipped = Queue::today()->where('status', 'skipped')->count();

        return [
            'total' => $total,
            'waiting' => $waiting,
            'called' => $called,
            'done' => $done,
            'skipped' => $skipped,
        ];
    }
}