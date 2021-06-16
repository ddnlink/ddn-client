import { queryAccount, postTransaction } from '@/services/api';

const initialState = {
  currentAccount: {},
  latestBlock: {},
  version: {},
};

export default {
  namespace: 'user',

  state: { ...initialState },

  effects: {
    *fetchAccount({ payload }, { call, put }) {
      const response = yield call(queryAccount, payload);
      yield put({
        type: 'saveAccount',
        payload: response,
      });
    },
    *fetchLock({ payload, callback }, { call }) {
      // console.log('payload', payload);
      const response = yield call(postTransaction, payload);
      // console.log('response', response);
      callback(response);
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname }) => {
        if (pathname === '/users') {
          dispatch({
            type: 'users/fetchAccount',
          });
        }
      });
    },
  },
  reducers: {
    saveAccount(state, action) {
      return {
        ...state,
        currentAccount: action.payload.account,
        latestBlock: action.payload.latestBlock,
        version: action.payload.version,
      };
    },
  },
};
