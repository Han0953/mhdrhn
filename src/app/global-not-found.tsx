import {headers} from "next/headers";
import type {Metadata} from "next";
import RootLayout from "./[locale]/layout";
import NotFound from "./[locale]/not-found";
import {serverTranslator} from "@/i18n/server";
async function requestLocale(){return (await headers()).get('x-mhdrhn-locale')==='en'?'en' as const:'id' as const;}
export async function generateMetadata():Promise<Metadata>{const t=serverTranslator(await requestLocale());return {title:t('404 / Halaman tidak ditemukan'),robots:{index:false,follow:true}};}
export default async function GlobalNotFound(){const locale=await requestLocale();return <RootLayout params={Promise.resolve({locale})}><NotFound/></RootLayout>;}
