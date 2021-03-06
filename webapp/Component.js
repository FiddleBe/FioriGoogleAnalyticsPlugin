//Load the Google Analytics library
(function (i, s, o, g, r, a, m) {
	i['GoogleAnalyticsObject'] = r;
	i[r] = i[r] || function () {
		(i[r].q = i[r].q || []).push(arguments)
	}, i[r].l = 1 * new Date();
	a = s.createElement(o), m = s.getElementsByTagName(o)[0];
	a.async = 1;
	a.src = g;
	m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

// <!-- Google Tag Manager -->
// (function (w, d, s, l, i) {
// 	w[l] = w[l] || [];
// 	w[l].push({
// 		'gtm.start': new Date().getTime(),
// 		event: 'gtm.js'
// 	});
// 	var f = d.getElementsByTagName(s)[0],
// 		j = d.createElement(s),
// 		dl = l != 'dataLayer' ? '&l=' + l : '';
// 	j.async = true;
// 	j.src =
// 		'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
// 	f.parentNode.insertBefore(j, f);
// })(window, document, 'script', 'dataLayer', 'GTM-MHH47TZ');
// <!-- End Google Tag Manager -->

sap.ui.define([
	"sap/ui/core/Component",
	"be/wl/fiori/ga/service/HRService"
], function (Component, HRService) {

	return Component.extend("be.wl.fiori.ga.Component", {

		metadata: {
			"manifest": "json"
		},

		init: function () {
			// var rendererPromise = this._getRenderer();
			HRService.setModel(this.getModel("hr"));

			var sAppID = "UA-156997884-1"; //this.getComponentData().config.GA_App

			//Make sure a tracking ID is maintained
			if (sAppID) {
				//Initalize the tracker
				ga('create', sAppID, 'auto');

				// HRService.getUserInfo().then(function (oUserInfo) {
				//Called after the plugin is loaded
				ga('send', 'pageview', {
					'dimension1': this.getSubHash(),
					'dimension2': this.getParams(),
					'dimension3': "007", //oUserInfo.personnel_number,
					'dimension4': "Online", //oUserInfo.personnel_status,
					'dimension5': "1000", //oUserInfo.company_code,
					'dimension6': "Fiori", //oUserInfo.personnel_area,
					'dimension7': "Plugin", //oUserInfo.personnel_subarea,
					'dimension8': "Org", //oUserInfo.organizational_unit,
					'page': this.getHash()
						// 'page': location.pathname + this.cleanHash(location.hash)
				});
				// }.bind(this));

				//Called when the hash is changed
				$(window).hashchange(function () {
					ga('send', 'pageview', {
						'dimension1': this.getSubHash(),
						'dimension2': this.getParams(),
						// 'page': location.pathname + this.cleanHash(location.hash)
						'page': this.getHash()
					});
				}.bind(this));
			}

		},
		getParams: function () {
			var hashSearch = location.hash.substr(location.hash.indexOf("?"));

			if (location.search || hashSearch) {
				return (location.search || hashSearch).substr(1).split("&").filter(function (sParam) {
					return sParam.indexOf("_ga") === -1;
				}).sort().join(" / ");
				// if (params) {
				// 	ga('set', 'dimension1', params);
				// }
			}
			return "";
		},
		getHash: function () {
			var newHash = location.hash;
			if (newHash.indexOf("?") > -1) {
				newHash = location.hash.substr(0, location.hash.indexOf("?"));
			}
			newHash = newHash.indexOf("&") > -1 ? newHash.substr(0, newHash.indexOf("&")) : newHash;
			return newHash;
		},
		getSubHash: function () {
			var paramIdx = location.hash.indexOf("?");
			var subHashIdx = location.hash.indexOf("&");
			var subPath = "";
			if (subHashIdx > -1 && (paramIdx === -1 || subHashIdx < paramIdx)) {
				subPath = location.hash.substr(subHashIdx + 1);
			}
			if (paramIdx > -1 && subPath !== "") {
				subPath = subPath.substr(0, subPath.indexOf("?"));
			}
			return subPath;
			// location.hash.indexOf("&") > -1 ? location.hash.substr(location.hash.indexOf("&") + 1) : ""
		},
		cleanHash: function (sHash) {
			//Remove Guids and numbers from the hash to provide clean data
			//TODO:Remove everything between single quotes
			return sHash.replace(/((\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1})|(\d)/g,
				"");
		},

		/**
		 * Returns the shell renderer instance in a reliable way,
		 * i.e. independent from the initialization time of the plug-in.
		 * This means that the current renderer is returned immediately, if it
		 * is already created (plug-in is loaded after renderer creation) or it
		 * listens to the &quot;rendererCreated&quot; event (plug-in is loaded
		 * before the renderer is created).
		 *
		 *  @returns {object}
		 *      a jQuery promise, resolved with the renderer instance, or
		 *      rejected with an error message.
		 */
		_getRenderer: function () {
			var that = this,
				oDeferred = new jQuery.Deferred(),
				oRenderer;

			that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
			if (!that._oShellContainer) {
				oDeferred.reject(
					"Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			} else {
				oRenderer = that._oShellContainer.getRenderer();
				if (oRenderer) {
					oDeferred.resolve(oRenderer);
				} else {
					// renderer not initialized yet, listen to rendererCreated event
					that._onRendererCreated = function (oEvent) {
						oRenderer = oEvent.getParameter("renderer");
						if (oRenderer) {
							oDeferred.resolve(oRenderer);
						} else {
							oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererLoaded' event.");
						}
					};
					that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
				}
			}
			return oDeferred.promise();
		}
	});
});