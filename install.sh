#!/bin/sh
# Nainstaluje lid-awake pro aktuálního uživatele (bez sudo).
set -e
cd "$(dirname "$0")"

install -Dm644 lid-awake.service "$HOME/.config/systemd/user/lid-awake.service"
install -Dm755 lid-awake "$HOME/.local/bin/lid-awake"

ext="$HOME/.local/share/gnome-shell/extensions/lid-awake@local"
mkdir -p "$ext/icons"
install -m644 lid-awake@local/metadata.json lid-awake@local/extension.js "$ext/"
install -m644 lid-awake@local/icons/lid-awake-symbolic.svg "$ext/icons/"

systemctl --user daemon-reload
# Přidá rozšíření do seznamu zapnutých (běžící shell nové rozšíření ještě nezná).
gjs -c "
const {Gio} = imports.gi;
const s = new Gio.Settings({schema_id: 'org.gnome.shell'});
const l = s.get_strv('enabled-extensions');
if (!l.includes('lid-awake@local'))
    s.set_strv('enabled-extensions', [...l, 'lid-awake@local']);

// Klávesová zkratka AltGr+mezerník (AltGr = Level3 = Mod5)
const path = '/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/lid-awake/';
const mk = new Gio.Settings({schema_id: 'org.gnome.settings-daemon.plugins.media-keys'});
const kbs = mk.get_strv('custom-keybindings');
if (!kbs.includes(path))
    mk.set_strv('custom-keybindings', [...kbs, path]);
const kb = new Gio.Settings({schema_id: 'org.gnome.settings-daemon.plugins.media-keys.custom-keybinding', path});
kb.set_string('name', 'Zavřené víko: přepnout');
kb.set_string('command', '$HOME/.local/bin/lid-awake toggle');
kb.set_string('binding', '<Mod5>space');
Gio.Settings.sync();"

echo "Hotovo. Přepínač se v rychlém nastavení objeví po odhlášení a přihlášení."
