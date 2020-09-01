//引入pixi引擎 
import * as PIXI from "@tbminiapp/pixi-miniprogram-engine";

require('/lib/dragonBones.js');
const { dragonBones } = $global;

const skeJSON = require('/assets/mecha_1004d/mecha_1004d_ske.json')
const texJSON = require('/assets/mecha_1004d/mecha_1004d_tex.json')
// const texJSON2 = require('/assets/effect/effect_sd_tex.json')

// const skeJSON = require('/assets/resource/shizuku/shizuku_ske.json');


class BaseDemo extends PIXI.Container {
    static BACKGROUND_URL = "/assets/background.png";
    _renderer = null;
    _background = new PIXI.Sprite(PIXI.Texture.EMPTY);
    _resources = [];
    _pixiResources;
    _app = null;

    constructor(app) {
        super(app);
        this._app = app;
        this._renderer = app.renderer;

        this._renderer.backgroundColor = 0x666666;
        this._resources.push(BaseDemo.BACKGROUND_URL);
        // document.body.appendChild(this._renderer.view);
        //

        setTimeout(() => {
            this.x = this.stageWidth * 0.5;
            this.y = this.stageHeight * 0.5;
            this._loadResources();
        }, 10);
    }

    //  _onStart();

    _renderHandler(deltaTime) {
        this._renderer.render(this);
    }

    _startRenderTick() {
        PIXI.ticker.shared.add(this._renderHandler, this);
    }

    _loadResources() {
        const binaryOptions = {
            loadType: PIXI.loaders.Resource.LOAD_TYPE.XHR,
            xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER
        };

        for (const resource of this._resources) {
            if (resource.indexOf("dbbin") > 0) {
                PIXI.loader.add(resource, resource, binaryOptions);
            }
            else {
                PIXI.loader.add(resource, resource);
            }
        }
        console.log(this._resources)

        PIXI.loader.once("complete", (loader, resources) => {
            this._pixiResources = resources;
            console.log(resources)
            //
            this._background.texture = this._pixiResources[BaseDemo.BACKGROUND_URL].texture;
            this._background.x = -this._background.texture.width * 0.5;
            this._background.y = -this._background.texture.height * 0.5;
            this.addChild(this._background);
            this._app.stage.addChild(this) 
            //
            this._onStart();
            this._startRenderTick(); // Make sure render after dragonBones update.
        });
        PIXI.loader.onError.add((e) => { console.log(e) });
        PIXI.loader.load();
    }

    createText(string) {
        const text = new PIXI.Text(string, { align: "center" });
        text.text = string;
        text.scale.x = 0.7;
        text.scale.y = 0.7;
        text.x = - text.width * 0.5;
        text.y = this.stageHeight * 0.5 - 100.0;
        this.addChild(text);

        return text;
    }

    get stageWidth() {
        return this._renderer.width;
    }

    get stageHeight() {
        return this._renderer.height;
    }
}

class DragonBonesEvent extends BaseDemo {
    _armatureDisplay;

    constructor(app) {
        super(app);

        this._resources.push(
            // "https://testmodel1.oss-cn-hangzhou.aliyuncs.com/mecha_1004d_ske.json",
            // "https://testmodel1.oss-cn-hangzhou.aliyuncs.com/mecha_1004d_tex.json",
            "https://testmodel1.oss-cn-hangzhou.aliyuncs.com/mecha_1004d_tex.png"
        );
    }

    _onStart() {
        const factory = dragonBones.PixiFactory.factory;
        factory.parseDragonBonesData(
            skeJSON
            // this._pixiResources["https://testmodel1.oss-cn-hangzhou.aliyuncs.com/mecha_1004d_ske.json"].data
        );
        factory.parseTextureAtlasData(
            texJSON,
            // this._pixiResources["https://testmodel1.oss-cn-hangzhou.aliyuncs.com/mecha_1004d_tex.json"].data, 
            this._pixiResources["https://testmodel1.oss-cn-hangzhou.aliyuncs.com/mecha_1004d_tex.png"].texture);
        factory.soundEventManager.on(dragonBones.EventObject.SOUND_EVENT, this._soundEventHandler, this);

        this._armatureDisplay = factory.buildArmatureDisplay("mecha_1004d");
        this._armatureDisplay.on(dragonBones.EventObject.COMPLETE, this._animationEventHandler, this);
        this._armatureDisplay.animation.play("walk");

        this._armatureDisplay.x = 0.0;
        this._armatureDisplay.y = 100.0;
        this.addChild(this._armatureDisplay);
        //
        this.interactive = true;
        const touchHandler = () => {
            console.log('232323')
            this._armatureDisplay.animation.fadeIn("skill_03", 0.2);
        };
        this.addListener("mousedown", touchHandler, this);
        this.addListener("touchstart", touchHandler, this);
        //
        this.createText("Touch to play animation.");
    }

    _soundEventHandler(event) {
        console.log(event.name);
    }

    _animationEventHandler(event) {
        if (event.animationState.name === "skill_03") {
            this._armatureDisplay.animation.fadeIn("walk", 0.2);
        }
    }
}

// registerCanvas 注册canvas给PIXI 
const { registerCanvas, devicePixelRatio } = PIXI.miniprogram;
Page({
    // 供pixi渲染的canvas
    pixiCanvas: null,
    // canvas的onReady事件侦听函数 onCanvasReady
    onCanvasReady() {
        // 建立canvas引用
        my._createCanvas({
            id: "canvas",
            success: (canvas) => {
                const systemInfo = my.getSystemInfoSync();
                // 拿到当前设备像素密度
                const dpr = systemInfo.pixelRatio;
                // 拿到当前设备的宽高
                const windowWidth = systemInfo.windowWidth;
                const windowHeight = systemInfo.windowHeight;
                // 为canvas设定宽高（需要设备宽高* 像素密度）;
                canvas.width = windowWidth*dpr;
                canvas.height = windowHeight*dpr;

                this.pixiCanvas = canvas;
                //为pixi引擎注册当前的canvas  
                registerCanvas(canvas);
                //初始化PIXI.Application  
                //计算application的宽高  
                const size = {
                    width: canvas.width ,
                    height: canvas.height ,
                };
                // const context = canvas.getContext('2d');

                // canvas.getContext('webgl')  
                const app = new PIXI.Application({
                    width: size.width,
                    height: size.height,
                    view: canvas,
                    // context: context,
                    // antialias: true,
                    transparent: true,
                    // 强制使用2d上下文进行渲染，如果为flase,则默认使用webgl渲染  
                    forceCanvas: true,
                    // 设置resolution 为像素密度  
                    // resolution: devicePixelRatio,
                });
                console.log(devicePixelRatio, dpr)

                new DragonBonesEvent(app);

            },
        });
    },
    // 监听小程序canvas的touch事件，并触发pixi内部事件  
    onTouchHandle(event) {

        if (this.pixiCanvas && event.changedTouches && event.changedTouches.length) {

            this.pixiCanvas.dispatchEvent(event);
        }
    }
}); 