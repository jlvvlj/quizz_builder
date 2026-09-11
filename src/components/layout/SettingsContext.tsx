import { createContext, useContext } from 'react';

interface SettingsModalApi {
    isSettingsOpen: boolean;
    openSettings: () => void;
    closeSettings: () => void;
    /** Subscribe to "settings saved" events. Returns an unsubscribe function. */
    onSettingsSaved: (handler: () => void) => () => void;
}

export const SettingsContext = createContext<SettingsModalApi>({
    isSettingsOpen: false,
    openSettings: () => {},
    closeSettings: () => {},
    onSettingsSaved: () => () => {},
});

export function useSettingsModal(): SettingsModalApi {
    return useContext(SettingsContext);
}
