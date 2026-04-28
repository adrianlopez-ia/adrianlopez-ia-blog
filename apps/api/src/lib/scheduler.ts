import { db } from '@blog/database';
import { reservations } from '@blog/database/schema';
import { and, eq, lte } from 'drizzle-orm';

let schedulerInterval: NodeJS.Timeout | null = null;

export function startScheduler() {
  if (schedulerInterval) {
    return;
  }

  // Run every minute
  schedulerInterval = setInterval(async () => {
    try {
      await processScheduledReservations();
    } catch (error) {
      console.error('[Scheduler] Error processing reservations:', error);
    }
  }, 60 * 1000); // 1 minute

  // Run immediately on start
  processScheduledReservations();
}

export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

async function processScheduledReservations() {
  const now = new Date();

  // Find reservations that are scheduled for now or past, and are still in 'scheduled' status
  const dueReservations = await db
    .select()
    .from(reservations)
    .where(and(eq(reservations.status, 'scheduled'), lte(reservations.scheduledFor, now)));

  if (dueReservations.length === 0) {
    return;
  }

  for (const reservation of dueReservations) {
    try {
      await launchReservation(reservation);
    } catch (error) {
      console.error(`[Scheduler] Failed to launch reservation ${reservation.id}:`, error);
      // Mark as failed
      await db
        .update(reservations)
        .set({
          status: 'failed',
          updatedAt: new Date(),
        })
        .where(eq(reservations.id, reservation.id));
    }
  }
}

async function launchReservation(reservation: { id: string; userId: string }) {
  // Update status to 'launched' before attempting the actual launch
  await db
    .update(reservations)
    .set({
      status: 'launched',
      launchedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(reservations.id, reservation.id));

  // TODO: Implement the actual bot launch logic here
  // This should call the same logic that the current "Launch Now" button uses
  // For now, we'll just mark it as completed since we don't have the actual bot launch API
  // In a real implementation, you would:
  // 1. Get the user's API URL and headers from their saved config
  // 2. Make the HTTP request to launch the bot
  // 3. Update the reservation status based on the result

  // For now, mark as completed (in real implementation, this would depend on the bot response)
  await db
    .update(reservations)
    .set({
      status: 'completed',
      updatedAt: new Date(),
    })
    .where(eq(reservations.id, reservation.id));
}
