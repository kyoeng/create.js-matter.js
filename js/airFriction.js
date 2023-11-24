// ***** Air Friction *****
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
    // ---------------------------------------------------------



    // matter.js 요소 생성=======================================
    // --- 좌측 요소들 생성 ---
    const left_parachute = createParachute(164, -150, 10, 2, 5, 5, 15);
    const left_box = Bodies.rectangle(333.5, 0, 64, 64, {density: 0.005, restitution: 0.8});

    Composite.add(world, [
        left_parachute,
        left_box,
        Constraint.create({
            bodyA: left_box,
            pointA: {x: -32, y: -32},
            bodyB: left_parachute.bodies[0],
            pointB: {x: 100, y: 70},
            stiffness: 1,
            length: 0
        }),
        Constraint.create({
            bodyA: left_box,
            pointA: {x: 32, y: -32},
            bodyB: left_parachute.bodies[9],
            pointB: {x: -100, y: 70},
            stiffness: 1,
            length: 0
        }),
        Constraint.create({
            bodyA: left_box,
            pointA: {x: -32, y: -32},
            bodyB: left_parachute.bodies[10],
            pointB: {x: 105, y: 35},
            stiffness: 1,
            length: 0
        }),
        Constraint.create({
            bodyA: left_box,
            pointA: {x: 32, y: -32},
            bodyB: left_parachute.bodies[left_parachute.bodies.length - 1],
            pointB: {x: -105, y: 35},
            stiffness: 1,
            length: 0
        })
    ]);


    // --- 우측 요소들 생성 ---
    const right_box = Bodies.rectangle(1000.5, 0, 64, 64, {density: 0.005, restitution: 0.8});
    const right_ground = Bodies.rectangle(1000.5, 800, 667, 50, {isStatic: true});
    Composite.add(world, [right_box, right_ground]);


    // --- create.js에서 참고할 부분 배열로 저장 ---
    const ref_parachute_arr = [
        left_parachute.bodies[0],
        left_parachute.bodies[9],
        left_parachute.bodies[10],
        left_parachute.bodies[left_parachute.bodies.length - 1]
    ];

    // create.js 요소 생성 =======================================
    const line_canvas = new cjs.MovieClip();
    stage.addChild(line_canvas);

    const img = new Image();
    img.src = "./imgs/forCreate/box.png";

    // --- 좌측 요소 생성 ---
    let cjs_parachute_line = null;                                  // 낙하산을 그릴 객체를 저장할 변수
    const cjs_parachute_connector = [null, null, null, null];       // 낙하산 연결선을 그릴 객체 저장할 변수

    const cjs_left_box = new cjs.Bitmap(img);
    cjs_left_box.regX = 32;
    cjs_left_box.regY = 32;
    cjs_left_box.x = left_box.position.x;
    cjs_left_box.y = left_box.position.y;

    mcRoot.addChild(cjs_left_box);



    // --- 우측 요소 생성 ---
    const cjs_right_box = new cjs.Bitmap(img);
    cjs_right_box.regX = 32;
    cjs_right_box.regY = 32;
    cjs_right_box.x = right_box.position.x;
    cjs_right_box.y = right_box.position.y;

    mcRoot.addChild(cjs_right_box);

    const cjs_right_ground = new cjs.Shape(
        new cjs.Graphics()
            .f("rgba(47, 157, 39, 0.5)")
            .s("rgb(47, 157, 39)")
            .dr(0, 0, 667, 50)
    );
    cjs_right_ground.regX = 667 / 2;
    cjs_right_ground.regY = 50 / 2;
    cjs_right_ground.x = right_ground.position.x;
    cjs_right_ground.y = right_ground.position.y;

    mcRoot.addChild(cjs_right_ground);



    // --- frameUpdate ---
    (function frameUpdate() {
        // frame이 update될때마다 create.js요소에 matter.js요소 좌표, 회전 값을 적용
        // frame이 update될때마다 그려진 선 지우고 새로 그리기
        line_canvas.removeAllChildren();

        // --- 좌측 요소 ---
        cjs_parachute_connector.forEach((el, i) => {
            el = new cjs.Shape(new cjs.Graphics().s("#000000").ss(0.7));

            if (i % 2 === 0) {
                el.graphics.moveTo(left_box.vertices[0].x, left_box.vertices[0].y);
            } else {
                el.graphics.moveTo(left_box.vertices[1].x, left_box.vertices[1].y);
            }

            el.graphics.lineTo(ref_parachute_arr[i].position.x, ref_parachute_arr[i].position.y);
            line_canvas.addChild(el);
        });


        cjs_parachute_line = new cjs.Shape(new cjs.Graphics().s("#000000").ss(1));

        for (let i = 0; i < left_parachute.bodies.length / 2 - 1; i++) {
            if (i % 2 === 0) cjs_parachute_line.graphics.f("#FF5E00");
            else cjs_parachute_line.graphics.f("#F2CB61");

            cjs_parachute_line.graphics.moveTo(
                left_parachute.bodies[i].position.x,
                left_parachute.bodies[i].position.y
            );
            cjs_parachute_line.graphics.lineTo(
                left_parachute.bodies[i + 1].position.x,
                left_parachute.bodies[i + 1].position.y
            );
            cjs_parachute_line.graphics.lineTo(
                left_parachute.bodies[i + 11].position.x,
                left_parachute.bodies[i + 11].position.y
            );
            cjs_parachute_line.graphics.lineTo(
                left_parachute.bodies[i + 10].position.x,
                left_parachute.bodies[i + 10].position.y
            );

            if (i === 0) {
                cjs_parachute_line.graphics.lineTo(
                    left_parachute.bodies[i].position.x,
                    left_parachute.bodies[i].position.y
                );
            }
        }
        line_canvas.addChild(cjs_parachute_line);
        

        cjs_left_box.x = left_box.position.x;
        cjs_left_box.y = left_box.position.y;
        cjs_left_box.rotation = left_box.angle * (180 / Math.PI);

        // --- 우측 요소 ---
        cjs_right_box.x = right_box.position.x;
        cjs_right_box.y = right_box.position.y;
        cjs_right_box.rotation = right_box.angle * (180 / Math.PI);

        if (flag) stage.update();
        window.requestAnimationFrame(frameUpdate);
    })();


    /**
     * 낙하산 모양 객체를 만들기 위한 함수
     * @param {number} xx 
     * @param {number} yy 
     * @param {number} column 
     * @param {number} row 
     * @param {number} cGap 
     * @param {number} rGap 
     * @param {number} radius 
     * @param {} options 
     * @param {} constraintOptions 
     * @returns new parachute
     */
    // --- create parachute ---
    function createParachute(xx, yy, column, row, cGap, rGap, radius, options, constraintOptions) {
        const group = Body.nextGroup(true);

        options = Common.extend({
            inertia: Infinity,
            friction: 0.00001,
            frictionAir: 0.5,
            collisionFilter: {group: group},
            render: {visible: false}
        }, options);

        constraintOptions = Common.extend({
            stiffness: 0.5,
            render: {type: "line", anchors: false}
        }, constraintOptions);

        const parachute = Composites.stack(xx, yy, column, row, cGap, rGap, function(x, y) {
            return Bodies.circle(x, y, radius, options);
        });

        Composites.mesh(parachute, column, row, false, constraintOptions);
        return parachute;
    }
})();