var Engine = Matter.Engine,  
    World = Matter.World,
    Render = Matter.Render,   
    Runner = Matter.Runner,                     
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Common = Matter.Common,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Constraint = Matter.Constraint,
    Events = Matter.Events,
    Vector = Matter.Vector;


var engine,
    world,
    runner,
    render;


// --- create.js setting ---
var cjs = createjs;
var canvas = document.getElementById("canvas");
var stage = new cjs.Stage("canvas");
var mcRoot = new cjs.MovieClip();

const background = new cjs.MovieClip();

const b_color = new cjs.Shape(
    new cjs.Graphics().f("rgba(0, 214, 255, 0.4)").dr(0, 0, 1334, 800)
);
background.addChild(b_color);

for (let i = 0, h = 0; i < 6; i++, h++) {
    const img = new Image();
    img.src = "./imgs/forCreate/cloud.png";
    const cloud = new cjs.Bitmap(img);

    let xx = 150 + (180 * i);
    let yy = 150 + (200 * h);

    if (yy >= 400) h = -1;

    cloud.x = xx;
    cloud.y = yy;

    background.addChild(cloud);
}

mcRoot.addChild(background);
stage.addChild(mcRoot);




// # ========== switchBtn Event ==========
var flag = true;
const switchBtn = document.getElementById("sw");

function swClick() {
    if (flag) sw.innerText = "show\ncreate.js screen";
    else sw.innerText = "show\nmatter.js screen";

    flag = !flag;
}

switchBtn.addEventListener("click", swClick);



// # ========== menu Event ==========
const menu = document.getElementById("menu");
const title = document.getElementById("section_title");
const c_img = document.getElementById("code_img");
const ref_container = document.getElementById("ref_container");
const ref_tags = document.getElementById("ref_tags");
const re_btn = document.getElementById("restart_btn");

let script = document.createElement("script");
script.src = "./js/" + menu.value + ".js";
document.head.appendChild(script);


menu.addEventListener("change", e => {
    refresh();

    // 타이틀 변경
    title.innerText = e.target.options[e.target.selectedIndex].text;


    // 코드 이미지 변경
    c_img.src = "./imgs/code/" + e.target.value + ".png";


    // 이미지 출처 부분
    refChange(e.target.value);


    // 스크롤 맨 위로
    window.scrollTo({
        top: 0,
        behavior: "instant"
    });
    

    // 최초 화면 상태로
    flag = false;
    swClick();
});



re_btn.addEventListener("click", refresh);




/**
 * 코드 리프레쉬를 위한 함수
 * @param {HTMLElement} e 
 */
function refresh() {
    // 엔진 중지
    World.clear(world);
    Engine.clear(engine);
    Render.stop(render);
    Runner.stop(runner);
    render.canvas = null;
    render.context = null;
    render.engine = null;


    // 전체 삭제 후 배경 삽입
    stage.removeAllChildren();
    mcRoot.removeAllChildren();
    mcRoot.addChild(background);
    stage.addChild(mcRoot);


    // 스크립트 태그 변경
    const newScript = document.createElement("script");
    newScript.src = "./js/" + menu.value + ".js";

    document.head.removeChild(script);
    document.head.appendChild(newScript);
    script = newScript;
}



/**
 * 이미지 출처 표기를 위한 함수
 * @param {string} value 
 */
function refChange(value) {
    ref_tags.innerHTML = '';
    ref_container.style.display = 'none'

    if (value === "airFriction") {
        ref_container.style.display = 'flex';
        ref_tags.innerHTML += '<a href="https://www.flaticon.com/free-icons/wooden-box" title="wooden box icons">Wooden box icons created by kerismaker - Flaticon</a>';

    } else if (value === "avalanche") {
        ref_container.style.display = 'flex';
        ref_tags.innerHTML += '<a href="https://www.flaticon.com/free-icons/snowball" title="snowball icons">Snowball icons created by mnauliady - Flaticon</a>';
        
    } else if (value === "bridge") {
        ref_container.style.display = 'flex';
        ref_tags.innerHTML += '<a href="https://www.flaticon.com/free-icons/cliff" title="cliff icons">Cliff icons created by kerismaker - Flaticon</a>';
        ref_tags.innerHTML += '<a href="https://www.flaticon.com/free-icons/wood" title="wood icons">Wood icons created by srip - Flaticon</a>';
        ref_tags.innerHTML += '<a href="https://www.flaticon.com/free-icons/wooden-box" title="wooden box icons">Wooden box icons created by kerismaker - Flaticon</a>';
        ref_tags.innerHTML += '<a href="https://www.flaticon.com/free-icons/bridge" title="bridge icons">Bridge icons created by Freepik - Flaticon</a>';

    } else if (value === "car") {
        ref_container.style.display = 'flex';
        ref_tags.innerHTML += '<a href="https://www.flaticon.com/free-icons/car-parts" title="car parts icons">Car parts icons created by kerismaker - Flaticon</a>';
        ref_tags.innerHTML += '<a href="https://www.flaticon.com/free-icons/road" title="road icons">Road icons created by Flat Icons - Flaticon</a>';
        ref_tags.innerHTML += '<a href="https://www.flaticon.com/free-icons/tyre" title="tyre icons">Tyre icons created by Yogi Aprelliyanto - Flaticon</a>';

    } else if (value === "catapult") {
        ref_container.style.display = 'flex';
        ref_tags.innerHTML += '<a href="https://www.flaticon.com/free-icons/wooden-box" title="wooden box icons">Wooden box icons created by kerismaker - Flaticon</a>';
        ref_tags.innerHTML += '<a href="https://www.flaticon.com/free-icons/asteroid" title="Asteroid icons">Asteroid icons created by mnauliady - Flaticon</a>';
        
    } else if (value === "curtain") {
        ref_container.style.display = 'flex';
        ref_tags.innerHTML += '<a href="https://www.flaticon.com/free-icons/window" title="window icons">Window icons created by Freepik - Flaticon</a>';
        
    } else if (value === "collisionFilter") {
        ref_container.style.display = 'flex';
        ref_tags.innerHTML += '<a href="https://www.flaticon.com/free-icons/basketball" title="basketball icons">Basketball icons created by Ahmad Yafie - Flaticon</a>';

    }
}