/* Painted vector miniatures: porcelain, baked apple crumb, berry layers and brass. */
export function confectionBody(id='pastila') {
 return `<defs>
 <linearGradient id="${id}-crumb" x2="0" y2="1"><stop stop-color="#e4b66c"/><stop offset="1" stop-color="#b47836"/></linearGradient>
 <linearGradient id="${id}-apple" x2=".8" y2="1"><stop stop-color="#b7c978"/><stop offset=".5" stop-color="#809b48"/><stop offset="1" stop-color="#456b35"/></linearGradient>
 <linearGradient id="${id}-plate" x2="0" y2="1"><stop stop-color="#fffef7"/><stop offset="1" stop-color="#d7e2d3"/></linearGradient>
 </defs>
 <g class="paint-plate" stroke="#9c895d" stroke-width="1">
 <ellipse cx="153" cy="213" rx="114" ry="10" fill="#59432b" opacity=".09" stroke="none"/>
 <path d="M27 187Q35 217 151 219Q269 215 277 187Z" fill="#b4c5b2"/>
 <ellipse cx="152" cy="186" rx="127" ry="29" fill="url(#${id}-plate)"/>
 <ellipse cx="152" cy="183" rx="115" ry="23" fill="#fffdf4" stroke="#b4975f"/>
 <path d="M44 192q18 15 45 13m124 0q27-2 45-13" fill="none" stroke="#65885b"/>
 <path d="M58 199q-8-15-16-10q3 11 16 10m10 3q5-14 13-10q-1 10-13 10m176-3q8-15 16-10q-3 11-16 10m-10 3q-5-14-13-10q1 10 13 10" fill="#819968" stroke="none"/>
 </g>
 <g class="paint-fruit" stroke-linejoin="round">
 <path d="M64 145C17 136 24 77 50 80Q61 72 71 81C104 73 104 139 79 147Q70 151 64 145Z" fill="url(#${id}-apple)" stroke="#577841" stroke-width="1"/>
 <path d="M64 82q-1-19 8-25" fill="none" stroke="#715033" stroke-width="3" stroke-linecap="round"/>
 <path d="M68 68Q46 72 39 55Q59 48 68 68Z" fill="#537645" stroke="#3f6638"/>
 <path d="M42 95Q35 111 42 122" fill="none" stroke="#e8edbd" stroke-width="5" opacity=".6" stroke-linecap="round"/>
 </g>
 <g class="paint-back" stroke="#a77b49" stroke-width=".8" stroke-linejoin="round">
 <path d="m93 78 83-23 43 25-83 28Z" fill="#edca89"/>
 <path d="m136 108 83-28v73l-83 29Z" fill="url(#${id}-crumb)"/>
 <path d="m93 78 43 30v74l-43-31Z" fill="#bd8743"/>
 <path d="m94 99 42 29 82-27v7l-82 28-42-30Z" fill="#fff5dc" stroke="none"/>
 <path d="m94 123 42 28 82-28v7l-82 28-42-28Z" fill="#fff5dc" stroke="none"/>
 <path d="m100 79 73-20 36 21-73 24Z" fill="#f5ddb0" stroke="none" opacity=".7"/>
 </g>
 <g class="paint-cake" stroke-linejoin="round" stroke-width=".8">
 <path d="m67 132 116-31 55 30-117 35Z" fill="#eac386" stroke="#b28755"/>
 <path d="m121 166 117-35v58l-117 33Z" fill="url(#${id}-crumb)" stroke="#ab7c46"/>
 <path d="m67 132 54 34v56l-54-34Z" fill="#c68f4b" stroke="#a67640"/>
 <path d="m68 149 53 33 116-34v5l-116 35-53-34Z" fill="#fff5df" stroke="#f9e8c6"/>
 <path d="m68 155 53 33 116-35v15l-116 34-53-33Z" fill="#854138" stroke="none"/>
 <path d="m68 170 53 33 116-35v5l-116 35-53-33Z" fill="#fff4df" stroke="none"/>
 <path d="m74 131 109-26 45 25-108 31Z" fill="#f3d9a7" stroke="none"/>
 <g fill="#9e6b36" opacity=".55" stroke="none"><ellipse cx="102" cy="136" rx="3" ry="1.3"/><ellipse cx="124" cy="127" rx="2" ry="1.2"/><ellipse cx="146" cy="143" rx="3" ry="1.2"/><ellipse cx="171" cy="122" rx="2.5" ry="1.2"/><ellipse cx="201" cy="129" rx="2.5" ry="1"/><ellipse cx="165" cy="136" rx="1.8" ry="1"/><ellipse cx="134" cy="171" rx="2" ry="1"/><ellipse cx="169" cy="165" rx="2.5" ry="1.3"/><ellipse cx="217" cy="147" rx="2" ry="1"/><ellipse cx="140" cy="212" rx="2" ry="1"/><ellipse cx="189" cy="195" rx="2.5" ry="1"/><ellipse cx="223" cy="184" rx="2" ry="1"/></g>
 <path d="m77 143 5 3m5 14 4 2m10 28 5 3m54-3 5-1m30-10 4-1m26-7 4-1" fill="none" stroke="#f7e8c7" stroke-width="1.4"/>
 </g>
 <g class="paint-berries" stroke="#823d3f" stroke-width=".7"><path d="M242 187q0-28 23-31q-3 23-23 31" fill="#759659" stroke="#547b40"/><path d="m244 184 15-21" fill="none" stroke="#d0dda6"/>
 <circle cx="253" cy="197" r="10" fill="#9f4247"/><circle cx="236" cy="199" r="9" fill="#b95458"/><circle cx="245" cy="184" r="9" fill="#8c3541"/>
 <path d="m241 180 3-2m-13 17 3-2m15 0 3-2" stroke="#edb5ad" stroke-width="2.3" stroke-linecap="round"/></g>`;
}

const frame=`<path d="M90 12C66 12 59 29 34 31C32 46 20 54 19 78C17 104 27 131 38 139C64 139 65 157 90 158C115 157 116 139 142 139C153 131 163 104 161 78C160 54 148 46 146 31C121 29 114 12 90 12Z" fill="#fcf8ed" stroke="#d8c295" stroke-width=".8"/>
<g class="tool-engraved-frame" stroke="#ab8248" stroke-width="1.1"><path d="M35 36C55 37 65 20 90 20C115 20 125 37 145 36M35 140C55 140 65 152 90 152C115 152 125 140 145 140M26 53C10 51 13 35 22 38C28 40 25 47 21 44M154 53C170 51 167 35 158 38C152 40 155 47 159 44M26 121C10 123 13 139 22 136C28 134 25 127 21 130M154 121C170 123 167 139 158 136C152 134 155 127 159 130" fill="none"/>
<path d="M27 65Q9 73 23 91Q22 75 27 65ZM153 65Q171 73 157 91Q158 75 153 65ZM47 31Q39 13 59 20Q52 23 47 31ZM133 31Q141 13 121 20Q128 23 133 31Z" fill="#9dac72" stroke="#78935d"/><path d="M90 9q-12-10 0-15q12 5 0 15" transform="translate(0 9)" fill="#c6a269"/></g>`;

export const paintedIcons={
 layers:`${frame}<g class="painted-miniature" transform="translate(10 27) scale(.53)">${confectionBody('feature-cake')}</g>`,
 compare:`${frame}<g stroke="#927143" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2">
 <ellipse cx="90" cy="139" rx="37" ry="4" fill="#e6dac1" stroke="none"/>
 <path d="M75 134h30l5 5H70ZM85 128h10V52H85Z" fill="#c1a069"/><path d="M88 57v68" stroke="#f7e6b4"/>
 <path d="M52 61Q90 43 128 61L127 66Q90 51 53 66Z" fill="#b79154"/>
 <path d="M90 47c-12-8-6-16 0-19c6 3 12 11 0 19Z" fill="#d9ba7c"/>
 <path d="m53 64-14 40m14-40 14 40m60-40-14 40m14-40 14 40" fill="none"/>
 <g class="tool-compare-left"><path d="M36 104h34q-17 23-34 0Z" fill="#cea96b"/><path d="m41 105 24 0" stroke="#f7e5b0"/><path d="M44 82l17-4 4 19-17 4Z" fill="#d4aa65"/><path d="m45 89 17-4v4l-16 4Z" fill="#fff6df" stroke="none"/><path d="m45 85 3 0m5-2 3 0" stroke="#9a6b38"/>
 <path d="M52 77C39 67 39 87 45 88M52 77C65 69 65 86 60 88" fill="#829c4c" stroke="#587b3b"/><path d="M52 77q0-8 4-10" fill="none" stroke="#725939"/></g>
 <g class="tool-compare-right"><path d="M110 104h34q-17 23-34 0Z" fill="#cea96b"/><path d="M115 105h24" stroke="#f7e5b0"/><path d="m117 81 16-3 5 19-18 4Z" fill="#c69857"/><path d="m118 88 17-3 1 5-17 4Z" fill="#8c3c46" stroke="none"/><path d="m119 93 17-4v3l-16 4Z" fill="#fff2d7" stroke="none"/><circle cx="123" cy="77" r="5" fill="#a34650" stroke="#823a47"/><circle cx="131" cy="75" r="5" fill="#8f3545" stroke="#823a47"/><path d="m123 75 2-1m6-1 1-1" stroke="#e6a5a0"/></g></g>`,
 map:`${frame}<g class="tool-map" stroke="#80523e" stroke-width="1" stroke-linejoin="round">
 <ellipse cx="90" cy="140" rx="49" ry="4" fill="#e8dbc1" stroke="none"/>
 <path d="M47 77h86v58H47Z" fill="#f1d8ac"/><path d="M127 81h6v54h-6Z" fill="#d8b884" stroke="none"/>
 <path d="M45 135h91v5H45Z" fill="#c9b496"/>
 <path d="M43 78l8-21h78l8 21Z" fill="#f9efdb"/>
 <path d="m51 57 14 0-5 21H43Zm28 0h14v21H75Zm28 0h14l9 21h-16Z" fill="#8c3744" stroke="none"/>
 <path d="M43 78q8 12 16 0q8 12 16 0q8 12 16 0q8 12 16 0q8 12 16 0q8 12 14 0" fill="#f8ead2"/>
 <path d="M57 135V99q9-11 18 0v36Z" fill="#456d4b" stroke="#31553a"/><path d="M61 100q5-5 10 0v17H61Z" fill="#b6d2c2" stroke="#729581"/><circle cx="70" cy="124" r="1.6" fill="#e7c589" stroke="none"/>
 <path d="M89 98h33v26H89Z" fill="#a7c5b6" stroke="#45664f"/><path d="M91 100h28v9H91Z" fill="#d6e7d9" stroke="none"/><path d="M105 98v26m-16-13h33" fill="none" stroke="#fff0cf" stroke-width="2"/>
 <path d="M53 89h72" stroke="#bc985f"/><path d="M91 122h31v4H91Z" fill="#668453"/><path d="M92 118q4-6 8 0m9 0q4-6 8 0" fill="#a94754" stroke="#a94754" stroke-width="3"/>
 </g><g class="tool-pin" stroke="#703040" stroke-width="1"><path d="M101 36c0 10-11 20-11 20S79 46 79 36a11 11 0 1 1 22 0Z" fill="#934651"/><circle cx="90" cy="35" r="4" fill="#ffefd4" stroke="none"/></g>`
};
