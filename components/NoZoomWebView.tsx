import React from 'react';
import { WebView, WebViewProps } from 'react-native-webview';

const disablePinchZoomJS = `
(function() {
  function disablePinchZoom() {
    document.addEventListener('touchmove', function(event) {
      if (event.scale !== 1) { event.preventDefault(); }
    }, { passive: false });
  }
  disablePinchZoom();
  document.addEventListener('DOMContentLoaded', disablePinchZoom);
})();
true;
`;

const NoZoomWebView: React.FC<WebViewProps> = (props) => {
  return (
    <WebView
      {...props}
      injectedJavaScript={disablePinchZoomJS}
      injectedJavaScriptBeforeContentLoaded={disablePinchZoomJS}
    />
  );
};

export default NoZoomWebView;