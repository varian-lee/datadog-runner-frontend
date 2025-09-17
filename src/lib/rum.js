/**
 * 📊 Datadog RUM (Real User Monitoring) 설정 - Frontend
 * 
 * 실사용자 모니터링 및 APM 연결
 * - 사용자 상호작용 추적 (클릭, 네비게이션)
 * - 리소스 로딩 성능 모니터링
 * - 세션 리플레이 (사용자 행동 녹화)
 * - RUM-APM 분산 트레이싱 연결 (allowedTracingUrls)
 * - W3C Trace Context + Datadog 헤더 전파
 * 
 * 환경 변수:
 * - VITE_DD_RUM_APP_ID: RUM 애플리케이션 ID
 * - VITE_DD_RUM_CLIENT_TOKEN: 클라이언트 토큰
 * - VITE_DD_SITE: Datadog 사이트 (기본: datadoghq.com)
 * - VITE_DD_ENV: 환경 태그 (기본: demo)
 */
export function initRUM() {
  if (!window.DD_RUM) return;
  window.DD_RUM.init({
    applicationId: import.meta.env.VITE_DD_RUM_APP_ID,
    clientToken:    import.meta.env.VITE_DD_RUM_CLIENT_TOKEN,
    site:           import.meta.env.VITE_DD_SITE || 'datadoghq.com',
    service:        'datadog-runner-frontend',
    env:            import.meta.env.VITE_DD_ENV || 'demo',
    version:        import.meta.env.VITE_APP_VERSION || '0.1.0',
    trackUserInteractions: true,
    trackResources:        true,
    trackLongTasks:        true,
    sessionSampleRate:     100,
    sessionReplaySampleRate: 100,
    defaultPrivacyLevel: 'mask-user-input',
    silentMultipleInit: true,
    // RUM과 APM Traces 연결 설정
    allowedTracingUrls: [
      {
        match: "http://k8s-default-runnerin-d1d6c3a6d5-1329256805.ap-northeast-2.elb.amazonaws.com",
        propagatorTypes: ["datadog", "tracecontext"]
      },
      {
        match: /^https?:\/\/.*\.ap-northeast-2\.elb\.amazonaws\.com/,
        propagatorTypes: ["datadog", "tracecontext"]
      },
      {
        match: /\/api\//,
        propagatorTypes: ["datadog", "tracecontext"]
      },
      {
        match: /\/rankings\//,
        propagatorTypes: ["datadog", "tracecontext"]
      }
    ],
    traceSampleRate: 100, // Backend traces 샘플링 비율
  });
  window.DD_RUM.startSessionReplayRecording();
}

export function rumAction(name, attrs = {}) {
  if (window.DD_RUM?.addAction) window.DD_RUM.addAction(name, attrs);
}

/**
 * 🔐 사용자 정보 설정 - 로그인 후 호출
 * Datadog RUM에 사용자 세션 정보를 연결하여 사용자별 추적 가능
 */
export function setRumUser(userInfo) {
  if (window.DD_RUM?.setUser) {
    // API 응답: {"user_id": "demo"} 형태
    const userId = userInfo.user_id || userInfo.id;
    window.DD_RUM.setUser({
      id: userId,
      name: userId  // 사용자 ID를 이름으로도 사용
      // 이메일은 제거 (불필요)
    });
    console.log('🔐 RUM User 설정 완료:', { id: userId, name: userId });
  }
}

/**
 * 🎮 게임 플레이 상태 설정 - 글로벌 컨텍스트
 * 게임 시작/완료 시 호출하여 사용자 행동 패턴 분석
 */
export function setGamePlayedStatus(isPlayed) {
  if (window.DD_RUM?.setGlobalContextProperty) {
    window.DD_RUM.setGlobalContextProperty('isPlayed', isPlayed);
    console.log('🎮 게임 플레이 상태 업데이트:', { isPlayed });
  }
}

/**
 * 📊 추가 컨텍스트 설정 함수
 * 사용자 정의 속성을 글로벌 컨텍스트에 추가
 */
export function addRumContext(key, value) {
  if (window.DD_RUM?.setGlobalContextProperty) {
    window.DD_RUM.setGlobalContextProperty(key, value);
    console.log(`📊 RUM 컨텍스트 추가: ${key} =`, value);
  }
}

/**
 * 🧹 사용자 로그아웃 시 정보 초기화
 */
export function clearRumUser() {
  if (window.DD_RUM?.clearUser) {
    window.DD_RUM.clearUser();
    console.log('🧹 RUM User 정보 초기화 완료');
  }
}
