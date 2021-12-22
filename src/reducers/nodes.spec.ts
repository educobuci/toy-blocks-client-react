import mockFetch from "cross-fetch";
import reducer, { checkNodeStatus, loadNodeBlocks } from "./nodes";
import { Block, Node } from "../types/Node";
import initialState from "./initialState";

jest.mock("cross-fetch");

const mockedFech: jest.Mock<unknown> = mockFetch as any;

describe("Reducers::Nodes", () => {
  const getInitialState = () => {
    return initialState().nodes;
  };

  const nodeA: Node = {
    url: "http://localhost:3002",
    online: false,
    name: "Node 1",
    loading: false,
  };

  const nodeB = {
    url: "http://localhost:3003",
    online: false,
    name: "Node 2",
    loading: false,
  };

  const nodeC = {
    url: "http://localhost:3004",
    online: true,
    name: "Node 3",
    loading: true,
  };

  const nodeCBlocks: Block[] = [{ index: 1, data: 'this is a block' }]

  it("should set initial state by default", () => {
    const action = { type: "unknown" };
    const expected = getInitialState();

    expect(reducer(undefined, action)).toEqual(expected);
  });

  it("should handle checkNodeStatus.pending", () => {
    const appState = {
      list: [nodeA, nodeB],
    };
    const action = { type: checkNodeStatus.pending, meta: { arg: nodeA } };
    const expected = {
      list: [
        {
          ...nodeA,
          loading: true,
        },
        nodeB,
      ],
    };

    expect(reducer(appState, action)).toEqual(expected);
  });

  it("should handle checkNodeStatus.fulfilled", () => {
    const appState = {
      list: [nodeA, nodeB],
    };
    const action = {
      type: checkNodeStatus.fulfilled,
      meta: { arg: nodeA },
      payload: { node_name: "alpha" },
    };
    const expected = {
      list: [
        {
          ...nodeA,
          online: true,
          name: "alpha",
          loading: false,
        },
        nodeB,
      ],
    };

    expect(reducer(appState, action)).toEqual(expected);
  });

  it("should handle checkNodeStatus.rejected", () => {
    const appState = {
      list: [
        {
          ...nodeA,
          online: true,
          name: "alpha",
          loading: false,
        },
        nodeB,
      ],
    };
    const action = { type: checkNodeStatus.rejected, meta: { arg: nodeA } };
    const expected = {
      list: [
        {
          ...nodeA,
          online: false,
          name: "alpha",
          loading: false,
        },
        nodeB,
      ],
    };
    expect(reducer(appState, action)).toEqual(expected);
  });

  it("should handle loadNodeBlocks.pending", () => {
    const appState = {
      list: [nodeC],
    };
    const action = { type: loadNodeBlocks.pending, meta: { arg: nodeC } };
    const expected = {
      list: [
        {
          ...nodeC,
          loadingBlocks: true,
        }
      ],
    };

    expect(reducer(appState, action)).toEqual(expected);
  })

  it("should handle loadNodeBlocks.fulfilled", () => {
    const appState = {
      list: [nodeC],
    };
    const action = { type: loadNodeBlocks.fulfilled, meta: { arg: nodeC }, payload: nodeCBlocks };
    const expected = {
      list: [
        {
          ...nodeC,
          loadingBlocks: false,
          blocks: nodeCBlocks
        }
      ],
    };

    expect(reducer(appState, action)).toEqual(expected);
  })

  it("should handle loadNodeBlocks.rejected", () => {
    const appState = {
      list: [nodeC],
    };
    const action = { type: loadNodeBlocks.rejected, meta: { arg: nodeC } };
    const expected = {
      list: [
        {
          ...nodeC,
          loadingBlocks: false,
        }
      ],
    };

    expect(reducer(appState, action)).toEqual(expected);
  })
});

describe("Actions::Nodes", () => {
  const dispatch = jest.fn();

  afterAll(() => {
    dispatch.mockClear();
    mockedFech.mockClear();
  });

  const node: Node = {
    url: "http://localhost:3002",
    online: false,
    name: "Node 1",
    loading: false,
  };

  it("should fetch the node status", async () => {
    mockedFech.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        json() {
          return Promise.resolve({ node_name: "Secret Lowlands" });
        },
      })
    );
    await checkNodeStatus(node)(dispatch, () => {}, {});

    const expected = expect.arrayContaining([
      expect.objectContaining({
        type: checkNodeStatus.pending.type,
        meta: expect.objectContaining({ arg: node }),
      }),
      expect.objectContaining({
        type: checkNodeStatus.fulfilled.type,
        meta: expect.objectContaining({ arg: node }),
        payload: { node_name: "Secret Lowlands" },
      }),
    ]);
    expect(dispatch.mock.calls.flat()).toEqual(expected);
  });

  it("should fail to fetch the node status", async () => {
    mockedFech.mockReturnValueOnce(Promise.reject(new Error("Network Error")));
    await checkNodeStatus(node)(dispatch, () => {}, {});
    const expected = expect.arrayContaining([
      expect.objectContaining({
        type: checkNodeStatus.pending.type,
        meta: expect.objectContaining({ arg: node }),
      }),
      expect.objectContaining({
        type: checkNodeStatus.rejected.type,
        meta: expect.objectContaining({ arg: node }),
        error: expect.objectContaining({ message: "Network Error" }),
      }),
    ]);

    expect(dispatch.mock.calls.flat()).toEqual(expected);
  });

  it("should fetch the node blocks", async () => {
    mockedFech.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        json() {
          return Promise.resolve({
            "data": [
              {
                "attributes": {
                  "index": 1,
                  "data": "The Human Torch",
                }
              },
              {
                "attributes": {
                  "index": 2,
                  "data": "is denied",
                }
            }]
          });
        },
      })
    );
    await loadNodeBlocks(node)(dispatch, () => {}, {});

    const expected = expect.arrayContaining([
      expect.objectContaining({
        type: loadNodeBlocks.pending.type,
        meta: expect.objectContaining({ arg: node }),
      }),
      expect.objectContaining({
        type: loadNodeBlocks.fulfilled.type,
        meta: expect.objectContaining({ arg: node }),
        payload: [
          { index: 1, data: 'The Human Torch' },
          { index: 2, data: 'is denied' }
        ],
      }),
    ]);
    expect(dispatch.mock.calls.flat()).toEqual(expected);
  });

  it("should fail to fetch the node blocks", async () => {
    mockedFech.mockReturnValueOnce(Promise.reject(new Error("Network Error")));
    await loadNodeBlocks(node)(dispatch, () => {}, {});
    const expected = expect.arrayContaining([
      expect.objectContaining({
        type: loadNodeBlocks.pending.type,
        meta: expect.objectContaining({ arg: node }),
      }),
      expect.objectContaining({
        type: loadNodeBlocks.rejected.type,
        meta: expect.objectContaining({ arg: node }),
        error: expect.objectContaining({ message: "Network Error" }),
      }),
    ]);

    expect(dispatch.mock.calls.flat()).toEqual(expected);
  });
});
