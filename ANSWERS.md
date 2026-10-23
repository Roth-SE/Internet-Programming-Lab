# Week 4 – Answers

## 1. Using the array index as :key

Vue uses the key to know which card is which. If I use the index, the key only says "the card in position 0, 1, 2...", not "the Git Workshop card".

So when I filter the list, the events move to different positions, but the keys stay 0, 1, 2. Vue thinks the cards are the same and reuses them, and it only changes the props. The local state stays with the old card. For example, if the details panel was open on card number 1 and I filter, the panel stays open on whatever event is now in position 1, even if it's a different event. The state ends up on the wrong event.

With :key="event.id" each card stays linked to its own event, so this doesn't happen.

## 2. Why visible is a computed and not a function

A computed remembers (caches) its result. It only runs again when something it uses changes (search, category or props.events).

A function called in the template, like visible(), runs again every time the component re-renders, even when re-rendering has nothing to do with the filters. If I use it in more than one place, like the list and the "X of Y events" text, it runs again for each one.

When I type in the search box, search changes, so the computed runs one time and gives a new list, and the list and the count both use that result. With a function, the filtering would run again for each place that uses it, and also on any other re-render. It works the same but does extra work for no reason. A computed is also easier to read, because visible looks like a normal value.

## 3. Why EventCard emits book instead of changing event.booked

1. **Props are read-only / one-way data flow.** The event comes from the parent as a prop. A child should not change its props. Vue warns about it, and the data would change without the owner knowing.
2. **App.vue owns the data and has more to do.** Booking is not only booked++. App also has to check there is a seat left, add the id to myBookings, update the header count and save to localStorage. The card doesn't know about any of that. It just says "someone clicked book on id 7" and the parent decides what to do. This also makes the card reusable and easy to test (the test just checks that it emits `[7]`).

## 4. const { booked } = reactive(event); booked++ doesn't update the page

Destructuring takes the value out of the reactive object. booked is just a normal number copied into a new variable, not connected to the object anymore. So booked++ only changes my local copy. The real event.booked stays the same and Vue doesn't see any change, so the page doesn't update. (Also, booked is a const, so booked++ gives an error anyway.)

Vue tracks changes through the object (the proxy), so I have to write event.booked++ directly, or use toRefs if I really want to destructure.

## 5. Where myBookings lives

It lives in **App.vue**, in the same place as events.

- It needs to be shown in the header, and the header is in App. Data should live in the closest common parent of everything that uses it.
- It changes at the same time as events (in onBook), and App is the one that owns and changes the events.
- **Not in EventCard:** there is one card per event, so each card would only know its own bookings. Nobody could add them up for the header. Also, a card gets destroyed when it's filtered out (v-for / v-if), and its state would be lost.
- **Not in EventList:** the list is only for showing and filtering. The header is outside it, so the count would have to be passed back up anyway. Saving to localStorage is also not the list's job.
