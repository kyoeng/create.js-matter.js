// ***** SlingAndCollision *****
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
            showPositions: true,
            wireframes: false
        }
    });

    Runner.run(engine, runner);     // 물리엔진 실행
    Render.run(render);             // 물리엔진 렌더링 실행
    // ---------------------------------------------------------




    // --- matter.js 요소 생성 ---

    // collision category =====
    const defaultCate = 0x0001;
    const categories = [0x0002, 0x0004, 0x0008];

    const floors = [        // 정적 요소 (받침대 역할)
        Bodies.rectangle(1100, 250, 300, 20, {
            isStatic: true,
            chamfer: {radius: 10}
        }),
        Bodies.rectangle(1100, 450, 300, 20, {
            isStatic: true,
            chamfer: {radius: 10}
        }),
        Bodies.rectangle(1100, 650, 300, 20, {
            isStatic: true,
            chamfer: {radius: 10}
        })
    ]
    Composite.add(world, floors);


    const stacks = new Array(floors.length);        // stack 요소
    const color = ["#F15F5F", "#FFE400", "#6B9900"];

    for (let i = 0; i < floors.length; i++) {
        stacks[i] = Composites.stack(1000, floors[i].position.y - 150, 5, 3, 0, 0, function(x, y) {
            return Bodies.rectangle(x, y, 40, 40, {
                collisionFilter: {
                    category: categories[i]
                },
                render: {
                    strokeStyle: color[i],
                    fillStyle: "transparent",
                    lineWidth: 1
                }
            });
        });
    }
    Composite.add(world, stacks);


    // ball button =====
    const buttons = [
        Bodies.circle(70, 70, 20, {
            label: "circle_1",
            isStatic: true,
            render: {
                strokeStyle: color[0],
                fillStyle: "transparent",
                lineWidth: 1
            }
        }),
        Bodies.circle(140, 70, 20, {
            label: "circle_2",
            isStatic: true,
            render: {
                strokeStyle: color[1],
                fillStyle: "transparent",
                lineWidth: 1
            }
        }),
        Bodies.circle(210, 70, 20, {
            label: "circle_3",
            isStatic: true,
            render: {
                strokeStyle: color[2],
                fillStyle: "transparent",
                lineWidth: 1
            }
        })
    ];
    Composite.add(world, buttons);


    // sling =====
    let firing = false;

    const balls = [
        Bodies.circle(200, 600, 20, {
            collisionFilter: {
                mask: defaultCate | categories[0]
            },
            density: 0.01,
            render: {
                fillStyle: color[0]
            }
        })
    ];

    const sling = Constraint.create({
        pointA: {x: 200, y: 600},
        bodyB: balls[0],
        length: 0.01,
        damping: 0.01,
        stiffness: 0.04
    });

    Composite.add(world, [
        balls[0],
        sling
    ]);


    // 마우스 이벤트 (matter.js에 마우스 이벤트를 할당)
    const mouse = Mouse.create(render.canvas);
    render.mouse = mouse;

    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            render: {
                visible: false      // 마우스 클릭 시 효과
            }
        }
    });
    Composite.add(world, mouseConstraint);


    // Events
    let nowBall = "circle_1";
    Events.on(engine, "afterUpdate", afterUpdateEvt);
    Events.on(mouseConstraint, "enddrag", endDragEvt);

    // 마우스 이벤트 ball만 가능하도록 설정
    mouseConstraint.collisionFilter.mask = defaultCate;


    // --- create.js 요소 생성 ---

    const img = new Image();
    img.src = "./imgs/forCreate/sling.png";

    floors.forEach(el => {          // 받침대
        const floor = new cjs.Shape(
            new cjs.Graphics()
                .s("#BDBDBD")
                .rr(0, 0, 300, 20, 10)
        );
        floor.regX = 150;
        floor.regY = 10;
        floor.x = el.position.x;
        floor.y = el.position.y;

        mcRoot.addChild(floor);
    });


    // stack =====
    const cjs_stack1 = stacks[0].bodies.map(el => {
        const rect = drawStackRect(el, 0);
        mcRoot.addChild(rect);
        return rect;
    });
    const cjs_stack2 = stacks[1].bodies.map(el => {
        const rect = drawStackRect(el, 1);
        mcRoot.addChild(rect);
        return rect;
    });
    const cjs_stack3 = stacks[2].bodies.map(el => {
        const rect = drawStackRect(el, 2);
        mcRoot.addChild(rect);
        return rect;
    });


    // buttons =====
    buttons.forEach((el, i) => {
        const circle = new cjs.Shape(
            new cjs.Graphics()
                .f(color[i])
                .s("#3F3F3F")
                .dc(0, 0, 20)
        );
        circle.x = el.position.x;
        circle.y = el.position.y;
        mcRoot.addChild(circle);
    });


    // ball =====
    const cjs_balls = [
        new cjs.Shape(
            new cjs.Graphics()
            .f(color[0])
            .s("#3F3F3F")
            .dc(0, 0, 20)
        )
    ];
    cjs_balls[0].x = balls[0].position.x;
    cjs_balls[0].y = balls[0].position.y;
    mcRoot.addChild(cjs_balls[0]);

        
    // sling line =====
    const line_canvas = new cjs.MovieClip();
    const sling_line_stPoint = [
        {x: sling.pointA.x - 40, y: sling.pointA.y + 8},
        {x: sling.pointA.x + 40, y: sling.pointA.y - 5},
    ]
    const sling_line = [null, null];

    stage.addChild(line_canvas);
    stage.setChildIndex(mcRoot, 1);
    stage.setChildIndex(line_canvas, 0);

    // sling img =====
    const cjs_sling = new cjs.Bitmap(img);
    cjs_sling.regX = 97 / 2;
    cjs_sling.regY = 150 / 2;
    cjs_sling.x = sling.pointA.x + 10;
    cjs_sling.y = sling.pointA.y + 55;
    cjs_sling.rotation = -10;
    mcRoot.addChild(cjs_sling);




    // --- frameUpdate ---
    (function frameUpdate() {
        line_canvas.removeAllChildren();

        cjs_stack1.forEach((v, i) => {
            v.x = stacks[0].bodies[i].position.x;
            v.y = stacks[0].bodies[i].position.y;
            v.rotation = stacks[0].bodies[i].angle * (180 / Math.PI);
        });

        cjs_stack2.forEach((v, i) => {
            v.x = stacks[1].bodies[i].position.x;
            v.y = stacks[1].bodies[i].position.y;
            v.rotation = stacks[1].bodies[i].angle * (180 / Math.PI);
        });

        cjs_stack3.forEach((v, i) => {
            v.x = stacks[2].bodies[i].position.x;
            v.y = stacks[2].bodies[i].position.y;
            v.rotation = stacks[2].bodies[i].angle * (180 / Math.PI);
        });

        cjs_balls.forEach((v, i) => {
            v.x = balls[i].position.x;
            v.y = balls[i].position.y;
            v.rotation = balls[i].angle * (180 / Math.PI);
        });

        sling_line.forEach((line, i) => {
            line = new cjs.Shape(new cjs.Graphics().s("#F6F6F6").ss(5));

            line.graphics.moveTo(
                sling_line_stPoint[i].x,
                sling_line_stPoint[i].y
            );

            line.graphics.lineTo(balls[balls.length - 1].position.x, balls[balls.length - 1].position.y);
            line_canvas.addChild(line);
        });

        if (flag) stage.update();
        window.requestAnimationFrame(frameUpdate);
    })();




    // --- endDragEvt ---
    function endDragEvt(e) {
        for (const btn of buttons) {
            if (e.body === btn) {
                nowBall = e.body.label;

                const idx = Number(nowBall.split('_')[1]) - 1;
                sling.bodyB.collisionFilter.mask = defaultCate | categories[idx];
                sling.bodyB.render.fillStyle = color[idx];

                const nowCjs = cjs_balls[cjs_balls.length - 1];
                nowCjs.graphics.f(color[idx]).dc(0, 0, 20);
            }

            console.log(balls);
            console.log(cjs_balls);
        }

        if (
            e.body === sling.bodyB && 
            (e.mouse.position.x < 150 || e.mouse.position.y > 650)
        ) {
            firing = true;
        }
    }




    // --- afterUpdateEvt ---
    function afterUpdateEvt(e) {
        const ball = sling.bodyB;

        if (
            firing &&
            (ball.position.x > 220 || ball.position.y < 580)
        ) {
            if (Body.getSpeed(ball) > 30) Body.setSpeed(ball, 30);

            const idx = Number(nowBall.split('_')[1]) - 1;
            balls.push(
                Bodies.circle(200, 600, 20, {
                    collisionFilter: {
                        mask: defaultCate | categories[idx]
                    },
                    density: 0.01,
                    render: {
                        fillStyle: color[idx],
                    }
                })
            );

            Composite.add(world, balls[balls.length - 1]);
            sling.bodyB = balls[balls.length - 1];


            cjs_balls.push(
                new cjs.Shape(
                    new cjs.Graphics()
                        .f(color[idx])
                        .s("#3F3F3F")
                        .dc(0, 0, 20)
                )
            );
            cjs_balls[cjs_balls.length - 1].x = sling.bodyB.position.x;
            cjs_balls[cjs_balls.length - 1].y = sling.bodyB.position.y;
            mcRoot.addChild(cjs_balls[cjs_balls.length - 1]);

            firing = false;
        }
    }



    // --- draw in stacks value (create.js) ---
    function drawStackRect(el, i) {
        const rect = new cjs.Shape(
            new cjs.Graphics()
                .f(color[i])
                .s("#3F3F3F")
                .dr(0, 0, 40, 40)
        );

        rect.regX = 20;
        rect.regY = 20;
        rect.x = el.position.x;
        rect.y = el.position.y;

        return rect;
    }
})();