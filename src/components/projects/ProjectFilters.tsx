"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { projectStatuses, projectStatusLabels, type Category } from "@/lib/content";
import { projectFilterHref } from "@/lib/project-filters";

type ProjectStatus = typeof projectStatuses[number];

/** Only the controls hydrate; the filtered catalog remains server rendered. */
export function ProjectFilters({ category, query, status }: { category: Category; query: string; status: ProjectStatus }) {
  const router = useRouter();
  const search = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const apply = (nextStatus: ProjectStatus) => {
    const href = projectFilterHref(category, search.current?.value ?? query, nextStatus);
    startTransition(() => router.replace(href, { scroll: false }));
  };

  return <form action="/projects" className="search-form" data-pending={pending ? "" : undefined} aria-busy={pending} onSubmit={event => { event.preventDefault(); apply(status); }}>
    {category !== "Semua" && <input type="hidden" name="category" value={category}/>}
    <div className="search-field"><label htmlFor="project-search">Cari proyek</label><input ref={search} id="project-search" name="q" placeholder="Nama proyek atau teknologi…" defaultValue={query} key={query} maxLength={100} type="search" aria-describedby="project-filter-help" onKeyDown={event => { if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); apply(status); } }} onChange={event => { if (!event.currentTarget.value) apply(status); }}/></div>
    <div className="status-field">
      <label id="project-status-label">Status proyek</label>
      <Select.Root value={status} name="status" modal={false} onValueChange={value => { if (value) apply(value); }}>
        <Select.Trigger className="status-trigger" aria-labelledby="project-status-label project-status-value"><Select.Value id="project-status-value">{projectStatusLabels[status]}</Select.Value><Select.Icon><ChevronDown size={16} aria-hidden="true"/></Select.Icon></Select.Trigger>
        <Select.Portal><Select.Positioner className="status-positioner" align="start" sideOffset={6} alignItemWithTrigger={false}><Select.Popup className="status-popup"><Select.List>{projectStatuses.map(item => <Select.Item className="status-option" key={item} value={item}><Select.ItemText>{projectStatusLabels[item]}</Select.ItemText><Select.ItemIndicator><Check size={16} aria-hidden="true"/></Select.ItemIndicator></Select.Item>)}</Select.List></Select.Popup></Select.Positioner></Select.Portal>
      </Select.Root>
    </div>
    <p id="project-filter-help" className="filter-help" role="status">{pending ? "Memperbarui hasil…" : "Tekan Enter untuk mencari. Status langsung memfilter hasil."}</p>
  </form>;
}
