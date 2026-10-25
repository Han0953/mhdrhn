"use client";

import {useSyncExternalStore} from 'react';

const subscribe=()=>()=>{};
const clientSnapshot=()=>true;
const serverSnapshot=()=>false;

/** Execute only while the initial HTML is parsed; locale mounts emit inert markup. */
export function StartupBootstrap({source}:{source:string}){
  const client=useSyncExternalStore(subscribe,clientSnapshot,serverSnapshot);
  return client
    ? <template id="mhdrhn-motion-startup" data-startup-bootstrap="inactive"/>
    : <script id="mhdrhn-motion-startup" dangerouslySetInnerHTML={{__html:source}}/>;
}
