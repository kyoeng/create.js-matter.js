// ***** Car *****
(function() {
    // # create.js의 기본적인 설정은 되어 있는 상태 
    // # stage, mcRoot(최상단 MovieClip) 

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
            showPositions: true,
            showCollisions: true,
            showAngleIndicator: true
        }
    });

    Runner.run(engine, runner);     // 물리엔진 실행
    Render.run(render);             // 물리엔진 렌더링 실행
    // ---------------------------------------------------------



    // matter.js 정적 요소 생성
    const stairCount = Math.floor((render.bounds.max.y - render.bounds.min.y) / 110);

    const stack = Composites.stack(0, 600, stairCount + 2, 1, 0, 0, function(x, y, column) {
        return Bodies.rectangle(x - 80, y + column * 14, 200, 1000, {
            isStatic: true,
            angle: Math.PI * 0.023
        });
    });

    Composite.add(world, stack);


    // matter.js 동적 요소 생성 (움직이는 물체)
    const car = createCar(200, 500);
    Composite.add(world, car);


    // matter.js update 이벤트
    let idx = stack.bodies.length - 1;
    const xGap = Math.abs(stack.bodies[0].position.x - stack.bodies[1].position.x);
    const yGap = Math.abs(stack.bodies[0].position.y - stack.bodies[1].position.y);

    Events.on(engine, "afterUpdate", function(e) {
        const timeScale = (e.delta || (1000 / 60)) / 1000;

        for (let i = 0; i < stack.bodies.length; i++) {
            const body = stack.bodies[i];
            Body.translate(body, {
                x: -xGap * timeScale,
                y: -yGap * timeScale
            });

            if (body.position.x < -150) {
                Body.setPosition(body, {
                    x: stack.bodies[idx].position.x + xGap,
                    y: stack.bodies[idx].position.y + yGap
                });

                Body.setVelocity(body, {
                    x: 0,
                    y: 0
                });

                idx = stack.bodies.indexOf(body);
            }
        }
    });



    // create.js 정적 요소 생성 (matter.js에서 생성한 정적 요소)
    const road_img = new Image();
    road_img.src = "./imgs/forCreate/road.png";

    const cjs_stack = stack.bodies.map(el => {
        const mv = new cjs.MovieClip();
        const rect = new cjs.Shape(new cjs.Graphics().f("#A6A6A6").dr(0, 0, 200, 1000));
        const road = new cjs.Bitmap(road_img);
        road.y = -105;
        mv.addChild(rect);
        mv.addChild(road);

        mv.regX = 100;
        mv.regY = 500;
        mv.x = el.position.x;
        mv.y = el.position.y;
        mv.rotation = el.angle * (180 / Math.PI);

        mcRoot.addChild(mv);
        return mv;
    });


    // create.js 동적 요소 생성 (matter.js에서 생성한 동적 요소)
    const frame_img = new Image();
    const tyre_img = new Image();
    frame_img.src = "./imgs/forCreate/frame.png";
    tyre_img.src = "./imgs/forCreate/wheel.png";

    const cjs_car = new cjs.MovieClip();
    const frame = new cjs.Bitmap(frame_img);
    cjs_car.addChild(frame);

    const tyreA = new cjs.Bitmap(tyre_img);
    const tyreB = new cjs.Bitmap(tyre_img);

    tyreA.regX = 30;
    tyreA.regY = 30;
    tyreB.regX = 30;
    tyreB.regY = 30;

    tyreA.x = 35;
    tyreB.x = 155;
    tyreA.y = 93;
    tyreB.y = 93;

    cjs_car.addChild(tyreA);
    cjs_car.addChild(tyreB);

    cjs_car.regX = 188 / 2;
    cjs_car.regY = 93;
    cjs_car.x = car.bodies[0].position.x;
    cjs_car.y = car.bodies[0].position.y;

    mcRoot.addChild(cjs_car);



    // --- frameUpdate ---
    (function frameUpdate() {
        // frame이 update될때마다 create.js요소에 matter.js요소 좌표, 회전 값을 적용
        cjs_stack.forEach((el, i) => {
            el.x = stack.bodies[i].position.x;
            el.y = stack.bodies[i].position.y;
        });

        cjs_car.x = car.bodies[0].position.x;
        cjs_car.y = car.bodies[0].position.y;
        cjs_car.rotation = car.bodies[0].angle * (180 / Math.PI);
        cjs_car.children[1].rotation = car.bodies[1].angle * (180 / Math.PI);
        cjs_car.children[2].rotation = car.bodies[2].angle * (180 / Math.PI);

        if (flag) stage.update();
        window.requestAnimationFrame(frameUpdate);
    })();



    /**
     * 자동차 모양 객체를 만들기 위한 함수
     * @param {number} xx 
     * @param {number} yy 
     * @param {number} friction 
     * @returns new car
     */
    // --- create car ---
    function createCar(xx, yy) {
        const group = Body.nextGroup(true);
        const wheelAOffset = -59;
        const wheelBOffset = 61;
        const wheelYOffset = 5;

        const car = Composite.create({label: "car"});

        const mainBody = Bodies.rectangle(xx, yy, 140, 10, {collisionFilter: {group, group}, density: 0.001});
    
        const tyreA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, 30, {
            collisionFilter: {group: group},
            friction: 0.8,
            frictionAir: 0.001
        });

        const tyreB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, 30, {
            collisionFilter: {group: group},
            friction: 0.8,
            frictionAir: 0.001
        });

        const axelA = Constraint.create({
            bodyB: mainBody,
            pointB: {x: wheelAOffset, y: wheelYOffset},
            bodyA: tyreA,
            stiffness: 1,
            length: 0
        });

        const axelB = Constraint.create({
            bodyB: mainBody,
            pointB: {x: wheelBOffset, y: wheelYOffset},
            bodyA: tyreB,
            stiffness: 1,
            length: 0
        });

        Composite.addBody(car, mainBody);
        Composite.addBody(car, tyreA);
        Composite.addBody(car, tyreB);
        Composite.addConstraint(car, axelA);
        Composite.addConstraint(car, axelB);
        
        return car;
    }
})();