/// <reference path="babylon.max.js" />

var canvas;
var engine; // varibale or obj that deal with the low level webgl
var scene; // render something on your screen
var isWPressed = false;
var isSPressed = false;
var isAPressed = false;
var isDPressed = false;
document.addEventListener("DOMContentLoaded", startGame);

class Dude {
    constructor(dudeMesh,speed) {
        this.dudeMesh=  dudeMesh;
        dudeMesh.Dude = this;
        if(speed) {
            this.speed = speed;
        }
        else {
            this.speed = 1;
        }
    }

    move() {
        var tank = scene.getMeshByName("heroTank");
        var direction = tank.position.subtract(this.dudeMesh.position);
        var distance = direction.length();
        var dir = direction.normalize();
        var alpha = Math.atan2(-1*dir.x, -1*dir.z);
        this.dudeMesh.rotation.y = alpha;
        if(distance>30) {
            this.dudeMesh.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed)); // if distance between dude and tank is greater 30, move the dude towards the tank
        }
}
}

function startGame() {
    canvas = document.getElementById("renderCanvas");
    canvas.style.widths = "1800px";
    canvas.style.height = "1200px";
    engine = new BABYLON.Engine(canvas, true); //draw on this specific canvas
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    scene = createScene(); // creating a scene that is happening in window
    modifySettings();
    var tank = scene.getMeshByName("heroTank");
    
    var toRender = function(){
        tank.move();
        var heroDude = scene.getMeshByName("heroDude");
        if(heroDude) {
            heroDude.Dude.move();
        }
        if(scene.dudes) {
            for(var q=0; q<scene.dudes.length; q++) {
                scene.dudes[q].Dude.move();
            }
        }
        scene.render();
    }
    
    engine.runRenderLoop(toRender);
}

var createScene = function(){
    var scene = new BABYLON.Scene(engine);
    var ground = createGround(scene);
    var freeCamera = createFreeCamera(scene);
    var tank = createTank(scene);
    var followCamera = createFollowCamera(scene, tank);
    scene.activeCamera = followCamera; // camera is followcamera now
    createLights(scene);
    createHeroDude(scene);

    return scene;

};

function createGround(scene) {
    var ground = new BABYLON.Mesh.CreateGroundFromHeightMap("ground", "../images/hmap1.png", 2000, 2000, 20, 0, 1000, scene, false, onGroundCreated); // parameters(name, url, width, height, subdivisions per side(prportional to triangles), minheight, maxheight, scene, dynamic heightmap, afterloading of height map funcition)
    function onGroundCreated() {
        var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("../images/grass.jpg", scene);
        ground.material = groundMaterial;
        // making obj groundMaterial(a standard material) and adding in the texture and putting it in ground.texture obj
        ground.checkCollisions = true;
    }

    return ground;
}

function createLights(scene) {
    var light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-.1, -1, 0), scene); // adding directional ligth(uniform across every direction)

}

function createFreeCamera(scene) {
    var camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0,0,0), scene); //parameters=> name, camera position vector, scene
    camera.attachControl(canvas); // so that we can move camera
    camera.position.y = 50;
    camera.checkCollisions = true; // any object can now cant penetrate this camera object
    camera.applyGravity = true; // apply gravity until collision occurs
    camera.keysUp.push('w'.charCodeAt(0));
    camera.keysUp.push('W'.charCodeAt(0));
    camera.keysDown.push('s'.charCodeAt(0));
    camera.keysDown.push('S'.charCodeAt(0));
    camera.keysRight.push('d'.charCodeAt(0));
    camera.keysRight.push('D'.charCodeAt(0));
    camera.keysLeft.push('a'.charCodeAt(0));
    camera.keysLeft.push('A'.charCodeAt(0));

}

function createFollowCamera(scene, target) {
    var camera = new BABYLON.FollowCamera("tankFollowCamera", target.position, scene, target);
    camera.radius = 20; // how far from the object to follow
    camera.heightOffset = 4; // how height above the object to place the camera
    camera.rotationOffset = 180; // the viewing angle
    camera.cameraAcceleration = 0.5; // how fast to move
    camera.maxCameraSpeed = 50; // speed limit
    return camera;
}

function modifySettings() {
    scene.onPointerDown = function() {
        if(!scene.alreadyLocked) {
            console.log("requesting pointer lock")
            canvas.requestPointerLock(); // lock the cursor onto screen
        }
        else {
            console.log("we are already locked");
        }
    }

    document.addEventListener("pointerlockchange", pointerLockListener);

    function pointerLockListener() { // only for chrome
        var element = document.pointerLockElement || null;
        if(element) {
            scene.alreadyLocked = true;
        }

        else {
            scene.alreadyLocked = false;
        }
    }
}

document.addEventListener("keydown", function(event) {
    if(event.key=='w' || event.key=='W') {
        isWPressed=true;
    }

    if(event.key=='s' || event.key=='S') {
        isSPressed=true;
    }

    if(event.key=='a' || event.key=='A') {
        isAPressed=true;
    }

    if(event.key=='d' || event.key=='D') {
        isDPressed=true;
    }
});

document.addEventListener("keyup", function(event) {
    if(event.key=='w' || event.key=='W') {
        isWPressed=false;
    }

    if(event.key=='s' || event.key=='S') {
        isSPressed=false;
    }

    if(event.key=='a' || event.key=='A') {
        isAPressed=false;
    }

    if(event.key=='d' || event.key=='D') {
        isDPressed=false;
    }
});

function createTank(scene) {
    var tank = new BABYLON.MeshBuilder.CreateBox("heroTank", {height: 1, depth: 6, width: 6}, scene); // create a tank
    var tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
    tankMaterial.diffuseColor = new BABYLON.Color3.Red;
    tankMaterial.emissiveColor = new BABYLON.Color3.Blue;
    tank.material = tankMaterial; // giving material and color
    tank.position.y += 2;
    tank.speed = 1;
    tank.frontVector = new BABYLON.Vector3(0, 0, 1);
    tank.move = function() {
        var yMovement = 0;
        // console.log(tank.position.y);
        if(tank.position.y >2) {
            yMovement = -2;
        } // so that tank will not rise up the gorund along the wall when colloision occurs
        // tank.moveWithCollisions(new BABYLON.Vector3(0,yMovement,1));// parameters=> velocities in x y z direction

        if(isWPressed) {
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(tank.speed, tank.speed, tank.speed));
        }

        if(isSPressed) {
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(-1*tank.speed, -1*tank.speed, -1*tank.speed));
        }

        if(isAPressed) {
            tank.rotation.y -= .1;
            tank.frontVector=new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y));
        }

        if(isDPressed) {
            tank.rotation.y += .1;
            tank.frontVector=new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y));

        }
    }
    return tank;
}

function createHeroDude(scene) {
    BABYLON.SceneLoader.ImportMesh("him", "../models/Dude/", "Dude.babylon", scene, onDudeImported); // importing the mesh parameters=> mesh name, location, name of file, scene, onSuccess function

    function onDudeImported (newMeshes, particleSystems, skeletons) {

        newMeshes[0].position = new BABYLON.Vector3(0, 0, 5);  // The original dude
        newMeshes[0].name = "heroDude"; // changing the name of dude
        var heroDude = newMeshes[0];
        heroDude.scaling = new BABYLON.Vector3(.2,.2,.2);
        heroDude.speed = 2;
        scene.beginAnimation(skeletons[0], 0, 120, true, 1.0); // animation of walking ==parameters=> skeleton part ou want to render animation, starting of keyframe, ending of keyframes, loopback, playbackspeed
        
        var hero = new Dude(heroDude,2);

        scene.dudes = [];
        for(var q=0; q<10; q++) {
            scene.dudes[q] = DoClone(heroDude, skeletons, q);
            scene.beginAnimation(scene.dudes[q].skeleton, 0, 120, true, 1.0); // animating the dudes
            var temp = new Dude(scene.dudes[q], 2);
        }
        }
    }

function DoClone(original, skeletons, id) { // making dude clones
    var myClone;
    var xrand = Math.floor(Math.random()*501 - 250);
    var zrand = Math.floor(Math.random()*501 - 250);

    myClone = original.clone("clone_"+id);
    myClone.position = new BABYLON.Vector3(xrand, 0, zrand);

    if(!skeletons) {
        return myClone;
    } else {
        if(!original.getChildren()) {
            myClone.skeleton = skeleton[0].clone("clone_"+id+"_skeleton");
            return myClone;
        } else {
            if(skeletons.length==1){ // only one skeleton controlling all dudes/children
                var clonedSkeleton = skeletons[0].clone("clone_"+id+"_skeleton");
                myClone.skeleton = clonedSkeleton;
                var numChildren = myClone.getChildren().length;
                for(var i=0; i<numChildren;i++) {
                    myClone.getChildren()[i].skeleton = clonedSkeleton;
                }
                return myClone;
            } else if(skeleton.length==original.getChildren().length) { // all children has its own skeleton
                for(var i=0; i<myClone.getChildren().length; i++){
                    myClone.getChildren()[i].skeleton = skeletons[i].clone("clone_"+id+"_skeleton_"+i);
                    return myClone;
                }
            }
        }
    }

    return myClone;
}


window.addEventListener("resize", function () {
    canvas.style.width = "1800px";
    canvas.style.height = "1200px";
    engine.resize();
    canvas.style.width = '100%';
    canvas.style.height = '100%';
});
