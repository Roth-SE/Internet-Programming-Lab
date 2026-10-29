import { createRouter, createWebHistory, type RouterHistory } from "vue-router";
import { useSessionStore } from "../stores/session";
// import EventsPage from "../pages/EventsPage.vue";
// import NewEventPage from "../pages/NewEventPage.vue";
// import EventDetailPage from "../pages/EventDetailPage.vue";
// import MyBookingsPage from "../pages/MyBookingsPage.vue";
// import NotFoundPage from "../pages/NotFoundPage.vue";

declare module "vue-router" {
  interface RouteMeta {
    organiserOnly?: boolean;
  }
}

export const routes = [
  { path: "/", name: "events", component: ()=> import("../pages/EventsPage.vue") },
  { path: "/events/new", name: "event-new", component: ()=> import("../pages/NewEventPage.vue"), meta: { organiserOnly: true } },
  { path: "/events/:id(\\d+)", name: "event-detail", component: () => import("../pages/EventDetailPage.vue"), props:true },
  { path: "/my-bookings", name: "my-bookings", component: () => import("../pages/MyBookingsPage.vue") },
  { path: "/:pathMatch(.*)*", name: "not-found", component: ()=> import("../pages/NotFoundPage.vue")},
  //Answer: without (\\d+), /events/:id would match /events/new if it came first, so new would be treated as an id.
  // The static /events/new route has to come before it. With (\\d+), the order no longer matters.
  
  // TODO A1: add these routes. Lazy-load each page: component: () => import("../pages/....vue")
  //   /events/new    name "event-new"     NewEventPage      meta: { organiserOnly: true }
  //   /events/:id    name "event-detail"  EventDetailPage   props: true, and only digits: ":id(\\d+)"
  //   /my-bookings   name "my-bookings"   MyBookingsPage
  //   anything else  name "not-found"     NotFoundPage      path: "/:pathMatch(.*)*"
  // Question: why must "/events/new" come before "/events/:id" if :id had no (\\d+)?
];

export function makeRouter(history: RouterHistory = createWebHistory()) {
  const router = createRouter({ history, routes });

 router.beforeEach((to) => {
    // only touch the store for guarded routes (Pinia may not be installed yet otherwise)
    if (to.meta.organiserOnly && !useSessionStore().isOrganiser) {
      return { name: "events", query: { denied: "1" } };
    }
  });
  // TODO A2: a global guard (router.beforeEach).
  // If the route has meta.organiserOnly and the session is not an organiser,
  // redirect to { name: "events", query: { denied: "1" } }.
   // remove this line when you use the store

  return router;
}
