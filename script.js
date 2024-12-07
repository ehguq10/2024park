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
        this.sounds = null;
        this.soundsEnabled = false;
    }

    initSounds() {
        return new Promise((resolve) => {
            this.sounds = {
                tick: new Audio('/2024park/sounds/tick.mp3'),
                set: new Audio('/2024park/sounds/set.mp3'),
                complete: new Audio('/2024park/sounds/complete.mp3')
            };

            // 볼륨 설정
            this.sounds.tick.volume = 0.5;
            this.sounds.set.volume = 0.5;
            this.sounds.complete.volume = 0.7;

            // 모든 사운드에 대해 한 번씩 재생 시도
            Promise.all(Object.values(this.sounds).map(sound => {
                return sound.play()
                    .then(() => {
                        sound.pause();
                        sound.currentTime = 0;
                        return true;
                    })
                    .catch(() => false);
            })).then(results => {
                this.soundsEnabled = results.some(result => result);
                resolve();
            });
        });
    }

    async playSound(sound) {
        if (!this.soundsEnabled || !sound) return;
        
        try {
            sound.currentTime = 0;
            await sound.play();
        } catch (error) {
            console.log('Sound play failed:', error);
        }
    }

    // start 메서드 수정
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
                        this.playSound(this.sounds.complete);
                        if (this.onComplete) this.onComplete();
                        return;
                    }
                    
                    this.playSound(this.sounds.set);
                }

                this.currentTime = this.timePerSet;
            }

            this.playSound(this.sounds.tick);
            
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
            
            // 모든 재생 중인 사운드 정지
            Object.values(this.sounds).forEach(sound => {
                sound.pause();
                sound.currentTime = 0;
            });
        }
    }

    // setup 메서드 추가
    setup(seconds, sets) {
        this.timePerSet = seconds;
        this.totalSets = sets;
        this.currentSet = sets;
        this.currentTime = seconds;
        this.breathCount = 0;
    }
}

// DOM 요소
const container = document.querySelector('.container');
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

startBtn.addEventListener('click', async () => {
    const seconds = parseInt(secondsInput.value);
    const sets = parseInt(setsInput.value);
    
    if (seconds > 0 && sets > 0) {
        try {
            console.log('Initializing sounds...');
            await breathTimer.initSounds();
            console.log('Sounds initialized');
            
            breathTimer.setup(seconds, sets);
            breathTimer.start();
            startBtn.disabled = true;
            stopBtn.disabled = false;
            timeDisplay.classList.add('active');
        } catch (error) {
            console.error('Error starting timer:', error);
        }
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

// 터치 이벤트 지원
startBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startBtn.click();
});

stopBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    stopBtn.click();
});