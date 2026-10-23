<script setup lang="ts">
import { computed, ref, watch } from "vue";
import EventList from "./components/EventList.vue";
import { initialEvents } from "./data/events";
import type { CampusEvent } from "./types";

// A reactive copy of the hard-coded events
const events = ref<CampusEvent[]>(initialEvents.map(e => ({ ...e })));

const STORAGE_KEY = "campus-events:my-bookings";

// Read saved bookings; the stored text might be missing or invalid JSON
function loadBookings(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is number => typeof x === "number")
      : [];
  } catch {
    return [];
  }
}

// The ids of the events I booked (one entry per seat)
const myBookings = ref<number[]>([]);

// Restore saved seats into each event's `booked` (respecting capacity)
for (const id of loadBookings()) {
  const event = events.value.find(e => e.id === id);
  if (event && event.booked < event.capacity) {
    event.booked++;
    myBookings.value.push(id);
  }
}

const bookingCount = computed(() => myBookings.value.length);

function onBook(id: number) {
  const event = events.value.find(e => e.id === id);
  if (!event || event.booked >= event.capacity) return;
  event.booked++;
  myBookings.value.push(id);
}

// Save my bookings whenever they change
watch(
  myBookings,
  value => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)),
  { deep: true }
);
</script>

<template>
  <main>
    <header>
      <h1>Campus Events</h1>
      <p class="mine">
        You have booked {{ bookingCount }} {{ bookingCount === 1 ? "seat" : "seats" }}.
      </p>
    </header>
    <EventList :events="events" @book="onBook" />
  </main>
</template>

<style scoped>
header { margin-bottom: 16px; }
.mine { color: #6b7280; margin: 0; }
</style>
