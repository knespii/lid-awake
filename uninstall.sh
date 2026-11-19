#!/bin/sh
# Odinstaluje lid-awake (služba, příkaz, rozšíření i klávesová zkratka).
set -e

systemctl --user stop lid-awake.service 2>/dev/null || true

gjs -c "
const {Gio} = imports.gi;
const s = new Gio.Settings({schema_id: 'org.gnome.shell'});
s.set_strv('enabled-extensions', s.get_strv('enabled-extensions').filter(u => u !== 'lid-awake@local'));

const path = '/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/lid-awake/';
const mk = new Gio.Settings({schema_id: 'org.gnome.settings-daemon.plugins.media-keys'});
mk.set_strv('custom-keybindings', mk.get_strv('custom-keybindings').filter(p => p !== path));
const kb = new Gio.Settings({schema_id: 'org.gnome.settings-daemon.plugins.media-keys.custom-keybinding', path});
['name', 'command', 'binding'].forEach(k => kb.reset(k));
Gio.Settings.sync();"

rm -f "$HOME/.config/systemd/user/lid-awake.service" "$HOME/.local/bin/lid-awake"
rm -rf "$HOME/.local/share/gnome-shell/extensions/lid-awake@local"
systemctl --user daemon-reload

echo "Odinstalováno."
