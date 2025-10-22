import "@testing-library/jest-dom";

// --- next/image mock (Next 전용 props 제거 + onLoadingComplete 브릿지)
jest.mock("next/image", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: (props: any) => {
      const {
        onLoadingComplete,
        blurDataURL,
        placeholder,
        fill,
        priority,
        sizes,
        ...rest
      } = props || {};

      const handleLoad = (e: any) => {
        if (typeof onLoadingComplete === "function") {
          onLoadingComplete(e.currentTarget);
        }
        if (typeof rest.onLoad === "function") rest.onLoad(e);
      };

      const imgProps: any = { ...rest, onLoad: handleLoad };
      if (sizes != null) imgProps.sizes = sizes;
      if (!imgProps.alt) imgProps.alt = "";

      return React.createElement("img", imgProps);
    },
  };
});

// --- JSDOM에 없는 API 폴리필
Object.defineProperty(window, "scrollTo", {
  value: jest.fn(),
  writable: true,
});

class IOStub {
  constructor(cb: any) {
    this._cb = cb;
  }
  _cb: any;
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
(global as any).IntersectionObserver = IOStub;

// --- React “old JSX transform” 경고만 잠깐 필터 (원인 해결이 안되면 테스트 로그만 조용히)
const warn = console.warn;
console.warn = (...args: any[]) => {
  const msg = String(args[0] ?? "");
  if (msg.includes("outdated JSX transform")) return;
  warn(...args);
};

// RTL act 환경 플래그
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
