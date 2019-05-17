sap.ui.define([
	'sap/m/MessageBox',
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment"
], function (MessageBox, Controller, Fragment) {
	"use strict";

	return Controller.extend("capseat.AA_CapSeat.controller.Main", {
		onInit: function () {
			// Ruta del oData
			var oModel = new sap.ui.model.odata.v2.ODataModel(
				"/sap/opu/odata/sap/ZLFL_ODATA_SRV");
			sap.ui.getCore().setModel(oModel, "empleados");

			var viewModel = new sap.ui.model.json.JSONModel({
				empleados: []
			});

			this.getView().setModel(viewModel);
			this.obtenerEmpleados();

			sap.ui.getCore().getEventBus().subscribe(
				//"Channel",
				"BuscarEmp",
				this.obtenerEmpleados,
				this
			);

		},

		obtenerEmpleados: function () {
			var oModel = sap.ui.getCore().getModel("empleados");
			var self = this;
			oModel.read("/ZCAP_SEATSet", {
				success: function (oData) {
					self.getView().getModel().setProperty("/empleados", oData.results);
				},
				error: function (e) {
					console.log(e);
				}
			});
		},

		agregarEmpleado: function () {
			var oModel = sap.ui.getCore().getModel("empleados");
			var oEntry = {};
			var self = this;
			oEntry.Pernr = this.getView().byId("inputLegajo").getValue();
			oEntry.Vorna = this.getView().byId("inputNombre").getValue();
			oEntry.Nachn = this.getView().byId("inputApellido01").getValue();
			oEntry.Nach2 = this.getView().byId("inputApellido02").getValue();

			if (oEntry.Pernr == "" || oEntry.Vorna == "" || oEntry.Nachn == "") {
				this.showMessage("Complete todos los campos obligatorios");
				return;
			}

			//Si no requiere aprobación
			if (!this.getView().byId("checkWF").getSelected()) {
				oModel.create('/ZCAP_SEATSet', oEntry, {
					success: function (oData, oResponse) {
						self.showMessage("Empleado creado correctamente");
						self.obtenerEmpleados();
						self.limpiarCampo("inputLegajo");
						self.limpiarCampo("inputNombre");
						self.limpiarCampo("inputApellido01");
						self.limpiarCampo("inputApellido02");
					},
					error: function (err, oResponse) {

					}
				});
			} else {
				this._startWf(oEntry);
			}
		},

		borrarEmpleado: function (pernr) {
			var oModel = sap.ui.getCore().getModel("empleados");
			var self = this;
			var delurl = "/ZCAP_SEATSet(Pernr='" + pernr + "')";

			oModel.remove(delurl, {
				success: function (oData, oResponse) {
					self.obtenerEmpleados();
					self.showMessage("Empleado borrado correctamente");
				},
				error: function (err, oResponse) {
					self.showMessage("Error al borrar el empleado seleccionado");
				}
			});
		},

		actualizarEmpleado: function () {
			var pernr = this.getEmpleadoSelect();
			this.getOwnerComponent().getRouter().navTo("EditEmp", {
				pernr: pernr
			});
		},

		getEmpleadoSelect: function () {
			var aItems = this.getView().byId("tablaEmpleados").getItems();
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].getSelected()) {
					return aItems[i].getCells()[0].getText();
				}
			}
		},

		confirmarBorrar: function (oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var self = this;
			var pernr = this.getEmpleadoSelect();
			if (pernr === undefined) {
				this.showMessage("Debe seleccionar el empleado a borrar");
				return;
			}
			MessageBox.confirm(
				"Confirma elimiar el empleado " + pernr + "?", {
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						if (sAction == 'OK') {
							self.borrarEmpleado(pernr);
						}
					}
				}
			);
		},

		showMessage: function (msg) {
			sap.m.MessageToast.show(msg);
		},

		limpiarCampo: function (id) {
			this.getView().byId(id).setValue("");
		},

		// Taken mostly straight out of the "Book Approval" tutorial for now
		_startWf: function (oEntry) {
			var token = this._fetchToken();
			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/workflow-instances",
				method: "POST",
				async: false,
				contentType: "application/json",
				headers: {
					"X-CSRF-Token": token
				},
				data: JSON.stringify({
					definitionId: "wfempleados",
					context: {
						ZCAP_SEAT: {
							input: {},
							output: {},
							pernr: oEntry.Pernr,
							nombre: oEntry.Vorna,
							apellido01: oEntry.Nachn,
							apellido02: oEntry.Nach2
						}
					}
				}),
				success: function (result, xhr, data) {
					console.log(result);
				}
			});
		},

		_fetchToken: function () {
			var token;
			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/xsrf-token",
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function (result, xhr, data) {
					token = data.getResponseHeader("X-CSRF-Token");
					console.log(data.getResponseHeader("X-CSRF-Token"));
				}
			});
			return token;
		},

		_refreshTask: function (taskId) {
			this.getComponentData().startupParameters.inboxAPI.updateTask("NA", taskId);
		},

		onModoEdicion: function (oEvent) {
			if (this.getView().byId("panelEdit").getExpanded()) {
				this.getView().byId("tablaEmpleados").setMode("SingleSelectLeft");
			} else {
				this.getView().byId("tablaEmpleados").setMode("None");
			}
		}

	});
});