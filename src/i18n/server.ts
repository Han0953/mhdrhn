import "server-only";
import { messages as ui } from "./messages/en-ui";
import { messages as content } from "./messages/en-content";
import { makeTranslator } from "./translate";
import type { Locale } from "./config";
export type TranslationKey = keyof typeof ui | keyof typeof content;
const messages={...content,...ui};
export const serverTranslator=(locale:Locale)=>makeTranslator(locale,messages);
