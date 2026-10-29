# Week 5 Answers

## 1. Refreshing on /events/2
In development the Vite dev server answered the request. It has a built-in history API fallback, so any path that is not a real file returns `index.html`, and Vue Router then shows the detail page. In production the server (Nginx, Apache, Netlify, etc.) must do the same: rewrite every unknown path to `/index.html` (for example `try_files $uri /index.html;`). Without that rewrite, refreshing `/events/2` returns a 404 because no file with that name exists.

## 2. The /events/new guard
Yes, a student still can. The guard only runs in the browser, so a student can send `POST /events` directly with `curl`, Postman or the DevTools console. The server must stop this: it should authenticate the user and check their role on the API, and reject non-organisers with 401/403. The client guard is only a convenience for the UI, not security.

## 3. watch on id with immediate: true vs onMounted
`onMounted` runs only once, when the component is first created. Vue Router reuses the same component when only the param changes (for example `/events/2` to `/events/3`), so the page would keep showing event 2 while the URL says 3. A `watch` on `id` reloads whenever the id changes, and `immediate: true` also makes it load the first time.

## 4. storeToRefs vs `const { events } = store`
Destructuring a store copies the current value of a state property, so `events` becomes a plain variable that no longer updates when the store changes. `storeToRefs(store)` returns refs linked to the store's state and getters, so the destructured values stay reactive. Actions such as `fetchAll` can be destructured directly because they are just functions.

## 5. Two requests: POST booking, then PATCH seats
If the PATCH fails, the booking is already saved but the event's `booked` count is unchanged. The data becomes inconsistent: seats are still shown as available and the event can be overbooked. The server should do both changes in one atomic step, for example a single `POST /bookings` endpoint that creates the booking and updates the seat count inside one database transaction, so either both succeed or both are rolled back. The server should also compute the seat count itself and not trust the client.

