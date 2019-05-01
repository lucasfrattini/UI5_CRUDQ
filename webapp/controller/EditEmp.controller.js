sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller, History) {
	"use strict";

	return Controller.extend("capseat.AA_CapSeat.controller.EditEmp", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf capseat.AA_CapSeat.view.EditEmp
		 */
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("EditEmp").attachPatternMatched(this._onObjectMatcher, this);

			var viewModel = new sap.ui.model.json.JSONModel({
				empleadoSelect: []
			});

			this.getView().setModel(viewModel);

		},

		_onObjectMatcher: function (oEvent) {
			var pernr = oEvent.getParameter("arguments").pernr;
			this.buscarEmpleado(pernr);
		},

		buscarEmpleado: function (pernr) {
			var oModel = sap.ui.getCore().getModel("empleados");
			var self = this;

			oModel.read("/ZCAP_SEATSet(Pernr='" + pernr + "')", {
				success: function (oData) {
					self.getView().getModel().setProperty("/empleadoSelect", oData);
					console.log(oData);
				},

				error: function (e) {
					self.getView().byId("formContainer").setBusy(false);
					sap.m.MessageToast.show('Ha ocurrido un error al obtener el empleado');
				}
			});
		},

		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Main", true);
			}
		},

		onGuardar: function () {
			var oModel = sap.ui.getCore().getModel("empleados");
			var self = this;

			var oEntry = {};
			oEntry = this.getView().getModel().getData().empleadoSelect;

			var self = this;

			oModel.update("/ZCAP_SEATSet(Pernr='" + oEntry.Pernr + "')", oEntry, {
				method: "PUT",
				success: function (data) {
					sap.m.MessageToast.show('Empleado modificado con éxito');
					self.onNavBack();
				},
				error: function (e) {
					var response = JSON.parse(e.responseText);
					// sap.m.MessageToast.show(response.error.message.value);
					sap.m.MessageToast.show("Error al modificar el empleado");
				}
			});

			sap.ui.getCore().getEventBus().publish(
				//"Channel",
				"BuscarEmp"
			);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf capseat.AA_CapSeat.view.EditEmp
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf capseat.AA_CapSeat.view.EditEmp
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf capseat.AA_CapSeat.view.EditEmp
		 */
		//	onExit: function() {
		//
		//	}

	});

});