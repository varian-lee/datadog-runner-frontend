# datadog-runner-frontend

**Datadog Runner** 프로젝트의 **frontend-react** 마이크로서비스입니다.

## 🔗 Multi-root Workspace
이 저장소는 Multi-root Workspace의 일부입니다:
- **🏠 워크스페이스**: /Users/kihyun.lee/workspace/datadog-runner-multiroot
- **🧠 개발 환경**: Cursor Multi-root로 통합 관리
- **🔄 Git 관리**: 각 서비스 독립적 버전 관리

## 🚀 개발 환경
```bash
# Multi-root Workspace에서 개발
cd /Users/kihyun.lee/workspace/datadog-runner-multiroot
cursor datadog-runner.code-workspace

# 또는 이 서비스만 단독 개발
cursor .
```

## 📁 기술 스택
- **React 18**: 현대적 UI 프레임워크
- **Vite**: 빠른 개발 빌드 도구
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Datadog RUM**: 실사용자 모니터링

## 🎮 주요 기능
- 60fps 고정 점프 액션 게임
- 레벨 배지 시스템 (5단계)
- 실시간 채팅 통합
- RUM-APM 분산 트레이싱

## 🔄 배포
```bash
# 개발 이미지 빌드 및 배포
../infra/scripts/update-dev-image.sh frontend-react

# 또는 통합 배포
../infra/scripts/deploy-eks-complete.sh
```

## 📊 모니터링
- **Datadog APM**: 분산 트레이싱
- **JSON 로깅**: 구조화된 로그 분석
- **Dynamic Instrumentation**: 런타임 계측
- **Exception Replay**: 예외 상태 캡처

*마지막 업데이트: 2025-09-17*
