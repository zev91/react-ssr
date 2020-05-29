import React from 'react';
const { renderToString } = require('react-dom/server');
import { Provider } from "react-redux";
import { ServerStyleSheets, ThemeProvider } from '@material-ui/core/styles';
import { matchRoute } from '../../router';
import getAssets from '../../../server/common/assets';
import getStaticRoutes from '../middlewares/get-static-routes';
import { encrypt } from '../../utils/helper';
import shouldSsrList from '../../share/should-ssr-list';

import { StaticRouter, Route } from 'react-router';
import App from '../../client/app/index';
import getStore from '../../share/store';

import theme from '../../share/theme';

import StyleContext from 'isomorphic-style-loader/StyleContext';

const assetsMap = getAssets();

const shouldSsr = path => ['/login','/register'].indexOf(path) === -1;

export default async (req) => {
  try{
    let staticRoutes = await getStaticRoutes();
    let targetRoute = matchRoute(req.path, staticRoutes);
    let template;
    let fetchDataFn = targetRoute ? targetRoute.component.getInitialProps : null;
    let fetchResult = {};
    const store = getStore();
  
    if (fetchDataFn) {
      fetchResult = await fetchDataFn({ store });
    }
  
    if(shouldSsr(req.path)){
      for (let key in shouldSsrList) {
        fetchResult[key] = await shouldSsrList[key].getInitialProps({ store })
      }
    }
  
    let { page } = fetchResult || {};
  
    let tdk = {
      title: '默认标题',
      keywords: '默认关键词',
      description: '默认描述'
    };
  
    if (page && page.tdk) {
      tdk = page.tdk;
    }

    const context = {
      initialData: encrypt(store.getState())
    };
    const css = new Set();
    const insertCss = (...styles) => styles.forEach(style => css.add(style._getContent()));
    const sheets = new ServerStyleSheets();
    const html = renderToString(
      sheets.collect(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <StaticRouter location={req.path} context={context}>
              <StyleContext.Provider value={{ insertCss }} >
                <App routeList={staticRoutes}></App>
              </StyleContext.Provider>
            </StaticRouter>
          </Provider>
        </ThemeProvider>
      ));
  
    const materialCss = sheets.toString();
    const styles = [];
    [...css].forEach(item => {
      let [mid, content] = item[0];
      styles.push(`<style id="s${mid}-0">${content}</style>`)
    });
  
    template = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${tdk.title}</title>
        <meta name="keywords" content="${tdk.keywords}" />
        <meta name="description" content="${tdk.description}" />
       
        ${styles.join('')}
        <style id="jss-server-side">${materialCss}</style>
        <link rel="shortcut icon" href="https://simplog-cdn.oss-cn-shanghai.aliyuncs.com/system/favicon.ico">
      </head>
      <body>
        <!--react-ssr-outlet-->
      </body>
      ${assetsMap.js.join('')}
      <script>
        (function(window){var svgSprite='<svg><symbol id="icon-loading" viewBox="0 0 1024 1024"><path d="M960 447.008q-11.008-152.992-120-261.504t-260.992-120.512q-16-0.992-27.488 9.504t-11.488 26.496q0 14.016 9.504 24.512t23.488 11.488q55.008 4 107.008 26.016 60.992 26.016 108.992 73.504t74.016 109.504q22.016 51.008 26.016 106.016 0.992 14.016 11.488 23.488t24.512 9.504q15.008 0 26.016-11.008 11.008-12 8.992-27.008z"  ></path></symbol><symbol id="icon-check-circle-fill" viewBox="0 0 1024 1024"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m193.5 301.7l-210.6 292c-12.7 17.7-39 17.7-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"  ></path></symbol><symbol id="icon-close-circle-fill" viewBox="0 0 1024 1024"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m165.4 618.2l-66-0.3L512 563.4l-99.3 118.4-66.1 0.3c-4.4 0-8-3.5-8-8 0-1.9 0.7-3.7 1.9-5.2l130.1-155L340.5 359c-1.2-1.5-1.9-3.3-1.9-5.2 0-4.4 3.6-8 8-8l66.1 0.3L512 464.6l99.3-118.4 66-0.3c4.4 0 8 3.5 8 8 0 1.9-0.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"  ></path></symbol><symbol id="icon-info-circle-fill" viewBox="0 0 1024 1024"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272z m-32-344c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"  ></path></symbol><symbol id="icon-warning-circle-fill" viewBox="0 0 1024 1024"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296z m32 440c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"  ></path></symbol></svg>';var script=function(){var scripts=document.getElementsByTagName("script");return scripts[scripts.length-1]}();var shouldInjectCss=script.getAttribute("data-injectcss");var ready=function(fn){if(document.addEventListener){if(~["complete","loaded","interactive"].indexOf(document.readyState)){setTimeout(fn,0)}else{var loadFn=function(){document.removeEventListener("DOMContentLoaded",loadFn,false);fn()};document.addEventListener("DOMContentLoaded",loadFn,false)}}else if(document.attachEvent){IEContentLoaded(window,fn)}function IEContentLoaded(w,fn){var d=w.document,done=false,init=function(){if(!done){done=true;fn()}};var polling=function(){try{d.documentElement.doScroll("left")}catch(e){setTimeout(polling,50);return}init()};polling();d.onreadystatechange=function(){if(d.readyState=="complete"){d.onreadystatechange=null;init()}}}};var before=function(el,target){target.parentNode.insertBefore(el,target)};var prepend=function(el,target){if(target.firstChild){before(el,target.firstChild)}else{target.appendChild(el)}};function appendSvg(){var div,svg;div=document.createElement("div");div.innerHTML=svgSprite;svgSprite=null;svg=div.getElementsByTagName("svg")[0];if(svg){svg.setAttribute("aria-hidden","true");svg.style.position="absolute";svg.style.width=0;svg.style.height=0;svg.style.overflow="hidden";prepend(svg,document.body)}}if(shouldInjectCss&&!window.__iconfont__svg__cssinject__){window.__iconfont__svg__cssinject__=true;try{document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>")}catch(e){console&&console.log(e)}}ready(appendSvg)})(window)
      </script>
    </html>`;
  
    return { html, template, context, store }
  }catch(error){
    console.log(error)
    throw Error(error.message);
  }
  
}
