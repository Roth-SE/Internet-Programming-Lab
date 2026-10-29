import { computed, ref, type Ref } from "vue";
import type { CampusEvent, Category } from "../types";

// TODO E1 (refactor): move the filtering logic from week 4's EventList.vue here,
// so any page can reuse it. Return { search, category, visible }.
// The test "filters the list with the search box" in EventsPage.test.ts checks it.
export function useEventFilters(events: Ref<CampusEvent[]>) {
  // the text typed in the search box
  const search = ref("");
  const category = ref<Category | "all">("all");

  // events of the selected category whose title or location contains the search text (ignoring case)
  const visible = computed(() => {
    const query = search.value.trim().toLowerCase();
    return events.value.filter((event) => {
      const matchesCategory = category.value === "all" || event.category === category.value;
      const matchesSearch =
        query === "" ||
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  });

  return { search, category, visible };
}
