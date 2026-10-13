/* Original ornamental geometry: engraving scrolls, guilloche and architectural rules. No botanical silhouettes. */
const path=d=>`<path d="${d}"/>`;
const mirror=(body,width=240)=>body+`<g transform="translate(${width} 0) scale(-1 1)">${body}</g>`;
const bead=(x,y,r=1.5)=>`<circle cx="${x}" cy="${y}" r="${r}"/>`;
const scroll=path('M120 189C54 191 21 153 34 124C45 100 76 103 76 125C76 142 50 145 50 129C50 121 62 120 63 127M120 181C63 183 29 154 42 128M120 175C160 154 176 124 163 100C151 80 125 86 128 104C131 119 149 113 147 104M120 165C148 149 163 126 156 107M66 168C18 155 9 119 26 98C41 80 61 88 59 102C57 115 42 114 40 103M100 179C105 134 69 120 76 85C82 57 114 54 116 76C117 91 96 98 92 83M83 68C49 65 42 38 56 23C69 9 88 17 86 31C84 41 70 40 71 31M62 52C37 54 19 36 22 21M83 155C83 174 108 176 120 189');
const volute=mirror(scroll);
const lyre=mirror(path('M120 183C84 180 55 151 59 113L68 51C70 27 47 17 34 32C22 46 36 66 50 58C61 51 50 37 42 45M120 176C90 173 64 148 67 115L75 58M120 169C101 165 83 146 86 123L96 49M81 27Q103 48 120 34M93 39V140M105 43V156M116 40V163M60 116Q30 103 23 121C14 143 44 154 48 133M48 133C49 125 37 121 35 131M69 155C31 174 52 201 76 188M95 173Q80 199 65 200'));
const shell=Array.from({length:13},(_,i)=>{const a=(i-6)*.16;const x=120+Math.sin(a)*104,y=140-Math.cos(a)*100;return path(`M120 166Q${120+Math.sin(a)*28} 103 ${x.toFixed(1)} ${y.toFixed(1)}`)}).join('');
const scallop=mirror(path('M120 166C103 172 92 150 68 147C44 145 31 164 15 155C-2 145 6 124 21 126C36 128 31 146 22 140M120 166Q110 190 85 188Q104 197 120 183M120 166C64 169 36 125 23 87Q38 89 45 70Q60 76 69 56Q83 65 93 45Q108 55 120 40'))+shell;
const chain=Array.from({length:9},(_,i)=>{const x=24+i*24;return path(`M${x} 39l10 11-10 11-10-11Z`)+bead(x,50,2)}).join('');
function guilloche(rx=82,ry=39,lobes=12){return Array.from({length:3},(_,k)=>{let d='';for(let i=0;i<=300;i++){const t=i/300*Math.PI*2,r=1+.055*Math.sin(t*lobes+k*2.1);d+=(i?'L':'M')+(120+Math.cos(t)*rx*r).toFixed(2)+' '+(70+Math.sin(t)*ry*r).toFixed(2)+' ';}return path(d+'Z');}).join('');}
const flourish=mirror(path('M120 63C89 64 75 39 51 43C30 47 27 72 45 76C59 80 68 61 55 57C46 54 42 67 50 68M120 70C92 78 65 88 32 83C14 80 5 70 8 62M112 64C115 34 90 22 82 37C77 46 88 55 94 48M120 70C92 95 58 109 24 99M120 63C107 46 125 28 133 36'));
const buckle=mirror(path('M120 26C104 12 88 21 83 34H43Q42 50 23 55V111Q43 116 43 132H83C90 146 106 151 120 137M120 36C105 25 92 34 89 43H51Q49 57 33 62V104Q49 109 51 123H90Q101 137 120 126M24 54C8 50 7 30 22 28C39 26 42 47 28 46M24 112C8 116 7 136 22 138C39 140 42 119 28 120M74 34C75 13 48 11 45 28M74 132C76 153 47 157 43 140'));
const corner=path('M20 190V46Q20 20 46 20H220M27 180V50Q27 27 50 27H210M36 170V62Q36 36 62 36H200M38 114C113 114 59 58 116 52C146 49 165 78 145 91C130 102 113 89 119 77C123 68 135 73 132 80M42 107C98 102 62 65 111 59M53 157C91 144 59 123 88 108C111 96 137 112 127 130C118 148 96 139 104 126M110 38C113 15 140 17 145 32M38 110C15 113 17 140 32 145M177 36C178 49 195 55 204 43M36 177C49 178 55 195 43 204');
export const heritageMotifs={
 volute:{box:'0 0 240 210',body:volute},
 lyre:{box:'0 0 240 210',body:lyre},
 shell:{box:'0 0 240 210',body:scallop},
 flourish:{box:'0 0 240 125',body:flourish},
 buckle:{box:'0 0 240 165',body:buckle},
 corner:{box:'0 0 240 220',body:corner},
 guilloche:{box:'0 0 240 140',body:guilloche()+path('M18 70H0m240 0h-18M113 70l7-7 7 7-7 7Z')},
 diamond:{box:'0 0 264 100',body:chain+path('M10 35H250M10 65H250M5 29H255M5 71H255')},
 arcade:{box:'0 0 240 180',body:mirror(path('M120 15C90 15 82 40 55 40C48 56 41 61 23 65V144M120 24C93 24 86 49 61 49C54 66 46 69 32 73V136M22 147H105M32 139H95M16 155H110M57 49C56 15 21 16 20 37C19 56 43 60 45 43C46 33 31 27 29 39M45 139V89Q55 82 66 69M105 32Q80 81 75 120M75 120Q64 147 50 137'))},
 filigree:{box:'0 0 240 170',body:mirror(path('M120 23C82 21 73 56 90 73C105 88 127 77 115 62C104 49 87 66 102 71M120 139C82 141 73 106 90 89C105 74 127 85 115 100C104 113 87 96 102 91M89 37C37 5 14 35 32 55C49 73 69 53 55 41C47 34 36 44 42 49M89 125C37 157 14 127 32 107C49 89 69 109 55 121C47 128 36 118 42 113M86 81C59 61 30 63 12 81C30 99 59 101 86 81M31 81H82'))},
 console:{box:'0 0 240 210',body:mirror(path('M120 184C100 184 98 166 83 166C62 166 40 191 25 178C11 166 24 142 41 154C50 162 41 173 34 166M119 175C113 139 80 135 65 107C51 81 62 50 89 56C109 60 111 81 96 87C83 93 72 77 84 71M120 164C115 136 91 131 78 107M65 107C33 108 10 78 26 56C37 41 55 45 56 58M89 56C75 24 96 10 120 18M36 135C15 130 10 111 22 99M84 166Q97 190 120 200'))},
 medallion:{box:'0 0 240 180',body:guilloche(67,49,16)+mirror(path('M44 72C6 39 1 79 22 84C36 88 40 64 27 63M44 72C23 102 41 125 57 117M120 15Q101 1 89 17M120 127Q100 158 82 138M57 117Q75 122 81 108'))+path('M109 70q11-21 22 0q-11 21-22 0Z')},
 ribbonwork:{box:'0 0 240 160',body:mirror(path('M120 31C99 6 74 18 75 37C76 58 103 59 101 43C99 30 84 35 90 44M120 36C89 52 68 72 38 58C15 47 20 26 37 28C50 30 47 47 35 41M120 122C86 132 62 105 40 108C22 111 15 133 34 139C48 143 57 127 45 121M110 39L46 107M100 51L56 102M120 122C94 147 71 141 72 123M35 67L15 99L43 93'))},
 crestless:{box:'0 0 240 175',body:mirror(path('M120 18Q100 30 86 16Q69 8 64 26Q40 21 36 43Q11 48 26 73Q11 98 36 103Q41 125 65 120Q69 140 87 132Q101 117 120 132M120 29Q99 42 85 29Q76 22 73 36Q47 28 46 51Q24 56 37 73Q24 90 46 95Q49 116 73 109Q77 125 87 117Q102 105 120 120M62 43C39 66 55 93 76 85C88 81 87 65 76 65C66 65 64 79 74 78'))},
};
export function heritageSVG(kind='flourish',className=''){
 const o=heritageMotifs[kind]||heritageMotifs.flourish;
 return `<svg class="${className}" data-motif="${kind}" viewBox="${o.box}" fill="none" stroke="currentColor" stroke-width=".85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${o.body.replaceAll('<path ','<path pathLength="1" ')}</svg>`;
}
export const sectionThemes={
 home:[['arcade','buckle','flourish'],['corner','guilloche','diamond'],['console','ribbonwork','shell'],['lyre','medallion','filigree'],['crestless','arcade','ribbonwork'],['volute','console','buckle']],
 catalog:[['buckle','flourish','diamond'],['corner','guilloche','filigree']],
 product:[['arcade','console','shell'],['ribbonwork','medallion','diamond']],
 stores:[['crestless','arcade','flourish'],['console','buckle','ribbonwork']],
 manufactory:[['lyre','volute','shell'],['ribbonwork','guilloche','flourish'],['crestless','medallion','buckle'],['corner','filigree','diamond']],
 partners:[['console','arcade','filigree'],['corner','buckle','ribbonwork'],['lyre','guilloche','diamond'],['crestless','medallion','shell'],['volute','ribbonwork','flourish']],
 contacts:[['medallion','console','flourish'],['corner','arcade','buckle'],['ribbonwork','crestless','diamond']],
 privacy:[['guilloche','filigree','flourish'],['corner','buckle','ribbonwork']]
};
