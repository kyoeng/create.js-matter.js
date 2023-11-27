// ***** Collision Filter *****
(async function() {
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
            showPositions: true,
            wireframes: false
        }
    });

    Runner.run(engine, runner);     // 물리엔진 실행
    Render.run(render);             // 물리엔진 렌더링 실행
    // ---------------------------------------------------------


    const defaultCate = 0x0001;                 // 기본 카테고리 (마우스 이벤트가 적용될 카테고리)
    const cate = [0x0002, 0x0004];              // 커스텀 카테고리
    const colors = ["rgba(0, 34, 102, 0.5)", "rgba(246, 246, 246, 0.5)"];      // 카테고리 구분할 색
    
    let firing = false;                         // 이벤트에 사용할 플래그
    let sling;                                  // 농구공 던질 위치 (constraint 객체)
    let lastIdx = 0;

    const basketA = {};                         // A 농구대에 대한 객체
    const basketB = {};                         // B 농구대에 대한 객체
    const basketballs = [];                     // 농구공에 대한 배열 (matter.js)
    const cjs_basketBalls = [];                 // 농구공에 대한 배열 (create.js)

    let img;                                    // 농구공 이미지


    const line_canvas = new cjs.MovieClip();            // sling line을 그릴 상위 무비클립
    stage.addChild(line_canvas);

    const mc_ball_container = new cjs.MovieClip();      // 농구공을 그릴 상위 무비클립
    stage.addChild(mc_ball_container);
    
    const mc_net_container = new cjs.MovieClip();       // 농구 그물을 그릴 상위 무비클립
    stage.addChild(mc_net_container);
    
    const mc_rim_container = new cjs.MovieClip();       // 농구 림을 그릴 상위 무비클립
    stage.addChild(mc_rim_container);

    // sling line
    let line = null;

    // 현재 농구공의 collision을 안내할 shape
    const info_collision = [
        new cjs.Shape(new cjs.Graphics().f(colors[0]).dc(0, 0, 30)),
        new cjs.Shape(new cjs.Graphics().f(colors[1]).dc(0, 0, 30))
    ];
    info_collision[0].x = 100;
    info_collision[0].y = 100;
    info_collision[1].x = 200;
    info_collision[1].y = 100;
    mcRoot.addChild(info_collision[0]);
    mcRoot.addChild(info_collision[1]);

    const showInfo = new cjs.Shape(new cjs.Graphics().s("black").ss(5).dc(0, 0, 32));
    showInfo.x = 100;
    showInfo.y = 100;
    mcRoot.addChild(showInfo);


    // # try -----------------------------------------------------------
    try {
        img = await loadImg("./imgs/forCreate/basketball.png");
        
        // --- matter.js 요소 생성 ---
        const option = {
            isStatic: true,
            collisionFilter: {
                category: cate[0]
            },
            render: {
                strokeStyle: colors[0],
                fillStyle: "transparent",
                lineWidth: 2
            }
        };

        // =============== 농구대 A ===============
        const groundA = Bodies.rectangle(667, 665, 1334, 30, option);
        Composite.add(world, groundA);

        basketA.frame = [
            Bodies.rectangle(900, 400, 15, 500, option),
            Bodies.rectangle(857.5, 157.5, 100, 15, option),
            Bodies.rectangle(807.5, 157.5, 10, 200, option),
            Bodies.rectangle(792.5, 227.5, 20, 8, option)
        ];

        basketA.rim = [
            Bodies.rectangle(778.5, 227.5, 8, 8, option),
            Bodies.rectangle(698.5, 227.5, 8, 8, option)
        ];

        basketA.net = createNet(691.5, 225.5, 5, 6, 0, 0, false, 10, cate[0]);
        basketA.net.bodies.forEach((v, i) => {
            if (i < 5) {
                v.isStatic = true;
            }

            if (i % 5 !== 0 && (i + 1) % 5 !== 0) {
                v.isSensor = true;
            }
        });

        for (const key in basketA) {
            Composite.add(world, basketA[key]);
        }

        
        // =============== 농구대 B ===============
        option.collisionFilter.category = cate[1];
        option.render.strokeStyle = colors[1];

        const groundB = Bodies.rectangle(667, 815, 1334, 30, option);
        Composite.add(world, groundB);

        basketB.frame = [
            Bodies.rectangle(1200, 550, 15, 500, option),
            Bodies.rectangle(1157.5, 307.5, 100, 15, option),
            Bodies.rectangle(1107.5, 307.5, 10, 200, option),
            Bodies.rectangle(1092.5, 377.5, 20, 8, option)
        ];

        basketB.rim = [
            Bodies.rectangle(1078.5, 377.5, 8, 8, option),
            Bodies.rectangle(998.5, 377.5, 8, 8, option)
        ];

        basketB.net = createNet(991.5, 375.5, 5, 6, 0, 0, false, 10, cate[1]);
        basketB.net.bodies.forEach((v, i) => {
            if (i < 5) {
                v.isStatic = true;
            }

            if (i % 5 !== 0 && (i + 1) % 5 !== 0) {
                v.isSensor = true;
            }
        });

        for (const key in basketB) {
            Composite.add(world, basketB[key]);
        }

        // =============== 농구 공 ===============
        basketballs.push(
            Bodies.circle(200, 300, 30, {
                collisionFilter: {
                    mask: defaultCate | cate[0]
                },
                render: {
                    strokeStyle: colors[0],
                    fillStyle: "transparent",
                    lineWidth: 2
                },
                restitution: 0.9,
                friction: 0.01
            })
        );

        sling = Constraint.create({
            pointA: {x: 200, y: 300},
            bodyB: basketballs[basketballs.length - 1],
            length: 0.01,
            damping: 0.025,
            stiffness: 0.04
        });

        Composite.add(world, [
            basketballs[basketballs.length - 1],
            sling
        ]);


        // =============== 마우스 이벤트 ===============
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


        Events.on(mouseConstraint, "enddrag", endDragEvt);
        Events.on(engine, "afterUpdate", afterUpdateEvt);


        // --- create.js 요소 생성 ---
        // =============== 바닥 부분 그리기 ===============
        const mc_ground = new cjs.MovieClip();

        const groundColor = new cjs.Shape(
            new cjs.Graphics()
                .beginLinearGradientFill(
                    ["#2F9D27", "#53C14B", "#1D8B15"],
                    [0, 0.5, 1],
                    0, 0, 
                    0, 200
                ).dr(0, 0, 1334, 150)
        );
        mc_ground.addChild(groundColor);

        for (let i = 0; i < 6; i++) {
            const grass = new cjs.Shape(
                new cjs.Graphics()
                    .s("#0B7903")
                    .ss(3)
            );
        
            mc_ground.addChild(grass);

            const yy = i % 2 === 0 ? -30 : 30;
            
            grass.graphics.moveTo(120 + (i * 210), 100 + yy);
            grass.graphics.lineTo(130 + (i * 210), 80 + yy);
            grass.graphics.lineTo(135 + (i * 210), 100 + yy);
        
            grass.graphics.moveTo(135 + (i * 210), 90 + yy);
            grass.graphics.lineTo(145 + (i * 210), 70 + yy);
            grass.graphics.lineTo(150 + (i * 210), 90 + yy);
        }

        mc_ground.y = 650;
        mcRoot.addChild(mc_ground);

        // =============== 농구대 A ===============
        basketA.frame.forEach(v => drawBasketFrame(v, 0));
        drawBasketRim(88, 10, {x: basketA.rim[1].position.x + 40, y: basketA.rim[0].position.y});
        const cjs_netA = null;
        
        // =============== 농구대 B ===============
        basketB.frame.forEach(v => drawBasketFrame(v, 1));
        drawBasketRim(88, 10, {x: basketB.rim[1].position.x + 40, y: basketB.rim[0].position.y});
        const cjs_netB = null;

        // =============== 농구 공 ===============
        cjs_basketBalls.push(
            new cjs.Bitmap(img)
        );

        const size = cjs_basketBalls[cjs_basketBalls.length - 1].getBounds();

        cjs_basketBalls[cjs_basketBalls.length - 1].regX = size.width / 2;
        cjs_basketBalls[cjs_basketBalls.length - 1].regY = size.height / 2;
        cjs_basketBalls[cjs_basketBalls.length - 1].x = basketballs[basketballs.length - 1].position.x
        cjs_basketBalls[cjs_basketBalls.length - 1].y = basketballs[basketballs.length - 1].position.y

        mc_ball_container.addChild(cjs_basketBalls[cjs_basketBalls.length - 1]);


        // -------------------- frameUpdate --------------------
        (function frameUpdate() {
            mc_net_container.removeAllChildren();
            line_canvas.removeAllChildren();

            drawNet(basketA.net, cjs_netA);
            drawNet(basketB.net, cjs_netB);

            cjs_basketBalls.forEach((v, i) => {
                v.x = basketballs[i].position.x;
                v.y = basketballs[i].position.y;
                v.rotation = basketballs[i].angle * (180 / Math.PI);
            });

            line = new cjs.Shape(new cjs.Graphics().s("#F6F6F6").ss(3));
            line.graphics.moveTo(sling.pointA.x, sling.pointA.y);
            line.graphics.lineTo(sling.bodyB.position.x, sling.bodyB.position.y);
            line_canvas.addChild(line);

            if (flag) stage.update();
            window.requestAnimationFrame(frameUpdate);
        })();


    // # catch -----------------------------------------------------------
    } catch (error) {
        console.log("Error : " + error);
        alert("Error");
    }


    /**
     * EndDrag에 대한 이벤트
     * @param {object} e 
     */
    function endDragEvt(e) {
        if (
            e.body === sling.bodyB &&
            (e.mouse.position.x < 170 && e.mouse.position.y > 330)
        ) firing = true;
    }


    /**
     * afterUpdate에 대한 이벤트
     */
    function afterUpdateEvt() {
        if (
            firing &&
            (sling.bodyB.position.x > 220 && sling.bodyB.position.y < 280)
        ) {
            // 속도 제한
            if (Body.getSpeed(sling.bodyB) > 35) Body.setSpeed(sling.bodyB, 35);

            const ranNum = Math.floor(Math.random() * 2);

            basketballs.push(
                Bodies.circle(200, 300, 30, {
                    collisionFilter: {
                        mask: defaultCate | cate[ranNum]
                    },
                    render: {
                        strokeStyle: colors[ranNum],
                        fillStyle: "transparent",
                        lineWidth: 2
                    },
                    restitution: 0.9,
                    friction: 0.01
                })
            );

            cjs_basketBalls.push(new cjs.Bitmap(img));
            const size = cjs_basketBalls[cjs_basketBalls.length - 1].getBounds();

            cjs_basketBalls[cjs_basketBalls.length - 1].regX = size.width / 2;
            cjs_basketBalls[cjs_basketBalls.length - 1].regY = size.height / 2;
            cjs_basketBalls[cjs_basketBalls.length - 1].x = basketballs[basketballs.length - 1].position.x
            cjs_basketBalls[cjs_basketBalls.length - 1].y = basketballs[basketballs.length - 1].position.y
    
            const lastBall = sling.bodyB;

            // setTimeout(() => {
            //     Matter.Sleeping.set(lastBall, true);
            // }, 10000);

            lastBall.collisionFilter.mask = cate[lastIdx];
            lastBall.collisionFilter.category = cate[lastIdx];

            Composite.add(world, basketballs[basketballs.length - 1]);
            sling.bodyB = basketballs[basketballs.length - 1];
            mc_ball_container.addChild(cjs_basketBalls[cjs_basketBalls.length - 1]);

            if (ranNum > 0) {
                showInfo.x = 200;
            } else {
                showInfo.x = 100;
            }

            lastIdx = ranNum;
            firing = false;
        }
    }



    /**
     * 그물 그리기 (create.js)
     * @param {object} mNet 
     * @param {} cNet 
     */
    function drawNet(mNet, cNet) {
        cNet = new cjs.Shape(
            new cjs.Graphics()
                .s("#F6F6F6")
                .ss(2)
        );

        mNet.bodies.forEach((el, i) => {
            if (i < 5) {
                cNet.graphics.moveTo(el.position.x, el.position.y);

                for (let j = i + 5; j < mNet.bodies.length; j += 5) {
                    cNet.graphics.lineTo(
                        mNet.bodies[j].position.x,
                        mNet.bodies[j].position.y
                    );
                }
            }

            if (i % 5 === 0 && i < mNet.bodies.length - 5) {
                cNet.graphics.moveTo(el.position.x, el.position.y);
                
                for (let j = i + 1; j < i + 5; j++) {
                    cNet.graphics.lineTo(
                        mNet.bodies[j].position.x,
                        mNet.bodies[j].position.y
                    );
                }
            }
        });

        mc_net_container.addChild(cNet);
    }



    /**
     * 농구 골대 그리기 (create.js)
     * @param {object} v 
     * @param {number} colorIdx 
     */
    function drawBasketFrame(v, colorIdx) {
        const w = Math.abs(v.vertices[0].x - v.vertices[1].x);
        const h = Math.abs(v.vertices[0].y - v.vertices[2].y);

        const rect = new cjs.Shape(
            new cjs.Graphics()
                .f(colors[colorIdx])
                .s("#353535")
                .dr(0, 0, w, h)
        );
        rect.regX = w / 2;
        rect.regY = h / 2;
        rect.x = v.position.x;
        rect.y = v.position.y;
        mcRoot.addChild(rect);
    }


    /**
     * 농구 림 그리기 (create.js)
     * @param {number} w 
     * @param {number} h 
     * @param {object} pos x, y
     */
    function drawBasketRim(w, h, pos) {
        const rim = new cjs.Shape(
            new cjs.Graphics()
                .f("#FF5E00")
                .s("black")
                .dr(0, 0, w, h)
        );
        rim.regX = w / 2;
        rim.regY = h / 2;
        rim.x = pos.x;
        rim.y = pos.y;

        mc_rim_container.addChild(rim);
    }



    /**
     * 농구 그물 모양 객체 만들기
     * @param {number} xx 
     * @param {number} yy 
     * @param {number} column 
     * @param {number} row 
     * @param {number} cGap 
     * @param {number} rGap 
     * @param {number} crossBrace 
     * @param {number} radius 
     * @param {number} category 
     * @param {} options 
     * @param {} constraintOptions 
     * @returns new net
     */
    function createNet(xx, yy, column, row, cGap, rGap, crossBrace, radius, category, options, constraintOptions) {
        const group = Body.nextGroup(true);

        options = Common.extend({
            inertia: Infinity,
            friction: 0.00001,
            collisionFilter: {
                group: group,
                category: category
            },
            render: {visible: false}
        }, options);

        constraintOptions = Common.extend({
            stiffness: 0.1,
            render: {type: "line", anchors: false}
        }, constraintOptions);

        const net = Composites.stack(xx, yy, column, row, cGap, rGap, function(x, y, column, row) {
            const r = row > 0 ? radius - (row + 1) : radius;
            let xxx = x;

            if (row > 0) xxx += (row + 1);

            return Bodies.circle(xxx, y, r, options);
        });

        Composites.mesh(net, column, row, crossBrace, constraintOptions);
        return net;
    }



    /**
     * 이미지 로드 함수
     * @param {string} src 
     * @returns new Image
     */
    function loadImg(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = reject;
        });
    }
})();