/** Stable filter values shared by server pages and the small client control. */
export const categories = ["Semua", "Web", "IoT", "Electronics", "Embedded", "Research", "AI"] as const;
export type Category = (typeof categories)[number];
export const projectStatuses = ["Semua", "Online", "Dalam pengembangan", "Belum dipublikasikan"] as const;
// Public wording is separate from stable filter/query values.
export const projectStatusLabels: Record<typeof projectStatuses[number], string> = {
  Semua: "Semua status", Online: "Online", "Dalam pengembangan": "Dalam pengembangan", "Belum dipublikasikan": "Belum diinformasikan",
};
export type ProjectStatus = Exclude<(typeof projectStatuses)[number], "Semua" | "Belum dipublikasikan">;
