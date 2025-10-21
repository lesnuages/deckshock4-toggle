import Logger from '../logger';
import { findModuleExport } from '../webpack';
export var SideMenu;
(function (SideMenu) {
    SideMenu[SideMenu["None"] = 0] = "None";
    SideMenu[SideMenu["Main"] = 1] = "Main";
    SideMenu[SideMenu["QuickAccess"] = 2] = "QuickAccess";
})(SideMenu || (SideMenu = {}));
export var QuickAccessTab;
(function (QuickAccessTab) {
    QuickAccessTab[QuickAccessTab["Notifications"] = 0] = "Notifications";
    QuickAccessTab[QuickAccessTab["RemotePlayTogetherControls"] = 1] = "RemotePlayTogetherControls";
    QuickAccessTab[QuickAccessTab["VoiceChat"] = 2] = "VoiceChat";
    QuickAccessTab[QuickAccessTab["Friends"] = 3] = "Friends";
    QuickAccessTab[QuickAccessTab["Settings"] = 4] = "Settings";
    QuickAccessTab[QuickAccessTab["Perf"] = 5] = "Perf";
    QuickAccessTab[QuickAccessTab["Help"] = 6] = "Help";
    QuickAccessTab[QuickAccessTab["Music"] = 7] = "Music";
    QuickAccessTab[QuickAccessTab["Decky"] = 999] = "Decky";
})(QuickAccessTab || (QuickAccessTab = {}));
export var DisplayStatus;
(function (DisplayStatus) {
    DisplayStatus[DisplayStatus["Invalid"] = 0] = "Invalid";
    DisplayStatus[DisplayStatus["Launching"] = 1] = "Launching";
    DisplayStatus[DisplayStatus["Uninstalling"] = 2] = "Uninstalling";
    DisplayStatus[DisplayStatus["Installing"] = 3] = "Installing";
    DisplayStatus[DisplayStatus["Running"] = 4] = "Running";
    DisplayStatus[DisplayStatus["Validating"] = 5] = "Validating";
    DisplayStatus[DisplayStatus["Updating"] = 6] = "Updating";
    DisplayStatus[DisplayStatus["Downloading"] = 7] = "Downloading";
    DisplayStatus[DisplayStatus["Synchronizing"] = 8] = "Synchronizing";
    DisplayStatus[DisplayStatus["ReadyToInstall"] = 9] = "ReadyToInstall";
    DisplayStatus[DisplayStatus["ReadyToPreload"] = 10] = "ReadyToPreload";
    DisplayStatus[DisplayStatus["ReadyToLaunch"] = 11] = "ReadyToLaunch";
    DisplayStatus[DisplayStatus["RegionRestricted"] = 12] = "RegionRestricted";
    DisplayStatus[DisplayStatus["PresaleOnly"] = 13] = "PresaleOnly";
    DisplayStatus[DisplayStatus["InvalidPlatform"] = 14] = "InvalidPlatform";
    DisplayStatus[DisplayStatus["PreloadComplete"] = 16] = "PreloadComplete";
    DisplayStatus[DisplayStatus["BorrowerLocked"] = 17] = "BorrowerLocked";
    DisplayStatus[DisplayStatus["UpdatePaused"] = 18] = "UpdatePaused";
    DisplayStatus[DisplayStatus["UpdateQueued"] = 19] = "UpdateQueued";
    DisplayStatus[DisplayStatus["UpdateRequired"] = 20] = "UpdateRequired";
    DisplayStatus[DisplayStatus["UpdateDisabled"] = 21] = "UpdateDisabled";
    DisplayStatus[DisplayStatus["DownloadPaused"] = 22] = "DownloadPaused";
    DisplayStatus[DisplayStatus["DownloadQueued"] = 23] = "DownloadQueued";
    DisplayStatus[DisplayStatus["DownloadRequired"] = 24] = "DownloadRequired";
    DisplayStatus[DisplayStatus["DownloadDisabled"] = 25] = "DownloadDisabled";
    DisplayStatus[DisplayStatus["LicensePending"] = 26] = "LicensePending";
    DisplayStatus[DisplayStatus["LicenseExpired"] = 27] = "LicenseExpired";
    DisplayStatus[DisplayStatus["AvailForFree"] = 28] = "AvailForFree";
    DisplayStatus[DisplayStatus["AvailToBorrow"] = 29] = "AvailToBorrow";
    DisplayStatus[DisplayStatus["AvailGuestPass"] = 30] = "AvailGuestPass";
    DisplayStatus[DisplayStatus["Purchase"] = 31] = "Purchase";
    DisplayStatus[DisplayStatus["Unavailable"] = 32] = "Unavailable";
    DisplayStatus[DisplayStatus["NotLaunchable"] = 33] = "NotLaunchable";
    DisplayStatus[DisplayStatus["CloudError"] = 34] = "CloudError";
    DisplayStatus[DisplayStatus["CloudOutOfDate"] = 35] = "CloudOutOfDate";
    DisplayStatus[DisplayStatus["Terminating"] = 36] = "Terminating";
})(DisplayStatus || (DisplayStatus = {}));
export const Router = findModuleExport((e) => e.Navigate && e.NavigationManager);
export let Navigation = {};
const logger = new Logger("Navigation");
try {
    function createNavigationFunction(fncName, handler) {
        return (...args) => {
            let win;
            try {
                win = window.SteamUIStore.GetFocusedWindowInstance();
            }
            catch (e) {
                logger.warn("Navigation interface failed to call GetFocusedWindowInstance", e);
            }
            if (!win) {
                logger.warn("Navigation interface could not find any focused window. Falling back to GamepadUIMainWindowInstance");
                win = Router.WindowStore?.GamepadUIMainWindowInstance;
            }
            if (win) {
                try {
                    const thisObj = handler && handler(win);
                    (thisObj || win)[fncName](...args);
                }
                catch (e) {
                    logger.error("Navigation handler failed", e);
                }
            }
            else {
                logger.error("Navigation interface could not find a window to navigate");
            }
        };
    }
    const newNavigation = {
        Navigate: createNavigationFunction("Navigate"),
        NavigateBack: createNavigationFunction("NavigateBack"),
        NavigateToAppProperties: createNavigationFunction("AppProperties", win => win.Navigator),
        NavigateToExternalWeb: createNavigationFunction("ExternalWeb", win => win.Navigator),
        NavigateToInvites: createNavigationFunction("Invites", win => win.Navigator),
        NavigateToChat: createNavigationFunction("Chat", win => win.Navigator),
        NavigateToLibraryTab: createNavigationFunction("LibraryTab", win => win.Navigator),
        NavigateToLayoutPreview: Router.NavigateToLayoutPreview?.bind(Router),
        NavigateToSteamWeb: createNavigationFunction("NavigateToSteamWeb"),
        OpenSideMenu: createNavigationFunction("OpenSideMenu", win => win.MenuStore),
        OpenQuickAccessMenu: createNavigationFunction("OpenQuickAccessMenu", win => win.MenuStore),
        OpenMainMenu: createNavigationFunction("OpenMainMenu", win => win.MenuStore),
        CloseSideMenus: createNavigationFunction("CloseSideMenus", win => win.MenuStore),
        OpenPowerMenu: Router.OpenPowerMenu?.bind(Router),
    };
    Object.assign(Navigation, newNavigation);
}
catch (e) {
    logger.error('Error initializing Navigation interface', e);
}
