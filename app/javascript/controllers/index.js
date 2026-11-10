import { Application } from "@hotwired/stimulus"
import WorkspaceController from "controllers/workspace_controller"
import ScannerMacController from "controllers/scanner_mac_controller"
import ScannerPhoneController from "controllers/scanner_phone_controller"

window.Stimulus = Application.start()
Stimulus.register("workspace", WorkspaceController)
Stimulus.register("scanner-mac", ScannerMacController)
Stimulus.register("scanner-phone", ScannerPhoneController)
