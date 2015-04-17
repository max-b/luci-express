#
# Copyright (C) 2013 Jo-Philipp Wich <jow@openwrt.org>
#
# Licensed under the Apache License, Version 2.0.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=luciexpress
#PKG_VERSION:=$(shell git --git-dir=$(CURDIR)/../.git log -1 --pretty="%ci %h" | awk '{ print $$1 "-" $$4 }')
PKG_VERSION:=2015-02-14-e452ca6
PKG_MAINTAINER:=Martin K. Schröder <mkschreder.uk@gmail.com>

PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=

PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

define Build/Prepare
	$(INSTALL_DIR) $(PKG_BUILD_DIR)
	$(CP) ./src/* $(PKG_BUILD_DIR)/
endef

define Package/luciexpress
  SECTION:=luciexpress
  CATEGORY:=LuCIexpress
  TITLE:=LuCIexpress UI
  DEPENDS:=+rpcd +rpcd-mod-iwinfo +uhttpd +uhttpd-mod-ubus +libubox +libubus
endef

define Package/luciexpress/description
 Provides the LuCIexpress web interface with standard functionality.
endef

define Package/luciexpress/install
	$(INSTALL_DIR) $(1)/www
	$(CP) ./htdocs/* $(1)/www/
	$(INSTALL_DIR) $(1)/usr/share/rpcd
	$(CP) ./share/* $(1)/usr/share/rpcd/
	$(INSTALL_DIR) $(1)/usr/lib/rpcd
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/rpcd/luciexpress.so $(1)/usr/lib/rpcd/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/rpcd/bwmon.so $(1)/usr/lib/rpcd/
	$(INSTALL_DIR) $(1)/usr/libexec $(1)/www/cgi-bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/io/luciexpress-io $(1)/usr/libexec/
	$(LN) /usr/libexec/luciexpress-io $(1)/www/cgi-bin/luci-upload
	$(LN) /usr/libexec/luciexpress-io $(1)/www/cgi-bin/luci-backup
endef

define Package/luciexpress/postinst
#!/bin/sh

if [ "$$(uci -q get uhttpd.main.ubus_prefix)" != "/ubus" ]; then
	uci set uhttpd.main.ubus_prefix="/ubus"
	uci commit uhttpd
fi

exit 0
endef

$(eval $(call BuildPackage,luciexpress))
