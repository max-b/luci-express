//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("uciWirelessInterface", function($compile){
	var plugin_root = $juci.module("wifi").plugin_root; 
	return {
		templateUrl: plugin_root+"/widgets/uci.wireless.interface.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "WifiInterfaceController", 
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("WifiInterfaceController", function($scope, $uci, $tr, gettext, $wireless){
	$scope.errors = []; 
	$scope.showPassword = true; 
	$scope.$on("error", function(ev, err){
		ev.stopPropagation(); 
		$scope.errors.push(err); 
	}); 
	$scope.keyChoices = [
		{label: gettext("Key") + " #1", value: 1},
		{label: gettext("Key") + " #2", value: 2},
		{label: gettext("Key") + " #3", value: 3},
		{label: gettext("Key") + " #4", value: 4}
	];
	$scope.psk2_ciphers = [
		{label: gettext("Auto"), value: "auto"},
		{label: gettext("CCMP (AES)"), value: "ccmp"}
	]; 
	$scope.mixed_psk_ciphers = [
		{label: gettext("Auto"), value: "auto"},
		{label: gettext("CCMP (AES)"), value: "ccmp"},
		{label: gettext("TKIP/CCMP (AES)"), value: "ccmp"}
	];  
	$wireless.getDevices().done(function(devices){
		$scope.devices = devices.map(function(x){
			return { label: x[".frequency"], value: x[".name"] }; 
		}); 
		$scope.$apply(); 
	}); 
	$scope.$watch("interface", function(value){
		if(!value) return; 
		try {
			$scope.cryptoChoices = $scope.interface.encryption.schema.allow.map(function(x){
				return { label: $tr("wifi.enc."+x), value: x };
			}); 
		} catch(e) {} 
		$scope.title = "wifi-iface.name="+$scope.interface[".name"]; 
	});
	$scope.$watch("interface.closed.value", function(value, oldvalue){
		if(!$scope.interface) return; 
		if(value && value != oldvalue){
			if($scope.interface.wps_pbc.value && !confirm(gettext("If you disable SSID broadcasting, WPS function will be disabled as well. You will need to enable it manually later. Are you sure you want to continue?"))){
				setTimeout(function(){
					$scope.interface.closed.value = oldvalue; 
					$scope.$apply(); 
				},0); 
			} else {
				$scope.interface.wps_pbc.value = false; 
			}
		}
	}); 
	
	$scope.onEncryptionChanged = function(value, oldvalue){
		if(!$scope.interface) return; 
		switch(value){
			case "none": {
				if(oldvalue && value != oldvalue){
					if(!confirm("WARNING: Disabling encryption on your router will severely degrade your security. Are you sure you want to disable encryption on this interface?")){
						setTimeout(function(){
							$scope.interface.encryption.value = oldvalue; 
							$scope.$apply(); 
						},0); 
					}
				}
				break; 
			}
			case "wep": 
			case "wep-shared": {
				if($scope.interface.wps_pbc.value && !confirm(gettext("WPS will be disabled when using WEP encryption. Are you sure you want to continue?"))){
					setTimeout(function(){
						$scope.interface.encryption.value = oldvalue; 
						$scope.$apply(); 
					},0); 
				} else {
					$scope.interface.wps_pbc.value = false; 
				}
				break; 
			}
			case "mixed-psk": {
				$wireless.getInfo().done(function(info){
					$scope.interface.key.value = info.wpa_key; 
					$scope.$apply(); 
				}); 
				if(!$scope.mixed_psk_ciphers.find(function(i){ return i.value == $scope.interface.cipher.value}))
					$scope.interface.cipher.value = "ccmp"; 
				break; 
			}
			case "psk2": {
				$wireless.getInfo().done(function(info){
					$scope.interface.key.value = info.wpa_key; 
					$scope.$apply(); 
				}); 
				if(!$scope.psk2_ciphers.find(function(i){ return i.value == $scope.interface.cipher.value}))
					$scope.interface.cipher.value = "ccmp"; 
				break; 
			}
		}; 
	}
	 
	$scope.onPreApply = function(){
		$scope.errors.length = 0; 
	}
	$scope.toggleShowPassword = function(){
		$scope.showPassword = !$scope.showPassword; 
	}
}); 
