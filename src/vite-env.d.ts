/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface Window {
  ReactNativeWebView?: ReactNativeWebView;
  receiveMessageFromApp?: (message: string) => void;
}
