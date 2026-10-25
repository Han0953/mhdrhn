import {profile} from './content';

/** Only owner-provided destinations become external links. */
export const contactChannels:ReadonlyArray<{
  id:string;label:string;detail:string;href:string|null;
}>=[
  {id:'whatsapp',label:'WhatsApp',detail:'Percakapan langsung',href:null},
  {id:'instagram',label:'Instagram',detail:'@xhzystray',href:'https://www.instagram.com/xhzystray/'},
  {id:'linkedin',label:'LinkedIn',detail:'Jejaring profesional',href:null},
  {id:'github',label:'GitHub',detail:'Han0953',href:profile.github},
];
