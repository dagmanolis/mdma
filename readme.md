# mdma
A mysterious 3D world of dom elements and cubes, created in Three.js

### Usage ###
Just add / delete / modify dom elements on index.html using this template

```html
<div class="project" id="any_unique_name">
    ...any html elements
</div>
```
### Info ###

It uses Hammer.js for gesture control on mobiles, or it binds to mouse click for desktop versions

```javascript
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    ...
else
    document.addEventListener('click', nextProject);
```

You can also use div ids as a hastag on your url, to go directly to that project.
```code
https://manosdag.gr/mdma/#carpetgr
```

The entry point of main.js is at line 78

```javascript
//START!
animate();

//play intro
moveCameraToProject(currentProjectIndex, 5000);
```

It uses both Css and WebGL renderers 
```code
THREE.WebGLRenderer();
THREE.CSS3DRenderer();
```