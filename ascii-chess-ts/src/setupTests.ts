import "@testing-library/jest-dom";

class ResizeObserverMock {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.ResizeObserver = ResizeObserverMock as any;

jest.mock("./services/connector", () => ({
  fetchConnections: jest.fn().mockResolvedValue({
    adjacencies: {},
  }),
  fetchGraphdag: jest.fn().mockResolvedValue({
    nodes: [],
    edges: [],
  }),
}));

// Mock scrollTo
Element.prototype.scrollTo = jest.fn() as any;
