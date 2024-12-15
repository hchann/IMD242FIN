// 종횡비를 고정하고 싶을 경우: 아래 두 변수를 0이 아닌 원하는 종, 횡 비율값으로 설정.
// 종횡비를 고정하고 싶지 않을 경우: 아래 두 변수 중 어느 하나라도 0으로 설정.
const aspectW = 4;
const aspectH = 0;
// html에서 클래스명이 container-canvas인 첫 엘리먼트: 컨테이너 가져오기.
const container = document.body.querySelector('.container-canvas');
// 필요에 따라 이하에 변수 생성.
let img;
let handpose;
let predictions = [];

const images = [
  'asset/image.jpg',
  'asset/image1.jpg',
  'asset/image2.jpg',
  'asset/image3.jpg',
  'asset/image4.jpg',
];

let currentImageIdx = 0; //현재 표시 중인 이미지 인덱스

function preload() {
  img = loadImage(images[currentImageIdx]);
}

function setup() {
  // 컨테이너의 현재 위치, 크기 등의 정보 가져와서 객체구조분해할당을 통해 너비, 높이 정보를 변수로 추출.
  const { width: containerW, height: containerH } =
    container.getBoundingClientRect();
  // 종횡비가 설정되지 않은 경우:
  // 컨테이너의 크기와 일치하도록 캔버스를 생성하고, 컨테이너의 자녀로 설정.
  if (aspectW === 0 || aspectH === 0) {
    createCanvas(containerW, containerH).parent(container);
  }
  // 컨테이너의 가로 비율이 설정한 종횡비의 가로 비율보다 클 경우:
  // 컨테이너의 세로길이에 맞춰 종횡비대로 캔버스를 생성하고, 컨테이너의 자녀로 설정.
  else if (containerW / containerH > aspectW / aspectH) {
    createCanvas((containerH * aspectW) / aspectH, containerH).parent(
      container
    );
  }
  // 컨테이너의 가로 비율이 설정한 종횡비의 가로 비율보다 작거나 같을 경우:
  // 컨테이너의 가로길이에 맞춰 종횡비대로 캔버스를 생성하고, 컨테이너의 자녀로 설정.
  else {
    createCanvas(containerW, (containerW * aspectH) / aspectW).parent(
      container
    );
  }

  handpose = ml5.handpose(createCapture(VIDEO).hide(), modelReday); //ml5에서 handpose 가져오기.

  handpose.on('predict', (results) => {
    predictions = results;
  });
}

function modelReday() {
  console.log('Handpose 모델이 로드되었습니닷!');
}

function draw() {
  background(255);

  let gridSize = getGridSizeFromHand();

  for (let y = 0; y < img.height; y += gridSize) {
    for (let x = 0; x < img.width; x += gridSize) {
      const c = img.get(x, y);

      fill(c);
      noStroke();
      //좌표매핑은 chatgpt의 도움을 받아 작성되었습니다.
      rect(
        map(x, 0, img.width, 0, width),
        map(y, 0, img.height, 0, height),
        map(gridSize, 0, img.width, 0, width),
        map(gridSize, 0, img.height, 0, height)
      );
    }
  }

  drawKeypoints();
}

function getGridSizeFromHand() {
  if (predictions.length > 0) {
    const landmarks = predictions[0].landmarks;
    //엄지와 중지의 거리 계산은 chat gpt의 도움을 받아 작성되었습니다.
    const thumbTip = landmarks[4];
    const middleTip = landmarks[12];
    const distance = dist(thumbTip[0], thumbTip[1], middleTip[0], middleTip[1]);

    return constrain(map(distance, 50, 300, 10, 50), 5, 50);
  }
  return 20;
}

function drawKeypoints() {
  for (let n = 0; n < predictions.length; n++) {
    const prediction = predictions[n];
    for (let i = 0; i < prediction.landmarks.length; i++) {
      const [x, y] = prediction.landmarks[i];
      noFill();
      ellipse(
        map(x, 0, img.width, 0, width),
        map(y, 0, img.height, 0, height),
        10,
        10
      );
    }
  }
}

function mousePressed() {
  currentImageIdx = (currentImageIdx + 1) % images.length;

  img = loadImage(images[currentImageIdx]);
}

function windowResized() {
  // 컨테이너의 현재 위치, 크기 등의 정보 가져와서 객체구조분해할당을 통해 너비, 높이 정보를 변수로 추출.
  const { width: containerW, height: containerH } =
    container.getBoundingClientRect();
  // 종횡비가 설정되지 않은 경우:
  // 컨테이너의 크기와 일치하도록 캔버스 크기를 조정.
  if (aspectW === 0 || aspectH === 0) {
    resizeCanvas(containerW, containerH);
  }
  // 컨테이너의 가로 비율이 설정한 종횡비의 가로 비율보다 클 경우:
  // 컨테이너의 세로길이에 맞춰 종횡비대로 캔버스 크기를 조정.
  else if (containerW / containerH > aspectW / aspectH) {
    resizeCanvas((containerH * aspectW) / aspectH, containerH);
  }
  // 컨테이너의 가로 비율이 설정한 종횡비의 가로 비율보다 작거나 같을 경우:
  // 컨테이너의 가로길이에 맞춰 종횡비대로 캔버스 크기를 조정.
  else {
    resizeCanvas(containerW, (containerW * aspectH) / aspectW);
  }
  // 위 과정을 통해 캔버스 크기가 조정된 경우, 다시 처음부터 그려야할 수도 있다.
  // 이런 경우 setup()의 일부 구문을 init()에 작성해서 여기서 실행하는게 편리하다.
  // init();
}
