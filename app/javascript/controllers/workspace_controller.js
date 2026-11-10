import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["dropzone", "fileList", "status"]

  connect() {
    this.element.setAttribute("data-zero-upload-verified", "true")
  }

  openTool(event) {
    const toolId = event.currentTarget.dataset.toolId
    if (window.openToolWorkspace) window.openToolWorkspace(toolId)
  }
}
