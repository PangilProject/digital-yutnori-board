# 🎲 윷놀이 디지털 말판 (Yutnori Digital Board)

전통 민속 놀이인 윷놀이를 현대적인 웹 기술과 디자인으로 재해석한 **디지털 말판 서비스**입니다.  
오프라인에서 윷을 던지고, 온라인 화면을 통해 말을 이동시키며 현장감과 편의성을 동시에 즐길 수 있도록 제작되었습니다.

![Project Preview](/public/og-image.png)

## ✨ 주요 기능 (Key Features)

### 1. 직관적인 게임 플레이
- **말 이동 시스템**: 윷을 던져 나온 결과에 따라 말을 클릭하고 원하는 위치로 쉽게 이동할 수 있습니다.
- **잡기 & 업기**: 상대방 말을 잡거나 같은 팀 말을 업는(합치는) 규칙이 자동으로 적용됩니다.
- **자동 길 찾기**: 복잡한 윷놀이 판의 경로(지름길, 정규 경로)를 알고리즘이 자동으로 계산하여 안내합니다.

### 2. 세련된 UI/UX 디자인
- **다크 모드 & Glassmorphism**: 고급스럽고 몰입감 넘치는 어두운 배경과 반투명 유리 질감의 디자인을 적용했습니다.
- **부드러운 애니메이션**: 말의 이동, 잡기, 업기 등 게임 내 모든 동작에 자연스러운 애니메이션 효과를 제공합니다.
- **반응형 디자인**: 데스크탑, 태블릿 등 다양한 화면 크기에 최적화되어 있습니다.

### 3. 게임 관리 및 편의성
- **팀 대시보드**: 각 팀의 현재 점수, 남은 말, 진행 상황을 한눈에 확인할 수 있습니다.
- **게임 상태 저장**: 실수로 브라우저를 닫더라도 진행 상황이 유지되도록 설계되었습니다.
- **초기화 방지**: 게임 리셋 시 확인 모달을 통해 실수로 인한 게임 종료를 방지합니다.

## 🛠 기술 스택 (Tech Stack)

이 프로젝트는 최신 모던 웹 기술을 기반으로 구축되었습니다.

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI 기반)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks & Context API

## 🚀 시작하기 (Getting Started)

로컬 환경에서 프로젝트를 실행하려면 다음 단계를 따르세요.

### 필수 조건 (Prerequisites)
- [Node.js](https://nodejs.org/) (v18 이상 권장)
- npm 또는 yarn 패키지 매니저

### 설치 및 실행 (Installation & Run)

1. **리포지토리 클론 (Clone Repository)**
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd digital-yutnori-board
   ```

2. **의존성 설치 (Install Dependencies)**
   ```bash
   npm install
   # 또는
   yarn install
   ```

3. **개발 서버 실행 (Run Dev Server)**
   ```bash
   npm run dev
   # 또는
   yarn dev
   ```

4. **브라우저 확인**
   - 브라우저를 열고 `http://localhost:8080` (또는 터미널에 표시된 주소)로 접속하여 게임을 즐기세요!

## 🤝 기여하기 (Contributing)

이 프로젝트에 기여하고 싶으시다면 언제든 Pull Request를 보내주세요. 버그 제보나 기능 제안은 Issue 탭을 이용해 주시기 바랍니다.

## 📜 라이선스 (License)

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 LICENSE 파일을 참고하세요.
