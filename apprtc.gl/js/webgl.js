var stats, scene, renderer;
var camera, tvset;

setTimeout(function(){
	if( !init() )	animate();
}, 2);
//console.log("webgl.js loaded")

// init the scene
function init(){

	if( Detector.webgl ){
		renderer = new THREE.WebGLRenderer({
			antialias		: true,	// to get smoother output
			preserveDrawingBuffer	: true	// to allow screenshot
		});
		renderer.setClearColorHex( 0x000000, 1 );
		renderer.autoClear = false
	}else{
		Detector.addGetWebGLMessage();
		return true;
	}
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.getElementById('containerThreejs').appendChild(renderer.domElement);

	// add Stats.js - https://github.com/mrdoob/stats.js
	stats = new Stats();
	stats.domElement.style.position	= 'absolute';
	stats.domElement.style.bottom	= '0px';
	document.body.appendChild( stats.domElement );


	// create a scene
	scene = new THREE.Scene();

	// put a camera in the scene
	camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set(0, 1, 6);
	scene.add(camera);

	// create a camera contol
	cameraControls	= new THREEx.DragPanControls(camera)
	cameraControls.rangeX	= -15;
	cameraControls.rangeY	= +10;

	// transparently support window resize
	THREEx.WindowResize.bind(renderer, camera);
	// allow 'p' to make screenshot
	THREEx.Screenshot.bindKey(renderer);
	// allow 'f' to go fullscreen where this feature is supported
	if( THREEx.FullScreen.available() )	THREEx.FullScreen.bindKey();		

	// here you add your objects
	// - you will most likely replace this part by your own

	var light	= new THREE.AmbientLight( 0x444444 );
	scene.add( light );			

	var light	= new THREE.DirectionalLight( 0xff8000, 1.5 );
	light.position.set( 1, 0, 1 ).normalize();
	scene.add( light );
	
	var light	= new THREE.DirectionalLight( 0xff8000, 1.5 );
	light.position.set( -1, 1, 0 ).normalize();
	scene.add( light );

//////////////////////////////////////////////////////////////////////////////////
//		Create tvset1 on the right					//
//////////////////////////////////////////////////////////////////////////////////
	if( false ){
		video1		= document.createElement('video');
		video1.width	= 320;
		video1.height	= 240;
		video1.volume	= 0;
		video1.autoplay	= true;
		video1.loop	= true;
		video1.src	= "videos/sintel.ogv";
	}else{
		video1	= document.getElementById('localVideo');
	}
	video1Texture	= new THREE.Texture( video1 );
	video1Texture.needsUpdate = true;
	// do a flipX in the video1Texture
	video1Texture.repeat.set(-1, 1);
	video1Texture.offset.set( 1, 0);



	var tvset1	= new THREE.Object3D();
	tvset1.position.x	= -1.6;
	tvset1.position.y	= -0.7;
	tvset1.position.z	= 0;
	tvset1.rotation.y	=  Math.PI/4;
	tvset1.scale.multiplyScalar(0.9);
	scene.add(tvset1);
	//var url	= 'models/Old Television Set 01/models/Old Television Set 01.dae';
	var url	= 'models/OldTelevisionSet01/models/OldTelevisionSet01.dae';
	new THREE.ColladaLoader().load(url, function(collada){
		var object3d		= collada.scene;
		object3d.scale.multiplyScalar(1/200);
		object3d.position.y	= -2;
		object3d.rotation.x	= -Math.PI/2;
		tvset1.add(object3d);

		var geometry	= new THREE.PlaneGeometry( 1, 1 );
		var material	= new THREE.MeshLambertMaterial({
			ambient	: 0x444444,
			color	: 0xffffff,
			map	: video1Texture
		});
		var mesh	= new THREE.Mesh( geometry, material );
		mesh.scale.set(2.1, 1.6, 1);
		mesh.position.x	= 0;
		mesh.position.y	= 1.55;
		mesh.position.z	= 0.8;
		tvset1.add( mesh );
	});


//////////////////////////////////////////////////////////////////////////////////
//		Create tvset2 on the left					//
//////////////////////////////////////////////////////////////////////////////////
	if( false ){
		video2		= document.createElement('video');
		video2.width	= 320;
		video2.height	= 240;
		video2.volume	= 0;
		video2.autoplay	= true;
		video2.loop	= true;
		video2.src	= "videos/sintel.ogv";
	}else{
		video2	= document.getElementById('remoteVideo');		
	}
	video2Texture	= new THREE.Texture( video2 );

	var tvset2	= new THREE.Object3D();
	tvset2.position.x	=  1.6;
	tvset2.position.y	= -0.7;
	tvset2.position.z	= 0;
	tvset2.rotation.y	= -Math.PI/4;
	tvset2.scale.multiplyScalar(0.9);
	scene.add(tvset2);
	var url	= 'models/OldTelevisionSet01/models/OldTelevisionSet01.dae';
	new THREE.ColladaLoader().load(url, function(collada){
		var object3d		= collada.scene;
		object3d.scale.multiplyScalar(1/200);
		object3d.position.y	= -2;
		object3d.rotation.x	= -Math.PI/2;
		tvset2.add(object3d);

		var geometry	= new THREE.PlaneGeometry( 1, 1 );
		var material	= new THREE.MeshLambertMaterial({
			ambient	: 0x444444,
			color	: 0xffffff,
			map	: video2Texture
		});
		var mesh	= new THREE.Mesh( geometry, material );
		mesh.scale.set(2.1, 1.6, 1);
		mesh.position.x	= 0;
		mesh.position.y	= 1.55;
		mesh.position.z	= 0.8;
		tvset2.add( mesh );
	});
}

// animation loop
function animate() {

	// loop on request animation loop
	// - it has to be at the begining of the function
	// - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
	requestAnimationFrame( animate );

	// do the render
	render();

	// update stats
	stats.update();
}

// render the scene
function render() {
	// update camera controls
	cameraControls.update();
	
	if( video1Texture.image.readyState === video1Texture.image.HAVE_ENOUGH_DATA ){
		video1Texture.needsUpdate = true;
	}

	if( video2Texture.image.readyState === video2Texture.image.HAVE_ENOUGH_DATA ){
		video2Texture.needsUpdate = true;
	}
	
	// actually render the scene
	renderer.clear();
	renderer.render(scene, camera);
}
