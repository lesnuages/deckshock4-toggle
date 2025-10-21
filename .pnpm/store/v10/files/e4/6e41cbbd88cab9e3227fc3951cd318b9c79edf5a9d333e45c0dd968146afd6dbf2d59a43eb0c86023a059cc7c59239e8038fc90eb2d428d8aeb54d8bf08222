// Decky Loader will pass this api in, it's versioned to allow for backwards compatibility.
// @ts-ignore
import _manifest from '@decky/manifest';
export * from "./types";
// Prevents it from being duplicated in output.
const manifest = _manifest;
const API_VERSION = 2;
if (!manifest?.name) {
    throw new Error('[@decky/api]: Failed to find plugin manifest.');
}
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
// Initialize
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
// Version 1 throws on version mismatch so we have to account for that here.
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
// TODO these could use a lot of JSDoc
export const call = api.call;
export const callable = api.callable;
export const addEventListener = api.addEventListener;
export const removeEventListener = api.removeEventListener;
export const routerHook = api.routerHook;
export const toaster = api.toaster;
export const openFilePicker = api.openFilePicker;
export const executeInTab = api.executeInTab;
export const injectCssIntoTab = api.injectCssIntoTab;
export const removeCssFromTab = api.removeCssFromTab;
export const fetchNoCors = api.fetchNoCors;
export const getExternalResourceURL = api.getExternalResourceURL;
/**
 * Returns state indicating the visibility of quick access menu.
 *
 * @returns `true` if quick access menu is visible and `false` otherwise.
 *
 * @example
 * import { FC, useEffect } from "react";
 * import { useQuickAccessVisible } from "@decky/api";
 *
 * export const PluginPanelView: FC<{}> = ({ }) => {
 *   const isVisible = useQuickAccessVisible();
 *
 *   useEffect(() => {
 *     if (!isVisible) {
 *       return;
 *     }
 *
 *     const interval = setInterval(() => console.log("Hello world!"), 1000);
 *     return () => {
 *       clearInterval(interval);
 *     }
 *   }, [isVisible])
 *
 *   return (
 *     <div>
 *       {isVisible ? "VISIBLE" : "INVISIBLE"}
 *     </div>
 *   );
 * };
 */
export const useQuickAccessVisible = api.useQuickAccessVisible;
export const definePlugin = (fn) => {
    return (...args) => {
        // TODO: Maybe wrap this
        return fn(...args);
    };
};
