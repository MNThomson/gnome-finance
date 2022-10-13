install:
	cp -r gnomefinance@mnt.dev ~/.local/share/gnome-shell/extensions/
	killall -3 gnome-shell

logs:
	journalctl -f -o cat /usr/bin/gnome-shell
