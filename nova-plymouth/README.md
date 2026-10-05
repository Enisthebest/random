# NOVA boot + shutdown animation

A Plymouth theme (the standard Linux boot splash), tested with the real Plymouth renderer. `preview-real-plymouth.mp4` is a recording of it.

- **Boot:** black, the NOVA star fades in and grows (0.9 s), a soft glow breathes behind it. A thin progress line appears only if booting takes over 3 s.
- **Disk password** (encrypted disk): the star moves up, "Enter your disk password" and a round field with dots.
- **Shutdown / reboot:** the star is there right away and slowly dims.
- Scales to any screen (1080p, 1440p, 4K).

## Install (Arch)

```
sh install.sh
```

Then, **carefully** (a mistake here can stop the PC from booting, so make a backup first and ask Claude to check):

1. `/etc/mkinitcpio.conf` → `HOOKS=(...)`: add `plymouth` after `udev` (or after `systemd`). If the disk is encrypted, `plymouth` must come **before** `encrypt` / `sd-encrypt`. Then `sudo mkinitcpio -P`.
2. Kernel command line: add `quiet splash`.
   - GRUB: `/etc/default/grub` → `GRUB_CMDLINE_LINUX_DEFAULT="... quiet splash"`, then `sudo grub-mkconfig -o /boot/grub/grub.cfg`.
   - systemd-boot: add `quiet splash` to the `options` line in `/boot/loader/entries/*.conf`.
3. Reboot.

## Desktop side (so it all feels like one animation)

- **Login:** the desktop fades in from black (400 ms), the top bar slides down and the dock slides up (250 ms each, 100 ms apart).
- **Shut down / restart from the power menu:** the bar and dock slide away, the desktop fades to black with the star in the middle (600 ms), *then* `systemctl poweroff`. Plymouth's shutdown screen picks up from the same black + star, so it looks seamless.

## Fonts

The password text uses the system "Sans" font inside the initramfs. To use Geist there, add the font file to the initramfs (`FILES=` in mkinitcpio.conf) and change `"Sans "` to `"Geist "` in `nova.script`.
