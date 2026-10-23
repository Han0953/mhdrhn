"use client";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { makeTranslator, type Messages } from "./translate";
import type { Locale } from "./config";
const Context=createContext<{locale:Locale;messages:Messages}>({locale:"id",messages:{}});
export function LocaleProvider({locale,messages,children}:{locale:Locale;messages:Messages;children:ReactNode}){
 return <Context value={{locale,messages}}>{children}</Context>;
}
export function useLocale(){return useContext(Context).locale;}
export function useTranslation(){const {locale,messages}=useContext(Context);return useMemo(()=>({locale,t:makeTranslator(locale,messages)}),[locale,messages]);}
