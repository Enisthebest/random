#!/bin/sh
# Installs the NOVA boot/shutdown splash (Plymouth theme) on Arch. Run from this folder: sh install.sh
set -e
sudo pacman -S --needed --noconfirm plymouth
sudo rm -rf /usr/share/plymouth/themes/nova
sudo cp -r nova /usr/share/plymouth/themes/nova
sudo plymouth-set-default-theme nova
echo
echo "Theme installed. Two things still need checking (see README.md):"
echo " 1. 'plymouth' must be in HOOKS in /etc/mkinitcpio.conf, then run: sudo mkinitcpio -P"
echo " 2. the kernel command line needs: quiet splash"
grep -q 'plymouth' /etc/mkinitcpio.conf && echo "   -> plymouth hook: found" || echo "   -> plymouth hook: NOT found yet"
grep -q 'splash' /proc/cmdline && echo "   -> splash on the kernel command line: found" || echo "   -> splash on the kernel command line: NOT found yet"
