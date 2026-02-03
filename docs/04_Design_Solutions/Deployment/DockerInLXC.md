apt-get update

apt-get docker.io

nano /etc/pve/lxc/<CTID>.conf
lxc.apparmor.profile: unconfined
lxc.mount.entry: /dev/null sys/module/apparmor/parameters/enabled none bind 0 0
pct restart <CTID>
