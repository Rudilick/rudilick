const playCountAndClick = async () => {
  const bpm = settingsRef.current.slowMode ? 50 : settingsRef.current.bpm;
  const meter = settingsRef.current.meter;
  const interval = 60 / bpm;
  const beatsPerMeasure = parseInt(meter.split('/')[0]);
  const countNames = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
  const hypeMessages = ["Let's groove!", "Let's go!", "Here we go!", "Time to hit!", "Drum on!"];
  const context = new (window.AudioContext || window.webkitAudioContext)();

  // 메시지 표시
  setReadyText("Are you ready?");
  setTimeout(() => {
    setReadyText(hypeMessages[Math.floor(Math.random() * hypeMessages.length)]);
  }, 1000);
  setTimeout(() => setReadyText(null), 3000);

  // 전체 시퀀스 시작 시간
  const now = context.currentTime + 2.5 + interval;

  // 카운트 보이스 (예: one, two, three, four)
  for (let i = 0; i < beatsPerMeasure; i++) {
    const name = countNames[i];
    const scheduledTime = now + i * interval;
    setTimeout(() => {
      setCountNumber(i + 1);
      if (i === beatsPerMeasure - 1) {
        setTimeout(() => setCountNumber(null), interval * 1000 * 0.8);
      }
    }, (scheduledTime - context.currentTime) * 1000);
    playBufferedSound(context, `/audio/${name}.wav`, scheduledTime);
  }

  // ✅ 클릭음을 카운트 종료 후 즉시 이어서 재생
  const countEndTime = now + beatsPerMeasure * interval;
  const totalBeats = Math.floor(60 / interval);
  for (let i = 0; i < totalBeats; i++) {
    const scheduledTime = countEndTime + i * interval;
    const isFirstBeat = i % beatsPerMeasure === 0;
    const clickUrl = isFirstBeat ? '/audio/click_high.wav' : '/audio/click.wav';
    playBufferedSound(context, clickUrl, scheduledTime);
  }

  await new Promise((res) =>
    setTimeout(res, (beatsPerMeasure + totalBeats + 1) * interval * 1000)
  );
};