// Přepínač „Zavřené víko“ v rychlém nastavení GNOME.
// Jen spouští/zastavuje uživatelskou službu lid-awake.service a zobrazuje její stav.
// disable() službu schválně NEzastavuje: GNOME vypíná rozšíření při zamčení
// obrazovky (a ta se zamyká právě při zavření víka).

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {QuickToggle, SystemIndicator} from 'resource:///org/gnome/shell/ui/quickSettings.js';

const UNIT = 'lid-awake.service';
const UNIT_PATH = '/org/freedesktop/systemd1/unit/lid_2dawake_2eservice';

const LidAwakeIndicator = GObject.registerClass(
class LidAwakeIndicator extends SystemIndicator {
    constructor(gicon) {
        super();

        this._indicator = this._addIndicator();
        this._indicator.gicon = gicon;
        this._indicator.visible = false;

        this._toggle = new QuickToggle({title: 'Zavřené víko', gicon});
        this._toggle.connect('clicked', () => this._onClicked());
        this.quickSettingsItems.push(this._toggle);

        this._cancellable = new Gio.Cancellable();
        this._unitProxy = null;
        this._lastOn = null;
        this._sync();

        // systemd posílá změny stavu jednotek jen přihlášeným odběratelům.
        this._callManager('Subscribe', null);

        Gio.DBusProxy.new_for_bus(
            Gio.BusType.SESSION,
            Gio.DBusProxyFlags.GET_INVALIDATED_PROPERTIES,
            null, 'org.freedesktop.systemd1', UNIT_PATH, 'org.freedesktop.systemd1.Unit',
            this._cancellable,
            (_source, res) => {
                try {
                    this._unitProxy = Gio.DBusProxy.new_for_bus_finish(res);
                } catch (e) {
                    if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))
                        console.error(`lid-awake: ${e.message}`);
                    return;
                }
                this._lastOn = this._isOn();
                this._unitProxy.connectObject('g-properties-changed', () => this._sync(), this);
                this._sync();
            });
    }

    _isOn() {
        const state = this._unitProxy?.get_cached_property('ActiveState')?.unpack();
        return state === 'active' || state === 'activating';
    }

    _sync() {
        const on = this._isOn();
        this._toggle.checked = on;
        this._toggle.subtitle = on ? 'Notebook běží dál' : 'Uspí se';
        this._indicator.visible = on;

        // Bublina dole (jako u Caffeine) – jen při skutečné změně,
        // ne při startu shellu nebo po odemčení obrazovky.
        if (this._lastOn !== null && on !== this._lastOn) {
            const label = on ? 'Zavřené víko: notebook poběží dál' : 'Zavřené víko: notebook se uspí';
            Main.osdWindowManager.show(-1, this._indicator.gicon, label, null, null);
        }
        if (this._unitProxy)
            this._lastOn = on;
    }

    _onClicked() {
        const method = this._isOn() ? 'StopUnit' : 'StartUnit';
        this._callManager(method, new GLib.Variant('(ss)', [UNIT, 'replace']));
    }

    _callManager(method, params) {
        Gio.DBus.session.call(
            'org.freedesktop.systemd1', '/org/freedesktop/systemd1',
            'org.freedesktop.systemd1.Manager', method, params, null,
            Gio.DBusCallFlags.NONE, -1, this._cancellable,
            (conn, res) => {
                try {
                    conn.call_finish(res);
                } catch (e) {
                    if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))
                        Main.notifyError('Zavřené víko', e.message);
                }
            });
    }

    destroy() {
        this._cancellable.cancel();
        this._unitProxy?.disconnectObject(this);
        this._unitProxy = null;
        this.quickSettingsItems.forEach(item => item.destroy());
        super.destroy();
    }
});

export default class LidAwakeExtension extends Extension {
    enable() {
        const gicon = Gio.icon_new_for_string(`${this.path}/icons/lid-awake-symbolic.svg`);
        this._indicator = new LidAwakeIndicator(gicon);
        Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}
