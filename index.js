const startButton = document.getElementById('startButton')
const overplay = document.getElementById('overplay')
const loading = document.getElementById('loading')
startButton.addEventListener('click', start)

// 打字机效果
$('.example1').typeIt({
  whatToType: "祝XX圣诞快乐, 这里有一份专属于你的圣诞礼物, 以后的每个圣诞, 我都会陪你度过 --by XXX.",
  typeSpeed: 100,
}, ()=>{});

let renderer, camera, scene, light, control
let width, height

function start() {
  startButton.innerHTML = '加载中...'
  loading.style.display = 'block'

  initRenderer()
  initScene()
  initCamera()
  loadModel()
  initLight()
  controler()
  initAudio()
}

function initRenderer() {
  width = window.innerWidth
  height = window.innerHeight
  renderer = new THREE.WebGLRenderer({
    antialias: true
  })
  // 如果设置开启，允许在场景中使用阴影贴图
  // renderer.shadowMap.enabled = true
  // 定义阴影贴图类型 (未过滤, 关闭部分过滤, 关闭部分双线性过滤)
  // renderer.shadowMap.type = THREE.BasicShadowMap

  renderer.setSize(width, height)
  document.body.appendChild(renderer.domElement)
  renderer.setClearColor(0x000089, 1.0)
}

function initScene() {
  scene = new THREE.Scene()
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(45, width/height, 1, 1000)
  camera.position.set(6, 2, -12)
}

function initLight() {
  // 点光源
  light = new THREE.PointLight(0x00ff00, 1)
  light.position.set(1, -1, 1)
  scene.add(light)
  light.castShadow = true
  light.shadow.camera.near = 1
  light.shadow.camera.far = 25
}

let group
function loadModel() {
  // 环境hdr贴图
  new THREE.RGBELoader()
  .load('./winter_evening_1k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.background = texture
    scene.environment = texture
    animate()

    // 圣诞树gltf模型
    const loader = new THREE.GLTFLoader()
    loader.load('./scene.gltf', (gltf) => {
      overplay.remove()
      loading.remove()
      gltf.scene.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          child.material.emissive =  child.material.color
          child.material.emissiveMap = child.material.map
          child.receiveShadow = true
          child.castShadow = true
        }
      });
      gltf.scene.position.y -= 2 

      scene.add(gltf.scene)
      // 模型大小调整
      gltf.scene.scale.set(0.008, 0.008, 0.008)
      animate()
    })
  })

  // 雪花
  let textureOrgin = new THREE.TextureLoader().load('./fl.png')
  group = new THREE.Group()
  // 雪花数量
  for (let i =0; i< 5000; i++) {
    const spriteMaterial = new THREE.SpriteMaterial({
      map: textureOrgin
    })
    const sprite = new THREE.Sprite(spriteMaterial)
    group.add(sprite)
    // 雪花纹理的大小调整
    sprite.scale.set(0.1, 0.1, 0.1)
    let k1 = Math.random() - 0.5
    let k2 = Math.random() - 0.5
    // 场景中雪花的空间
    sprite.position.set(k1 * 100, 20 * (Math.random()-0.1), 100 * k2)
  }
  scene.add(group)
}

function animate() {
  // 雪花循环动画
  group.children.forEach(sprite => {
    // 调节雪花下降速度
    sprite.position.y -= 0.002
    if(sprite.position.y < -5) {
      sprite.position.y = 20
    }
  })
  
  // 场景自动旋转速度
  scene.rotation.y += 0.004

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

function controler() {
  control = new THREE.OrbitControls(camera, renderer.domElement)
  control.addEventListener('change', animate)
  // 缩放开关
  control.enableZoom = false
  // 平移开关
  control.enablePan = false

  window.addEventListener('resize', onWindowResize)
}

function initAudio() {
  let listener = new THREE.AudioListener()
  let audio = new THREE.Audio(listener)
  let audioLoader = new THREE.AudioLoader()

  // 背景音乐
  audioLoader.load('./christmas.mp3', (AudioBuffer) => {
    audio.setBuffer(AudioBuffer)
    audio.setLoop(true)
    audio.setVolume(0.5)
    audio.play()
  })
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  
  renderer.setSize(window.innerWidth, window.innerHeight)
  animate()
}