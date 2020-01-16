//capture critical dom elements
var domContainer = document.getElementById('container');
var domWebGL = document.getElementById('webgl');
var guideDom = document.getElementById('guide');


//declarations
var tick = 0,
    clock = new THREE.Clock(),
    particleSystemOptions, spawnerOptions, particleSystem;

var sceneWebGL, sceneCss ;
var rendererWebGL, rendererCss ;
var camera;
var controls;

var totalProjects = 0;
var currentProjectIndex = 0;
var projectsArray = [];

var projectArrayItem = function (project, id) {
    this.project = project,
    this.id = id
}

//set colors
var fogColor = new THREE.Color(0x232323);
var backgroundColor = new THREE.Color(0x232323);
var mainColor = new THREE.Color(0xffaa00);
var highlightColor = new THREE.Color(0x19ff90);
var contrastColor = new THREE.Color(0x9114cc);

//create scenes
sceneWebGL = new THREE.Scene();
sceneWebGL.background = backgroundColor;
sceneWebGL.fog = new THREE.FogExp2( fogColor, 0.00025 );
    
sceneCss = new THREE.Scene();

//create lights
var ambient = new THREE.AmbientLight( 0xffffff );
sceneWebGL.add( ambient );

//create WebGL renderer
rendererWebGL = new THREE.WebGLRenderer({ alpha: true, antialias: true });
rendererWebGL.setClearColor( 0x000000, 0 );
rendererWebGL.setPixelRatio( window.devicePixelRatio );
rendererWebGL.setSize( window.innerWidth, window.innerHeight );

//create CSS renderer
rendererCss = new THREE.CSS3DRenderer();
rendererCss.setSize( window.innerWidth, window.innerHeight );

//append renderers to respective dom elements
domWebGL.appendChild( rendererWebGL.domElement );
domContainer.appendChild( rendererCss.domElement );

//create camera 
camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );    

//add listeners
window.addEventListener( 'resize', onWindowResize, false );

//INIT WORLDS
initWorldProjects();
initWorldCubes();
initParticles();

//INIT POSITIONS
camera.position.y = projectsArray[totalProjects-1].project.position.y;
camera.position.z = 500;

particleSystemOptions.position.x = 0;
particleSystemOptions.position.y = 0;
particleSystemOptions.position.z = 0;

//START!
animate();

//play intro
moveCameraToProject(currentProjectIndex, 5000);

//GIVE USER CONTROL

//Hammerjs gesture control
//for Mobile OS
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    var mc = new Hammer.Manager(domContainer);

    mc.add(new Hammer.Pan({direction:Hammer.DIRECTION_HORIZONTAL, threshold:80, pointers: 0}));

    mc.on("panend", function(ev) {
        
        if ( ev.direction == Hammer.DIRECTION_RIGHT ) 
            nextProject();
        else if ( ev.direction == Hammer.DIRECTION_LEFT ) 
            previousProject();

    });
} else {
    document.addEventListener('click', nextProject);
}



/**********************
 * PROJECTS
 **********************/
function initWorldProjects () 
{
    //get project divs from html doc
    var projects = document.getElementsByClassName("project");
    totalProjects = projects.length;

    //convert every project to 3d and scatter it in the world
    for (i = 0; i < totalProjects; i++) {
        
        var projectId = projects[i].id;
        var project = new THREE.CSS3DObject(projects[i]);
        
        project.position.x = randomer(-1000,1000);
        project.position.y = (i * 1200) + (Math.random() * 500);
        project.position.z = randomer(-1000,1000); 
        project.rotation.z = randomerAngle();
        project.rotation.y = randomerAngle();
        
        //add project obj the scene
        sceneCss.add( project );

        //also add projects to the global array
        projectsArray.push( new projectArrayItem(project, projectId)  );
    }
}

function moveCameraToProject (projectIndex, duration)
{
    duration = duration || 2000;

    var source = projectsArray[projectIndex].project;

    var target = projectsArray[projectIndex].project;
   
    var direction = new THREE.Vector3();
    target.getWorldDirection( direction );
    
    //awesome magic happens here! 
    //create new camera an ZAP! put it in front of the target , 
    //WITH the same rotation
    var cameraTemp = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    cameraTemp.position.copy( target.position ).add( direction.multiplyScalar( 10000 ) );
    cameraTemp.quaternion.copy( target.quaternion );

    var cameraTemp2 = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    cameraTemp2.position.copy( target.position ).add( direction.multiplyScalar( 0.1 ) );
    cameraTemp2.quaternion.copy( target.quaternion );
    //tween animate the camera position to the target
    var tweenZoomIn =  new TWEEN.Tween( camera.position )
        .to( { x: cameraTemp2.position.x , y: cameraTemp2.position.y, z: cameraTemp2.position.z }, randomer(duration, duration*2) )
        .easing( TWEEN.Easing.Exponential.Out )
    
        new TWEEN.Tween( camera.position )
        .to( { x: cameraTemp.position.x , y: cameraTemp.position.y, z: cameraTemp.position.z }, randomer(duration, duration*2) )
        .easing( TWEEN.Easing.Exponential.In )
        .start()
        .onComplete( function() {
            tweenZoomIn.start();
        });
    
    new TWEEN.Tween( camera.rotation )
        .to( { x: cameraTemp.rotation.x , y: cameraTemp.rotation.y, z: cameraTemp.rotation.z }, randomer(duration*2, duration*4) )
        .easing( TWEEN.Easing.Exponential.InOut )
        .start();
    
    //also tween move the particles system
    new TWEEN.Tween( particleSystemOptions.position )
        .to( { x: target.position.x , y: target.position.y, z: target.position.z }, randomer(duration*2, duration*4) )
        .easing( TWEEN.Easing.Exponential.InOut )
        .start();

    cameraTemp = null;
}

function nextProject () {
    currentProjectIndex ++;
    if (currentProjectIndex >= totalProjects)
        currentProjectIndex = 0;
    moveCameraToProject(currentProjectIndex);
}

function previousProject () {
    currentProjectIndex --;
    if (currentProjectIndex < 0)
        currentProjectIndex = totalProjects-1;
    moveCameraToProject(currentProjectIndex);
    
}
function getPreviousProjectIndex () {
    if (currentProjectIndex - 1  < 0)
        return totalProjects-1;
    if (currentProjectIndex - 1  >= totalProjects)
        return 0;        
}
/**********************
 * 3D WORLD: PARTICLES
 **********************/

function initParticles() 
{
    particleSystem = new THREE.GPUParticleSystem( {
        maxParticles: 250000
    } );


    sceneWebGL.add (particleSystem);

    // options passed during each spawned
    particleSystemOptions = {
        position: new THREE.Vector3(),
        positionRandomness: 300,
        velocity: new THREE.Vector3(),
        velocityRandomness: 300,
        color: contrastColor,
        colorRandomness: .5,
        turbulence: .3,
        lifetime: 5,
        size: 10,
        sizeRandomness: 100
    };
    spawnerOptions = {
        spawnRate: 200000,
        horizontalSpeed: 400,
        verticalSpeed: 1500,
        timeScale: .9
    };
   
 
}

/**********************
 * 3D WORLD: CUBES
 **********************/
function initWorldCubes ()
{
    for (i=0; i<600; i++)
    {
        var r = randomer(20,500);
        var cube = new THREE.Mesh( 
            new THREE.CubeGeometry( r, r, r ), 
            new THREE.MeshBasicMaterial( 
                { 
                    opacity : .9, 
                    color: mainColor, 
                    transparent: true, 
                    blending: THREE.NormalBlending
                } 
            ) 
        );
        //materials[randomer(0,materials.length-1)] );
        cube.position.x = randomer(-5000, 5000);
        cube.position.y = randomer(-10000, 50000);
        cube.position.z = randomer(-5000, 5000);
        cube.rotation.x = randomerAngle();
        cube.rotation.y = randomerAngle();
        cube.rotation.z = randomerAngle();
        
        setCubeRotationAnimation (cube);
        setCubePositionAnimation (cube);

        sceneWebGL.add(cube);
    }
}

function setCubeRotationAnimation (cube)
{
    new TWEEN.Tween (cube.rotation)
        .to ( {x: randomerAngle(), y: randomerAngle(), z: randomerAngle() }, randomer(1000,15000) )
        .onComplete( function() {setCubeRotationAnimation (cube);})
        .start();
}

function setCubePositionAnimation (cube)
{
    new TWEEN.Tween (cube.position)
        .to ( {
            x: randomer(cube.position.x-1000,cube.position.x+1000),
            y: randomer(cube.position.y-1000,cube.position.y+1000), 
            z: randomer(cube.position.z-1000,cube.position.z+1000) 
        }, randomer(1000,15000) )
        .onComplete( function() {setCubePositionAnimation (cube);})
        .start();
}

/**********************
 * CORE 
 **********************/
function animate() {

    requestAnimationFrame( animate );

    TWEEN.update();
    
    if (controls) controls.update();
    
    animateParticles();
    
    render();
}

function render () 
{
    
    rendererCss.render( sceneCss, camera );
    rendererWebGL.render( sceneWebGL, camera );
    
}

function animateParticles() 
{
    var delta = clock.getDelta() * spawnerOptions.timeScale;
    tick += delta;
    if ( tick < 0 ) tick = 0;
    particleSystem.spawnParticle( particleSystemOptions );
    particleSystem.update( tick );
}

function onWindowResize () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    rendererCss.setSize( window.innerWidth, window.innerHeight );
    rendererWebGL.setSize( window.innerWidth, window.innerHeight );

    render();
}

/**********************
 * UTILS 
 **********************/
function randomer (min, max) {
    if ( !isNaN(min) &&  !isNaN(max) )
        return min + ((max - min) * Math.random());
    return Math.random();
}
function randomerAngle (min, max) {
    min = min || 0;
    max = max || 360;
    //input is in degrees, output is in radians
    return randomer(min, max) * (Math.PI/180);
}