*{
margin:0;
padding:0;
box-sizing:border-box;
}

html,body{
width:100%;
height:100%;
overflow:hidden;
font-family:'Inter',sans-serif;
background:#000;
color:#fff;
}

body{
position:relative;
}

/* Background */

.background-blur{
position:fixed;
inset:0;
background:
radial-gradient(circle at top left,#1a1a1a,#000),
radial-gradient(circle at bottom right,#111,#000);
z-index:-2;
}

/* Container */


.container{
position:relative;
width:100%;
height:100vh;
overflow:hidden;
}

/* Camera */


video{
width:100%;
height:100%;
object-fit:cover;
transform:scale(1.03);
filter:
brightness(.9)
contrast(1.08)
saturate(1.05);
}

/* Overlay */


.overlay{
position:absolute;
bottom:0;
left:0;
width:100%;
padding:25px;
display:flex;
justify-content:center;
align-items:center;

background:
linear-gradient(
to top,
rgba(0,0,0,.88),
rgba(0,0,0,.35),
transparent
);

animation:fadeUp .45s ease;
}

/* Card */

.glass-card{

width:100%;
max-width:450px;

padding:28px;

border-radius:28px;

background:rgba(255,255,255,.08);

backdrop-filter:blur(30px);
-webkit-backdrop-filter:blur(30px);

border:1px solid rgba(255,255,255,.15);

box-shadow:
0 8px 30px rgba(0,0,0,.35),
0 0 1px rgba(255,255,255,.3);
}

/* Text */

#title{
font-size:28px;
font-weight:700;
margin-bottom:10px;
letter-spacing:-0.03em;
}

#subtitle{
font-size:15px;
opacity:.75;
line-height:1.5;
}

/* Buttons */

.actions{
display:flex;
gap:12px;
margin-top:22px;
justify-content:center;
}

button{
cursor:pointer;
transition:.25s ease;
font-size:15px;
font-weight:600;
}

.btn-primary{

padding:14px 24px;

border:none;

border-radius:18px;

background:#fff;
color:#000;

box-shadow:
0 8px 25px rgba(255,255,255,.15);
}

.btn-primary:hover{
transform:translateY(-2px);
}

.btn-primary:active{
transform:scale(.97);
}

/* Secondary */

.btn-secondary{

padding:14px 24px;

border-radius:18px;

border:1px solid rgba(255,255,255,.15);

background:rgba(255,255,255,.08);

color:#fff;

backdrop-filter:blur(20px);
}

.btn-secondary:hover{
background:rgba(255,255,255,.12);
}

.btn-secondary:active{
transform:scale(.97);
}

/* Progress */

.topbar{

position:absolute;
top:20px;
left:50%;
transform:translateX(-50%);

display:flex;
gap:8px;

z-index:99;
}

.dot{

width:8px;
height:8px;

border-radius:50%;

background:rgba(255,255,255,.2);

transition:.3s;
}

.dot.active{

width:24px;

border-radius:999px;

background:#fff;
}

/* Preview */

.preview{
display:flex;
gap:12px;
margin-top:15px;

justify-content:center;
}

.preview img{

width:45%;

border-radius:20px;

border:1px solid rgba(255,255,255,.15);

object-fit:cover;

box-shadow:
0 8px 20px rgba(0,0,0,.25);
}

/* Result */

.result{

width:100%;

border-radius:22px;

margin-top:15px;

border:1px solid rgba(255,255,255,.15);
}

/* Loader */

.loader{

width:70px;
height:70px;

margin:15px auto;

border-radius:50%;

border:4px solid rgba(255,255,255,.15);

border-top-color:#fff;

animation:spin .8s linear infinite;
}

/* Error Card */

.error-card{

padding:20px;

border-radius:18px;

background:#1b1b1b;

text-align:center;

border:1px solid rgba(255,255,255,.12);
}

/* Animations */

@keyframes spin{

100%{
transform:rotate(360deg);
}

}

@keyframes fadeUp{

from{
opacity:0;
transform:translateY(25px);
}

to{
opacity:1;
transform:translateY(0);
}

}

/* Mobile */

@media(max-width:600px){

.glass-card{
padding:22px;
}

#title{
font-size:24px;
}

button{
width:100%;
}

.actions{
flex-direction:column;
}

}
