// ***** CataPult *****
(function() {
    // # create.js의 기본적인 설정은 되어 있는 상태 
    // # stage, mcRoot(최상단 MovieClip) 

    // ------------------- matter.js setting -------------------
    engine = Engine.create();
    world = engine.world;
    runner = Runner.create();
    render = Render.create({
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



    // ------ matter.js ------
    // matter.js 정적 요소 생성
    Composite.add(world, [
        Bodies.rectangle(667, 800, 1334, 30, {isStatic: true}),
        Bodies.rectangle(130, 710, 30, 150, {isStatic: true}),
        Bodies.rectangle(1150, 220, 300, 30, {isStatic: true})
    ]);


    // matter.js group 생성
    const group = Body.nextGroup(true);

    const catapult_fixture = Bodies.rectangle(300, 685, 30, 240, {
        isStatic: true, 
        collisionFilter: {group: group},
        chamfer: {radius: 15}
    });


    const catapult_rect = Bodies.rectangle(300, 600, 400, 30, {collisionFilter: {group: group}, density: 0.005});
    const catapult_pedestal = Bodies.rectangle(95, 590, 10, 60, {collisionFilter: {group: group}});

    Composite.add(world, [
        catapult_fixture,
        catapult_rect,
        catapult_pedestal,
        Constraint.create({
            bodyA: catapult_rect,
            pointA: {x: -200, y: -15},
            bodyB: catapult_pedestal,
            pointB: {x: 5, y: 0},
            stiffness: 1,
            length: 0
        }),
        Constraint.create({
            bodyA: catapult_rect,
            pointA: {x: -200, y: 15},
            bodyB: catapult_pedestal,
            pointB: {x: 5, y: 30},
            stiffness: 1,
            length: 0
        }),
        Constraint.create({
            bodyA: catapult_fixture,
            pointA: {x: 0, y: -85},
            bodyB: catapult_rect,
            stiffness: 1,
            length: 0
        })
    ]);


    // matter.js 동적 요소 생성 (움직이는 물체)
    const rock = Bodies.circle(130, 520, 30, {
        density: 0.001,
        frictionAir: 0.005
    });

    const circle = Bodies.circle(450, 100, 50, {
        density: 0.1,
        frictionAir: 0.001
    });

    const stack = Composites.stack(1054, -100, 3, 3, 0, 0, function(x, y) {
        return Bodies.rectangle(x, y, 64, 64, {
            density: 0.00007
        });
    });

    Composite.add(world, [rock, circle, stack]);




    // ------ create.js ------
    // create.js 동적 요소 생성 (matter.js에서 생성한 동적 요소)
    const img = new Image();
    img.src = "./imgs/forCreate/asteroid.png";

    const cjs_rock = new cjs.Bitmap(img);
    cjs_rock.regX = 30;
    cjs_rock.regY = 30;
    cjs_rock.x = rock.position.x;
    cjs_rock.y = rock.position.y;
    mcRoot.addChild(cjs_rock);


    const cjs_circle = new cjs.Shape(new cjs.Graphics().f("#353535").dc(0, 0, 50));
    cjs_circle.x = circle.position.x;
    cjs_circle.y = circle.position.y;
    mcRoot.addChild(cjs_circle);


    // create.js 정적 요소1 생성 (view를 위해 먼저 설정)
    const rect2 = new cjs.Shape(new cjs.Graphics().f("#949494").s("black").dr(0, 0, 30, 150));
    rect2.regX = 15;
    rect2.regY = 75;
    rect2.x = 130;
    rect2.y = 710;
    mcRoot.addChild(rect2);


    // create.js group 요소 생성 (matter.js에서 생성한 group 요소)
    const cjs_catapult_rect = new cjs.MovieClip();

    const cjs_rect_1 = new cjs.Shape(
        new cjs.Graphics()
            .f("#4C4C4C")
            .s("black")
            .dr(0, 0, 400, 30)
    );
    cjs_catapult_rect.addChild(cjs_rect_1);

    const cjs_rect_2 = new cjs.Shape(
        new cjs.Graphics()
            .f("#4C4C4C")
            .dr(0, 0, 10, 60)
    );
    cjs_rect_2.x = -10;
    cjs_rect_2.y = -30;
    cjs_catapult_rect.addChild(cjs_rect_2);

    cjs_catapult_rect.regX = 200;
    cjs_catapult_rect.regY = 15;
    cjs_catapult_rect.x = 300;
    cjs_catapult_rect.y = 600;

    const arc = new cjs.Shape(
        new cjs.Graphics()
            .f("#4C4C4C")
            .s("black")
            .arc(30, -30, 90, 0, 3.14)
            .moveTo(-60, -30)
            .lineTo(120, -30)
    );
    cjs_catapult_rect.addChild(arc);

    mcRoot.addChild(cjs_catapult_rect);


    const cjs_fixture = new cjs.Shape(
        new cjs.Graphics()
            .f("#543900")
            .s("#301500")
            .rr(0, 0, 30, 240, 15)
    );
    cjs_fixture.regX = 15;
    cjs_fixture.regY = 120;
    cjs_fixture.x = 300;
    cjs_fixture.y = 685;
    mcRoot.addChild(cjs_fixture);

    const dot = new cjs.Shape(new cjs.Graphics().f("black").dc(0, 0, 5));
    dot.x = 300;
    dot.y = 600;
    mcRoot.addChild(dot);


    // create.js 정적 요소2 생성 (matter.js에서 생성한 정적 요소)
    const rect1 = new cjs.Shape(
        new cjs.Graphics()
            .f("rgb(47, 157, 39)")
            .s("#003E00")
            .dr(0, 0, 1334, 30)
    );
    rect1.regX = 667;
    rect1.regY = 15;
    rect1.x = 667;
    rect1.y = 800;
    mcRoot.addChild(rect1);

    const box_rect = new cjs.Shape(
        new cjs.Graphics()
            .f("rgb(47, 157, 39)")
            .s("#003E00")
            .dr(0, 0, 300, 30)
    );
    box_rect.regX = 150;
    box_rect.regY = 15;
    box_rect.x = 1150;
    box_rect.y = 220;
    mcRoot.addChild(box_rect);

    const box_img = new Image();
    box_img.src = "./imgs/forCreate/box.png";

    const boxes = stack.bodies.map(el => {
        const box = new cjs.Bitmap(box_img);
        box.regX = 32;
        box.regY = 32;
        box.x = el.position.x;
        box.y = el.position.y;
        mcRoot.addChild(box);
        return box;
    });




    // --- frameUpdate ---
    (function frameUpdate() {
        // frame이 update될때마다 create.js요소에 matter.js요소 좌표, 회전 값을 적용
        cjs_catapult_rect.rotation = catapult_rect.angle * (180 / Math.PI);

        cjs_rock.x = rock.position.x;
        cjs_rock.y = rock.position.y;
        cjs_rock.rotation = rock.angle * (180 / Math.PI);

        cjs_circle.x = circle.position.x;
        cjs_circle.y = circle.position.y;
        cjs_circle.rotation = circle.angle * (180 / Math.PI);

        boxes.forEach((el, i) => {
            el.x = stack.bodies[i].position.x;
            el.y = stack.bodies[i].position.y;
            el.rotation = stack.bodies[i].angle * (180 / Math.PI);
        });

        if (flag) stage.update();
        window.requestAnimationFrame(frameUpdate);
    })();
})();