"use client";
import {useEffect,useLayoutEffect} from "react";
import {usePathname} from "next/navigation";
import {useLocale} from "./LocaleProvider";
import {completeLanguageChange,cancelLanguageChange} from "./language-motion";
export function LanguageTransition(){const path=usePathname(),locale=useLocale();useLayoutEffect(()=>{void completeLanguageChange(path);},[path,locale]);useEffect(()=>{try{localStorage.setItem('mhdrhn.locale',locale);}catch{/* Explicit URL remains authoritative. */}},[locale]);useEffect(()=>{const cancel=()=>cancelLanguageChange();window.addEventListener('popstate',cancel);return()=>window.removeEventListener('popstate',cancel);},[]);return null;}
