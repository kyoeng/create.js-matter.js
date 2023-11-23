// ***** Bridge *****
(function() {
    // # create.js의 기본적인 설정은 되어 있는 상태 
    // # stage, mcRoot(최상단 MovieClip) 

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
    // ---------------------------------------------------------



    
    const static_size = {w: 320, h: 352};       // 정적 요소 사이즈
    const {w, h} = static_size;

    // matter.js 정적 요소 생성 (고정되어 있는 물체 ex. 장애물, 벽 등) - chamfer: 모따기를 위한 프로퍼티
    const statics = [
        Bodies.rectangle(130, 650, w - 40, h, {isStatic: true}),
        Bodies.rectangle(1204, 650, w - 40, h, {isStatic: true})
    ];
    Composite.add(world, statics);


    // matter.js 동적 요소 생성 (움직이는 물체) <- chain
    const group = Body.nextGroup(true);

    const bridge = Composites.stack(320, 400, 12, 1, 0, 0, function(x, y) {
        return Bodies.rectangle(x - 40, y, 100, 15, {
            collisionFilter: {group: group},
            chamfer: 5,
            density: 0.01,
            frictionAir: 0.1
        });
    });

    Composites.chain(bridge, 0.3, 0, -0.3, 0, {
        stiffness: 0.99,
        length: 0.0001
    });

    Composite.add(world, [
        bridge,
        Constraint.create({
            pointA: {x: 270, y: 474},
            bodyB: bridge.bodies[0],
            pointB: {x: -45, y: 0},
            length: 2,
            stiffness: 0.9
        }),
        Constraint.create({
            pointA: {x: 1064, y: 474},
            bodyB: bridge.bodies[bridge.bodies.length - 1],
            pointB: {x: 45, y: 0},
            length: 2,
            stiffness: 0.9
        })
    ]);


    // matter.js 동적 요소 생성 (움직이는 물체) <- stack
    const stack = Composites.stack(427, 100, 10, 5, 0, 0, function(x, y) {
        return Bodies.rectangle(x, y, 48, 48, {frictionAir: 0.01});
    });

    Composite.add(world, stack);



    // create.js 정적 요소 생성 (matter.js에서 생성한 정적 요소)
    statics.forEach((el, i) => {
        const img = new Image();
        img.src = "./imgs/forCreate/cliff.png";
        
        const cliff = new cjs.Bitmap(img);
        cliff.regX = w / 2;
        cliff.regY = h / 2;

        if (i !== 0) cliff.scaleX = -1;
        
        cliff.x = el.position.x;
        cliff.y = el.position.y;

        mcRoot.addChild(cliff);
    });



    // create.js 동적 요소 생성 (matter.js에서 생성한 동적 요소)
    const cjs_stack = stack.bodies.map(el => {
        const img = new Image();
        img.src = "./imgs/forCreate/box.png";

        const box = new cjs.Bitmap(img);
        box.scaleX = 0.75;
        box.scaleY = 0.75;

        box.regX = 32;
        box.regY = 32;

        box.x = el.position.x;
        box.y = el.position.y;

        mcRoot.addChild(box);
        return box;
    });

    const cjs_bridge = bridge.bodies.map(el => {
        const mv = new cjs.MovieClip();

        const img = new Image();
        img.src = "./imgs/forCreate/logs.png";

        const bitmap = new cjs.Bitmap(img);
        mv.addChild(bitmap);

        const img2 = new Image();
        img2.src = "./imgs/forCreate/bridge.png";

        const bitmap2 = new cjs.Bitmap(img2);
        bitmap2.x = (100 - 75) / 2;
        bitmap2.y = -41;
        mv.addChild(bitmap2);

        mv.regX = 50;
        mv.regY = 7.5;
        mv.x = el.position.x;
        mv.y = el.position.y;

        mcRoot.addChild(mv);
        return mv;
    });



    // 마우스 이벤트 (matter.js에 마우스 이벤트를 할당)
    const mouse = Mouse.create(render.canvas);
    render.mouse = mouse;
    
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false  
            }
        }
    });

    Composite.add(engine.world, mouseConstraint);


    // --- frameUpdate ---
    (function frameUpdate() {
        // frame이 update될때마다 create.js요소에 matter.js요소 좌표, 회전 값을 적용
        cjs_bridge.forEach((el, i) => {
            el.x = bridge.bodies[i].position.x;
            el.y = bridge.bodies[i].position.y;
            el.rotation = bridge.bodies[i].angle * (180 / Math.PI);
        });

        cjs_stack.forEach((el, i) => {
            el.x = stack.bodies[i].position.x;
            el.y = stack.bodies[i].position.y;
            el.rotation = stack.bodies[i].angle * (180 / Math.PI);
        });

        if (flag) stage.update();
        window.requestAnimationFrame(frameUpdate);
    })();
})();