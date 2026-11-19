# lid-awake – Zavřené víko

*Manual GNOME toggle that keeps a laptop running with the lid closed (Czech UI).*

Ruční přepínač pro GNOME: notebook se zavřeným víkem běží dál (stahování, buildy,
hudba, servery…). Zapíná se **jen ručně** a po restartu nebo odhlášení je zase vypnutý.

## Co umí

- dlaždice **„Zavřené víko“** v rychlém nastavení (vpravo nahoře) a ikonka v liště, když je zapnuto
- klávesová zkratka **AltGr + mezerník**
- bublina dole na obrazovce (OSD) při každém přepnutí
- příkaz `lid-awake on | off | toggle | status`

## Co přesně dělá, když je zapnuto

- zavření víka notebook neuspí (`systemd-inhibit --what=handle-lid-switch`), obrazovka se jen zamkne
- neuspí se ani po nečinnosti (`gnome-session-inhibit --inhibit suspend`)
- ruční uspání z menu funguje dál

Nemění žádná systémová nastavení a nepotřebuje `sudo`. Celé je to jen zámek, který drží
uživatelská služba `lid-awake.service`. Po jejím zastavení se systém chová přesně jako předtím.

## Požadavky

- GNOME Shell 48 (vyzkoušeno na Debianu 13, Wayland)
- systemd, `gnome-session-inhibit` (balík `gnome-session-bin`), `gjs`

## Instalace

```sh
git clone https://github.com/knespii/lid-awake.git
cd lid-awake
sh install.sh
```

Pak se odhlas a znovu přihlas. Na Waylandu GNOME nové rozšíření jinak nenačte.
Příkaz `lid-awake` a zkratka fungují hned.

## Klávesová zkratka

AltGr + mezerník je v GNOME `<Mod5>space`. Funguje na rozloženích, kde je AltGr klávesa
Level3 (cz, sk, de…). Na americkém rozložení je AltGr obyčejný pravý Alt. Tam si zkratku
změň v *Nastavení → Klávesnice → Klávesové zkratky → Vlastní zkratky*.

## Odinstalace

```sh
sh uninstall.sh
```

## Jak je to poskládané

| Soubor | Co dělá |
|---|---|
| `lid-awake.service` | uživatelská služba, která drží zámky; nemá `[Install]`, takže se nikdy nespustí sama |
| `lid-awake` | příkaz pro terminál a zkratku |
| `lid-awake@local/` | rozšíření GNOME: spouští a zastavuje službu přes D-Bus systemd a sleduje její stav |

Při zamčení obrazovky (třeba po zavření víka) GNOME rozšíření vypne, služba ale běží dál.

## Pozor

Zapnutý notebook v batohu se může přehřát a vybít.

## Licence

[MIT](LICENSE)
