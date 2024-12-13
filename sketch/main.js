// 종횡비를 고정하고 싶을 경우: 아래 두 변수를 0이 아닌 원하는 종, 횡 비율값으로 설정.
// 종횡비를 고정하고 싶지 않을 경우: 아래 두 변수 중 어느 하나라도 0으로 설정.
const aspectW = 4;
const aspectH = 0;
// html에서 클래스명이 container-canvas인 첫 엘리먼트: 컨테이너 가져오기.
const container = document.body.querySelector('.container-canvas');

let video; // 비디오 캡처
let handpose; // Handpose 모델
let predictions = []; // 예측 결과 저장

function setup() {
  // 컨테이너의 현재 위치, 크기 등의 정보 가져와서 객체구조분해할당을 통해 너비, 높이 정보를 변수로 추출.
  const { width: containerW, height: containerH } =
    container.getBoundingClientRect();

  // 캔버스 설정
  if (aspectW === 0 || aspectH === 0) {
    createCanvas(containerW, containerH).parent(container);
  } else if (containerW / containerH > aspectW / aspectH) {
    createCanvas((containerH * aspectW) / aspectH, containerH).parent(
      container
    );
  } else {
    createCanvas(containerW, (containerW * aspectH) / aspectW).parent(
      container
    );
  }

  init();

  // 비디오 설정
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Handpose 모델 초기화
  handpose = ml5.handpose(video, modelReady);

  // 예측 결과 처리
  handpose.on('predict', (results) => {
    predictions = results;
  });
}

// 모델 로드 완료 시 호출되는 콜백 함수
function modelReady() {
  console.log('Handpose 모델이 로드되었습니다!');
}

function init() {}

function draw() {
  background(255);

  // 비디오 픽셀 데이터 로드
  video.loadPixels();

  // 모자이크 효과 적용
  let gridSize = int(map(mouseX, 0, width, 5, 20)); // 마우스 위치에 따라 그리드 크기 변경
  for (let x = 0; x < video.width; x += gridSize) {
    for (let y = 0; y < video.height; y += gridSize) {
      let index = (y * video.width + x) * 4;
      let r = video.pixels[index];
      let g = video.pixels[index + 1];
      let b = video.pixels[index + 2];

      fill(r, g, b);
      noStroke();
      rect(x, y, gridSize, gridSize);
    }
  }

  // Handpose 키포인트 그리기
  drawKeypoints();
}

// 예측된 키포인트를 그리는 함수
function drawKeypoints() {
  for (let i = 0; i < predictions.length; i++) {
    let prediction = predictions[i];
    for (let j = 0; j < prediction.landmarks.length; j++) {
      let [x, y, z] = prediction.landmarks[j];
      fill(0, 255, 0);
      noStroke();
      ellipse(x, y, 10, 10);
    }
  }
}

function windowResized() {
  const { width: containerW, height: containerH } =
    container.getBoundingClientRect();

  if (aspectW === 0 || aspectH === 0) {
    resizeCanvas(containerW, containerH);
  } else if (containerW / containerH > aspectW / aspectH) {
    resizeCanvas((containerH * aspectW) / aspectH, containerH);
  } else {
    resizeCanvas(containerW, (containerW * aspectH) / aspectW);
  }
}
