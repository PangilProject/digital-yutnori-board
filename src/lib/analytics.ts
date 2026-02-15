import ReactGA from "react-ga4";

// 환경 변수에서 측정 ID 가져오기
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const IS_DEV = import.meta.env.DEV;

interface GameEvent {
  category: "Game" | "Button" | "Share" | "Narrator";
  action: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

/**
 * GA4 초기화 함수
 */
export const initGA = () => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID, { 
      testMode: IS_DEV // 로컬 개발 환경에서 테스트 모드로 설정 (콘솔 로그 등)
    });
    console.log(`GA4 Initialized with ID: ${GA_MEASUREMENT_ID} (Mode: ${IS_DEV ? 'Dev' : 'Prod'})`);
  } else {
    console.warn("GA4 Measurement ID is missing!");
  }
};

/**
 * 이벤트 전송 함수
 * @param category 이벤트 카테고리 (예: Game, Button)
 * @param action 이벤트 액션 (예: game_start, piece_move)
 * @param label 이벤트 라벨 (추가 정보)
 * @param value 이벤트 값 (수치 정보)
 * @param otherParams 기타 파라미터 (커스텀 차원/지표 등)
 */
export const trackEvent = ({ category, action, label, value, ...otherParams }: GameEvent) => {
  if (!GA_MEASUREMENT_ID) return;
  
  // 개발 환경에서는 콘솔에도 로그를 남깁니다.
  if (IS_DEV) {
    console.groupCollapsed(`[GA4 Event] ${category} - ${action}`);
    console.log('Parameters:', { label, value, ...otherParams });
    console.groupEnd();
  }

  ReactGA.event({
    category,
    action,
    label,
    value,
    ...otherParams,
  });
};

/**
 * 페이지 뷰 전송 함수
 * React Router 사용 시 페이지 이동마다 호출
 */
export const trackPageView = () => {
  if (!GA_MEASUREMENT_ID) return;
  
  ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search });
};
