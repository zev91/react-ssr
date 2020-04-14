import * as enRedux from 'utils/redux';
const { action, createReducer, injectReducer } = enRedux.default;

const reducerHandler = createReducer();

export const actions = {
  
  getInitialData: action({
    type: 'homePage.getPage',
    action: () => ({
      page:{
        tdk: {
          title: '首页',
          keywords: '前端技术首页',
          description: '前端技术首页'
        }
      }
    }),
    handler: (state, result) => {
      return {
        ...state,
        ...result
      }
    }
  },reducerHandler),
};

injectReducer({ key: 'homePage', reducer: reducerHandler({page:{}})});



