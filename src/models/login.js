import { routerRedux } from 'dva/router';
import { getFakeCaptcha, login } from '@/services/api';
import { setAuthority, setKeyStore } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      yield call(login, { publicKey: payload.keyStore.publicKey });
      yield put({
        type: 'changeLoginStatus',
        payload,
      });

      // Login successfully and redirect
      if (payload.status === 'ok') {
        reloadAuthorized();
        const urlParams = new URL(window.location.href);
        // console.log('redirect', redirect);
        yield put(routerRedux.replace('/'));
      }
    },

    *getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },

    *logout(_, { put }) {
      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
          currentAuthority: '',
        },
      });
      reloadAuthorized();
      yield put(
        routerRedux.push({
          pathname: '/user/login',
        })
      );
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setKeyStore(payload.keyStore);
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        state: payload.state,
        type: payload.type,
      };
    },
  },
};
