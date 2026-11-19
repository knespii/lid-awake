# lid-awake

A manual toggle for GNOME that keeps your laptop running with the lid closed
(downloads, builds, music, servers…). It only turns on **when you switch it on**,
and it's off again after a reboot or logout.

> The user interface is in Czech. The quick settings tile is called **„Zavřené víko“**
> ("Lid closed").

## Features

- a **„Zavřené víko“** tile in Quick Settings (top right), plus a panel icon while it's on
- keyboard shortcut **AltGr + Space**
- an on-screen bubble (OSD) at the bottom of the screen on every toggle
- a `lid-awake on | off | toggle | status` command

## What it does while on

- closing the lid doesn't suspend the laptop (`systemd-inhibit --what=handle-lid-switch`); the screen just locks
- it doesn't suspend after inactivity either (`gnome-session-inhibit --inhibit suspend`)
- manual suspend from the system menu still works

It changes no system settings and needs no `sudo`. Everything is just an inhibitor lock
held by the user service `lid-awake.service`. Once the service stops, the system behaves
exactly as before.

## Requirements

- GNOME Shell 48 (tested on Debian 13, Wayland)
- systemd, `gnome-session-inhibit` (package `gnome-session-bin`), `gjs`

## Installation

```sh
git clone https://github.com/knespii/lid-awake.git
cd lid-awake
sh install.sh
```

Then log out and back in. On Wayland, GNOME won't load a new extension otherwise.
The `lid-awake` command and the shortcut work right away.

## Keyboard shortcut

In GNOME, AltGr + Space is `<Mod5>space`. It works on layouts where AltGr is the Level3
key (cz, sk, de…). On the US layout AltGr is just the right Alt key, so pick another
shortcut in *Settings → Keyboard → Keyboard Shortcuts → Custom Shortcuts*.

## Uninstall

```sh
sh uninstall.sh
```

## How it fits together

| File | What it does |
|---|---|
| `lid-awake.service` | user service that holds the locks; it has no `[Install]` section, so it never starts on its own |
| `lid-awake` | command for the terminal and the shortcut |
| `lid-awake@local/` | GNOME extension: starts and stops the service over systemd's D-Bus API and tracks its state |

When the screen locks (for example after closing the lid), GNOME disables the extension,
but the service keeps running.

## Caution

A running laptop in a bag can overheat and drain its battery.

## License

[MIT](LICENSE)
