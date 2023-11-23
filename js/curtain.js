// ***** Curtain *****
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




    // matter.js 요소 생성
    const curtains = [
        createCurtain(285, 70, 10, 15, 5, 5, false, 17),
        createCurtain(665, 70, 10, 15, 5, 5, false, 17)
    ];

    for (let i = 0; i < 20; i++) {
        curtains[0].bodies[i].isStatic = true;
        curtains[1].bodies[i].isStatic = true;
    }

    Composite.add(world, curtains);




    // create.js 정적 요소 생성 (matter.js에서 생성한 정적 요소)
    const img = new Image();
    img.src = "./imgs/forCreate/window.png";

    const cjs_window = new cjs.Bitmap(img);
    cjs_window.x = 1334 / 2;
    cjs_window.y = 800 / 2;
    cjs_window.regX = 600 / 2;
    cjs_window.regY = 600 / 2;
    mcRoot.addChild(cjs_window);

    for (let i = 1; i < 5; i++) {
        const wallPaper = new cjs.Shape(new cjs.Graphics().f("#EDAF8C"));

        if (i % 2 !== 0) {
            wallPaper.graphics.dr(0, 0, 1334, (800 - 600) / 2);
            if (i > 2) wallPaper.y = (800 - 600) / 2 + 600;
        } else {
            wallPaper.graphics.dr(0, 0, (1334 - 600) / 2, 800);
            if (i > 2) wallPaper.x = (1334 - 600) / 2 + 600;
        }

        mcRoot.addChild(wallPaper);
    }
    

    // create.js 동적 요소 생성 (matter.js에서 생성한 동적 요소)
    const line_canvas = new cjs.MovieClip();
    stage.addChild(line_canvas);
    const cjs_curtains = [null, null];


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




    // --- frameUpdate ---
    (function frameUpdate() {
        line_canvas.removeAllChildren();

        // 여기부터 (커튼 그리기)
        for (let i = 0; i < cjs_curtains.length; i++) {
            cjs_curtains[i] = new cjs.Shape(
                new cjs.Graphics()
                    .s("#269BAF")
                    .f("rgba(92, 209, 229, 0.7)")
            );

            const cc = cjs_curtains[i];
            const mc = curtains[i];

            // --- 커튼 그리기 ---
            for (let j = 0; j < 19; j++) {
                const nowEl = mc.bodies[j];

                // 커튼 고정 부분 그리기 =====
                if (j === 0) {
                    cc.graphics.moveTo(nowEl.position.x, nowEl.position.y);
                    
                    for (let t = j + 1; true;) {
                        cc.graphics.lineTo(
                            mc.bodies[t].position.x,
                            mc.bodies[t].position.y
                        );

                        if (t === 9) {
                            t += 10;
                            cc.graphics.lineTo(
                                mc.bodies[t].position.x,
                                mc.bodies[t].position.y
                            );
                        } else if (t === 10) {
                            cc.graphics.lineTo(
                                nowEl.position.x,
                                nowEl.position.y
                            );
                            break;
                        }

                        if (t < 10) t++;
                        else t--;
                    }

                // 커튼 부분 그리기 =====
                } else if (j >= 10) {
                    cc.graphics.moveTo(nowEl.position.x, nowEl.position.y);

                    cc.graphics.lineTo(
                        mc.bodies[j + 1].position.x,
                        mc.bodies[j + 1].position.y
                    );

                    for (let t = j + 11, flag = true; true;) {
                        if (t < 10) break;

                        cc.graphics.lineTo(
                            mc.bodies[t].position.x,
                            mc.bodies[t].position.y
                        );

                        if (t >= mc.bodies.length - 10) {
                            const xx = mc.bodies[t].position.x - 
                                (mc.bodies[t].position.x - mc.bodies[t - 1].position.x) / 2;
                                
                            const yy = mc.bodies[t].position.y - 20;

                            cc.graphics.lineTo(
                                xx,
                                yy
                            );

                            cc.graphics.lineTo(
                                mc.bodies[t - 1].position.x,
                                mc.bodies[t - 1].position.y
                            );

                            flag = !flag;
                            t = t - 1;
                        }

                        if (flag) t += 10;
                        else t -= 10;
                    }

                    // cc.graphics.lineTo(
                    //     mc.bodies[j + 10].position.x,
                    //     mc.bodies[j + 10].position.y
                    // );

                    // cc.graphics.lineTo(
                    //     mc.bodies[j + 10].position.x,
                    //     mc.bodies[j + 10].position.y
                    // );

                    // if (j === 10) {
                    //     cc.graphics.lineTo(
                    //         nowEl.position.x,
                    //         nowEl.position.y
                    //     );
                    // }
                }
            }

            line_canvas.addChild(cc);
        }


        if (flag) stage.update();
        window.requestAnimationFrame(frameUpdate);
    })();



   
    /**
     * 커튼 모양 객체를 만들기 위한 함수
     * @param {number} xx 
     * @param {number} yy 
     * @param {number} column 
     * @param {number} row 
     * @param {number} cGap 
     * @param {number} rGap 
     * @param {boolean} crossBrace 
     * @param {number} radius 
     * @param {} options 
     * @param {} constraintOptions 
     * @returns new curtain
     */
    // --- create curtain ---
    function createCurtain(xx, yy, column, row, cGap, rGap, crossBrace, radius, options, constraintOptions) {
        const group = Body.nextGroup(true);

        options = Common.extend({
            inertia: Infinity,
            friction: 0.00001,
            collisionFilter: {group: group},
            render: {visible: false}
        }, options);

        constraintOptions = Common.extend({
            stiffness: 0.1,
            render: {type: "line", anchors: false}
        }, constraintOptions);

        const curtain = Composites.stack(xx, yy, column, row, cGap, rGap, function(x, y) {
            return Bodies.circle(x, y, radius, options);
        });

        Composites.mesh(curtain, column, row, crossBrace, constraintOptions);
        return curtain;
    }
})();