import { findModuleByExport, findModuleExport } from '../webpack';
export const showContextMenu = findModuleExport((e) => typeof e === 'function' && e.toString().includes('GetContextMenuManagerFromWindow(')
    && e.toString().includes('.CreateContextMenuInstance('));
export const Menu = findModuleExport((e) => e?.prototype?.HideIfSubmenu && e?.prototype?.HideMenu);
const MenuGoupModule = findModuleByExport(e => e?.prototype?.Focus && e?.prototype?.OnOKButton && e?.prototype?.render?.toString().includes?.(`"emphasis"==this.props.tone`));
export const MenuGroup = MenuGoupModule && Object.values(MenuGoupModule).find((e) => typeof e == "function" && e?.toString()?.includes("bInGamepadUI:"));
export const MenuItem = findModuleExport((e) => e?.render?.toString()?.includes('bPlayAudio:') || (e?.prototype?.OnOKButton && e?.prototype?.OnMouseEnter));
