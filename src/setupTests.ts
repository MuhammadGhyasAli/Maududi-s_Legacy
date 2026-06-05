import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock Response for jsdom
if (typeof Response === 'undefined') {
  class ResponseMock {
    status: number;
    ok: boolean;
    headers: Map<string, string>;
    constructor(public body: any, init?: ResponseInit & { headers?: Record<string, string> }) {
      this.status = init?.status || 200;
      this.ok = this.status >= 200 && this.status < 300;
      this.headers = new Map(Object.entries(init?.headers || {}));
    }
    json() { return Promise.resolve(JSON.parse(this.body)); }
    text() { return Promise.resolve(String(this.body)); }
  }
  (global as any).Response = ResponseMock;
}

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});
