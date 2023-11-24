// ***** Avalanche *****
(function() {
    // # create.js의 기본적인 설정은 되어 있는 상태 
    // # stage, mcRoot(최상단 MovieClip 등) 

    const Engine = Matter.Engine,  
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

    // ------------------- matter.js setting -------------------
    const engine = Engine.create();
    const world = engine.world;
    const runner = Runner.create();
    const render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: 1334,
            height: 800,
            showPositions: true
        }
    });

    Runner.run(engine, runner);     // 물리엔진 실행
    Render.run(render);             // 물리엔진 렌더링 실행
    Matter.use(MatterWrap);         // Wrapper 사용 선언
    // ---------------------------------------------------------



    // matter.js 정적 요소 생성
    const statics = [
        Bodies.rectangle(400, 180, 500, 20, {isStatic: true, angle: Math.PI * 0.06, chamfer: {radius: 10}}),
        Bodies.rectangle(950, 350, 500, 20, {isStatic: true, angle: -Math.PI * 0.06, chamfer: {radius: 10}}),
        Bodies.rectangle(450, 600, 500, 20, {isStatic: true, angle: Math.PI * 0.04, chamfer: {radius: 10}})
    ];
    Composite.add(world, statics);


    // matter.js 동적 요소 생성
    const stack = Composites.stack(400, 0, 20, 4, 0, 0, function(x, y) {
        return Bodies.circle(x, y, Common.random(10, 20), {frictionAir: 0.001, restitution: 0.1, density: 0.001});
    });
    Composite.add(world, stack);




    // create.js 정적 요소 생성 (matter.js에서 생성한 정적 요소)
    statics.forEach(el => {
        const rect = new cjs.Shape(
            new cjs.Graphics()
                .s("#F6F6F6")
                .ss(3)
                .rr(0, 0, 500, 20, 10)
        );

        rect.regX = 500 / 2;
        rect.regY = 20 / 2;

        rect.x = el.position.x;
        rect.y = el.position.y;
        rect.rotation = el.angle * (180 / Math.PI);

        mcRoot.addChild(rect);
    });


    // create.js 동적 요소 생성 (matter.js에서 생성한 동적 요소)
    const img = new Image();
    img.src = "./imgs/forCreate/snowball.png";

    const cjs_stack = stack.bodies.map(el => {
        const snow = new cjs.Bitmap(img);
        snow.regX = 20;
        snow.regY = 20;

        snow.scaleX = (el.circleRadius * 2) / 40;
        snow.scaleY = (el.circleRadius * 2) / 40;

        snow.x = el.position.x;
        snow.y = el.position.y;
        snow.rotation = el.angle * (180 / Math.PI);

        mcRoot.addChild(snow);
        return snow;
    });



    // Wrapper 지점 설정
    for (let i = 0; i < stack.bodies.length; i++) {
        stack.bodies[i].plugin.wrap = {
            min: { x: render.bounds.min.x, y: render.bounds.min.y },
            max: { x: render.bounds.max.x, y: render.bounds.max.y }
        };
    };



    // --- frameUpdate ---
    (function frameUpdate() {
        // frame이 update될때마다 create.js요소에 matter.js요소 좌표, 회전 값을 적용
        cjs_stack.forEach((el, i) => {
            el.x = stack.bodies[i].position.x;
            el.y = stack.bodies[i].position.y;
            el.rotation = stack.bodies[i].angle * (180 / Math.PI);
        });

        if (flag) stage.update();
        window.requestAnimationFrame(frameUpdate);
    })();
})();