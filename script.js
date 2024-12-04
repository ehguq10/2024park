class BreathingTimer {
    constructor() {
        this.timePerSet = 0;
        this.totalSets = 0;
        this.currentSet = 0;
        this.currentTime = 0;
        this.timerId = null;
        this.onTick = null;
        this.onComplete = null;
        this.breathCount = 0;
    }

    setup(seconds, sets) {
        this.timePerSet = seconds;
        this.totalSets = sets;
        this.currentSet = sets;
        this.currentTime = seconds;
        this.breathCount = 0;
    }

    start() {
        if (this.currentSet <= 0) {
            if (this.onComplete) this.onComplete();
            return;
        }

        this.timerId = setInterval(() => {
            if (this.currentTime <= 0) {
                this.breathCount++;
                
                if (this.breathCount >= 2) {
                    this.breathCount = 0;
                    this.currentSet--;
                    
                    if (this.currentSet <= 0) {
                        clearInterval(this.timerId);
                        if (this.onComplete) this.onComplete();
                        return;
                    }
                }

                this.currentTime = this.timePerSet;
            }

            if (this.onTick) {
                this.onTick(this.currentTime, this.currentSet, this.totalSets, this.breathCount);
            }
            this.currentTime--;
        }, 1000);
    }

    stop() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }
}

// DOM 요소
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const secondsInput = document.getElementById('seconds');
const setsInput = document.getElementById('sets');
const timeDisplay = document.querySelector('.time');
const setsDisplay = document.querySelector('.sets');

// 타이머 인스턴스 생성
const breathTimer = new BreathingTimer();

// 시간 포맷팅 함수
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 이벤트 핸들러
breathTimer.onTick = (time, currentSet, totalSets, breathCount) => {
    timeDisplay.textContent = formatTime(time);
    setsDisplay.textContent = `${currentSet}/${totalSets} 세트 (${breathCount === 0 ? '들숨' : '날숨'})`;
};

breathTimer.onComplete = () => {
    timeDisplay.textContent = '00:00';
    setsDisplay.textContent = '완료!';
    startBtn.disabled = false;
    stopBtn.disabled = true;
    timeDisplay.style.color = 'white';
    
    // 완료 알림 효과
    container.classList.add('completed');
    setTimeout(() => {
        container.classList.remove('completed');
        alert('운동이 끝났습니다!');
    }, 1000);
};

startBtn.addEventListener('click', () => {
    const seconds = parseInt(secondsInput.value);
    const sets = parseInt(setsInput.value);
    
    if (seconds > 0 && sets > 0) {
        breathTimer.setup(seconds, sets);
        breathTimer.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
        timeDisplay.classList.add('active');
    }
});

stopBtn.addEventListener('click', () => {
    breathTimer.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    timeDisplay.classList.remove('active');
});

// 스페이스바 이벤트 리스너 추가
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // 페이지 스크롤 방지
        
        if (!startBtn.disabled) {
            startBtn.click();
        } else if (!stopBtn.disabled) {
            stopBtn.click();
        }
    }
});
