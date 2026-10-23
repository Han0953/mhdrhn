import {getPublishedProjects} from "@/lib/content";
import { NextRequest, NextResponse } from "next/server";
const projectSlugs=new Set(getPublishedProjects().map(project=>project.slug));
/** Only public documents are rewritten; explicit language URLs always win. */
export function proxy(request:NextRequest){
 const path=request.nextUrl.pathname;
 const headers=new Headers(request.headers);headers.set("x-mhdrhn-locale",/^\/en(?:\/|$)/.test(path)?"en":"id");
 const projectPath=path.replace(/^\/(?:en|id)(?=\/|$)/,"").match(/^\/projects\/(.+)$/);
 if(projectPath&&!projectSlugs.has(projectPath[1])){const missing=request.nextUrl.clone();missing.pathname=`/${headers.get("x-mhdrhn-locale")}/__missing-project`;return NextResponse.rewrite(missing,{request:{headers}});}
 if(/^\/(?:en|id)(?:\/|$)/.test(path))return NextResponse.next({request:{headers}});
 const url=request.nextUrl.clone();url.pathname=`/id${path==="/"?"":path}`;
 return NextResponse.rewrite(url,{request:{headers}});
}
export const config={matcher:["/((?!_next|api|.*\\..*).*)"]};
