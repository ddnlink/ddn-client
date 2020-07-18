import { getIssuerByAddress, getAobBalances, getAssetsByIssuer, postTransaction, getAobTransaction } from '@/services/api';

const initialState = {
  issuer: {},
  myAob: {
    list: [],
    count: 0,
  },
  myIssueAob: {
    list: [],
    count: 0,
  },
  transactions: []
}

export default {
  namespace: 'assets',

  state: {...initialState},

  effects: {
    *fetchIssuer({ payload }, { call, put }) {
      const response = yield call(getIssuerByAddress, payload);
      yield put({
        type: 'saveIssuer',
        payload: response,
      });
    },
    *fetchMyAssets({ payload }, { call, put }) {
      const response = yield call(getAssetsByIssuer, payload);
      yield put({
        type: 'saveMyAsset',
        payload: response,
      });
    },
    *getAobList({ payload }, { call, put }) {
      const response = yield call(getAobBalances, payload.address);
      if(response.success && response.balances.length > 0){
        yield put({
          type: 'saveList',
          payload: response,
          action: payload
        });
      }
    },
    *fetchTransaction({ payload }, { call, put }) {
      const response = yield call(getAobTransaction, payload);
      yield put({
        type: 'saveTransactions',
        payload: response,
      });
    },
    *postTrans({ payload, callback }, { call }) {
      const response = yield call(postTransaction, payload);
      callback(response)
    },
  },

  reducers: {
    saveIssuer(state, { payload }) {
      return {
        ...state,
        issuer: payload.issuer || {},
      };
    },
    saveMyAsset(state, { payload }) {
      return {
        ...state,
        myIssueAob: {
          list: payload.assets,
          count: payload.count
        },
      };
    },
    saveTransactions(state, { payload }) {
      console.log("trans payload", payload)
      return {
        ...state,
        transactions: payload.transactions,
      };
    },
    saveList(state, { payload }) {
      return {
        ...state,
        myAob: {
          list: payload.balances,
          count: payload.balances.length,
        },
      };
    },
    reset() {
      return initialState;
    },
  },
};
